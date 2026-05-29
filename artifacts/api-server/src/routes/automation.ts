/**
 * Automation Admin Routes — Phase 13B/13C
 * GET  /api/admin/automation/status
 * GET  /api/admin/automation/logs
 * POST /api/admin/automation/run
 * POST /api/admin/automation/run/daily-content
 * POST /api/admin/automation/run/notifications
 */

import { Router } from "express";
import { requireAdmin } from "../middlewares/requireAdmin";
import { db } from "@workspace/db";
import { automationLogsTable } from "@workspace/db";
import { desc, eq } from "drizzle-orm";
import { generateDailyContent } from "../lib/dailyContentService";
import {
  runAllScheduledJobs,
  scheduleAppointmentReminders,
  scheduleFinancialReminders,
  scheduleDailyContentNotification,
} from "../lib/notificationSchedulerService";

const router = Router();

const JOB_LABELS: Record<string, string> = {
  daily_content: "رسالة اليوم",
  appointment_reminders: "تذكيرات المواعيد",
  financial_reminders: "تذكيرات مالية",
  daily_content_notification: "إشعار محتوى اليوم",
};

router.get("/admin/automation/status", requireAdmin, async (req, res) => {
  try {
    const allJobs = [
      "daily_content",
      "appointment_reminders",
      "financial_reminders",
      "daily_content_notification",
    ];

    const results = await Promise.all(
      allJobs.map(async (jobName) => {
        const rows = await db
          .select()
          .from(automationLogsTable)
          .where(eq(automationLogsTable.job_name, jobName))
          .orderBy(desc(automationLogsTable.created_at))
          .limit(1);
        return {
          job_name: jobName,
          label: JOB_LABELS[jobName] ?? jobName,
          last_run: rows[0] ?? null,
        };
      }),
    );

    res.json({ status: results });
  } catch (err) {
    req.log.error({ err }, "automation status error");
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

router.get("/admin/automation/logs", requireAdmin, async (req, res) => {
  try {
    const limit = Math.min(Number(req.query["limit"] ?? 50), 200);
    const logs = await db
      .select()
      .from(automationLogsTable)
      .orderBy(desc(automationLogsTable.created_at))
      .limit(limit);
    res.json({ logs });
  } catch (err) {
    req.log.error({ err }, "automation logs error");
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

router.post("/admin/automation/run", requireAdmin, async (req, res) => {
  try {
    const contentResult = await generateDailyContent();
    const notifResult = await runAllScheduledJobs();
    res.json({
      success: true,
      daily_content: contentResult,
      notifications: notifResult,
    });
  } catch (err) {
    req.log.error({ err }, "automation run error");
    res.status(500).json({ error: "خطأ أثناء تشغيل المهام" });
  }
});

router.post("/admin/automation/run/daily-content", requireAdmin, async (req, res) => {
  try {
    const result = await generateDailyContent();
    res.json({ success: true, result });
  } catch (err) {
    req.log.error({ err }, "automation run daily-content error");
    res.status(500).json({ error: "خطأ أثناء إنشاء المحتوى" });
  }
});

router.post("/admin/automation/run/notifications", requireAdmin, async (req, res) => {
  try {
    const [appt, fin, daily] = await Promise.all([
      scheduleAppointmentReminders(),
      scheduleFinancialReminders(),
      scheduleDailyContentNotification(),
    ]);
    res.json({
      success: true,
      appointment_reminders: appt,
      financial_reminders: fin,
      daily_content_notification: daily,
    });
  } catch (err) {
    req.log.error({ err }, "automation run notifications error");
    res.status(500).json({ error: "خطأ أثناء جدولة الإشعارات" });
  }
});

export default router;
