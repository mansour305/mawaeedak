/**
 * Notification Scheduler Service — Phase 13C
 *
 * يولد إشعارات داخلية تلقائية مجدولة:
 * - تذكيرات المواعيد (للمواعيد التي تحتاج تذكير)
 * - تذكيرات الأحداث المالية
 * - إشعار محتوى اليوم (يومي)
 *
 * Idempotent: يستخدم source_key لمنع التكرار.
 * Timezone: Asia/Riyadh
 */

import { db } from "@workspace/db";
import {
  notificationsTable,
  appointmentsTable,
  financialEventsTable,
  automationLogsTable,
} from "@workspace/db";
import { eq, and, gte, lte, isNull, or } from "drizzle-orm";
import { logger } from "./logger";
import { getRiyadhDateString } from "./dailyContentService";

async function notificationExists(sourceKey: string): Promise<boolean> {
  const rows = await db
    .select({ id: notificationsTable.id })
    .from(notificationsTable)
    .where(eq(notificationsTable.source_key, sourceKey))
    .limit(1);
  return rows.length > 0;
}

async function createNotification(params: {
  title: string;
  body: string;
  type: string;
  source_key: string;
}): Promise<boolean> {
  const exists = await notificationExists(params.source_key);
  if (exists) return false;
  await db.insert(notificationsTable).values({
    title: params.title,
    body: params.body,
    type: params.type,
    is_read: false,
    source_key: params.source_key,
  });
  return true;
}

async function logAutomation(
  job_name: string,
  status: string,
  details: string,
  items_created: number,
): Promise<void> {
  try {
    await db.insert(automationLogsTable).values({
      job_name,
      status,
      details,
      items_created,
      run_at: getRiyadhDateString(),
    });
  } catch (e) {
    logger.warn({ err: e }, "[AutoLog] فشل حفظ سجل الأتمتة");
  }
}

/**
 * scheduleAppointmentReminders
 * يُنشئ إشعارات تذكير للمواعيد لليوم الحالي وغد.
 */
export async function scheduleAppointmentReminders(): Promise<number> {
  const today = getRiyadhDateString();
  const tomorrow = getRiyadhDateString(1);
  let created = 0;

  try {
    const appointments = await db
      .select()
      .from(appointmentsTable)
      .where(
        and(
          eq(appointmentsTable.reminder_enabled, true),
          or(
            eq(appointmentsTable.date, today),
            eq(appointmentsTable.date, tomorrow),
          ),
        ),
      );

    for (const appt of appointments) {
      const isToday = appt.date === today;
      const label = isToday ? "اليوم" : "غداً";
      const sourceKey = `appointment_reminder_${appt.id}_${appt.date}`;
      const ok = await createNotification({
        title: `تذكير موعد ${label}`,
        body: `موعد "${appt.title}"${appt.time ? ` الساعة ${appt.time}` : ""} — ${label}`,
        type: "appointment",
        source_key: sourceKey,
      });
      if (ok) created++;
    }

    logger.info({ today, created }, "[NotifScheduler] تذكيرات المواعيد");
    await logAutomation("appointment_reminders", "success", `${today}: ${created} تذكير`, created);
  } catch (err) {
    logger.error({ err }, "[NotifScheduler] فشل تذكيرات المواعيد");
    await logAutomation("appointment_reminders", "failure", String(err), 0);
  }

  return created;
}

/**
 * scheduleFinancialReminders
 * يُنشئ إشعارات تذكير للأحداث المالية القادمة.
 */
export async function scheduleFinancialReminders(): Promise<number> {
  const today = getRiyadhDateString();
  const in7days = getRiyadhDateString(7);
  let created = 0;

  try {
    const events = await db
      .select()
      .from(financialEventsTable)
      .where(
        and(
          eq(financialEventsTable.is_active, true),
          gte(financialEventsTable.next_date, today),
          lte(financialEventsTable.next_date, in7days),
        ),
      );

    for (const event of events) {
      const daysUntil = Math.round(
        (new Date(event.next_date).getTime() - new Date(today).getTime()) /
          86_400_000,
      );

      if (daysUntil > (event.reminder_days_before ?? 3)) continue;

      const label =
        daysUntil === 0 ? "اليوم" : daysUntil === 1 ? "غداً" : `خلال ${daysUntil} أيام`;
      const sourceKey = `financial_reminder_${event.id}_${event.next_date}`;

      const typeMap: Record<string, string> = {
        "راتب": "salary",
        "دعم": "support",
        "فاتورة": "bill",
        "قرض": "bill",
      };
      const notifType = typeMap[event.type] ?? "financial";

      const ok = await createNotification({
        title: `تذكير مالي — ${event.type}`,
        body: `"${event.name}" موعده ${label}${event.amount ? ` — ${Number(event.amount).toLocaleString("ar-SA")} ريال` : ""}`,
        type: notifType,
        source_key: sourceKey,
      });
      if (ok) created++;
    }

    logger.info({ today, created }, "[NotifScheduler] تذكيرات مالية");
    await logAutomation("financial_reminders", "success", `${today}: ${created} تذكير`, created);
  } catch (err) {
    logger.error({ err }, "[NotifScheduler] فشل التذكيرات المالية");
    await logAutomation("financial_reminders", "failure", String(err), 0);
  }

  return created;
}

/**
 * scheduleDailyContentNotification
 * يُنشئ إشعار محتوى اليوم إذا لم يُنشأ فعلاً.
 */
export async function scheduleDailyContentNotification(
  messageText?: string,
): Promise<number> {
  const today = getRiyadhDateString();
  const sourceKey = `daily_content_${today}`;
  try {
    const ok = await createNotification({
      title: "رسالة اليوم",
      body: messageText ?? "رسالتك اليومية جاهزة — تفضّل بالاطلاع عليها.",
      type: "daily_content",
      source_key: sourceKey,
    });
    if (ok) {
      logger.info({ today }, "[NotifScheduler] إشعار محتوى اليوم");
      await logAutomation("daily_content_notification", "success", `إشعار ${today}`, 1);
      return 1;
    }
    await logAutomation("daily_content_notification", "skipped", `موجود ${today}`, 0);
    return 0;
  } catch (err) {
    logger.error({ err }, "[NotifScheduler] فشل إشعار محتوى اليوم");
    await logAutomation("daily_content_notification", "failure", String(err), 0);
    return 0;
  }
}

/**
 * runAllScheduledJobs
 * تشغيل جميع المهام المجدولة دفعة واحدة.
 */
export async function runAllScheduledJobs(): Promise<{
  appointmentReminders: number;
  financialReminders: number;
  dailyContentNotification: number;
}> {
  const [appointmentReminders, financialReminders, dailyContentNotification] =
    await Promise.all([
      scheduleAppointmentReminders(),
      scheduleFinancialReminders(),
      scheduleDailyContentNotification(),
    ]);
  return { appointmentReminders, financialReminders, dailyContentNotification };
}
