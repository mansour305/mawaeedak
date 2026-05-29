/**
 * supabaseData.ts — مواعيدك Phase 12I
 *
 * Supabase Data Adapter — طبقة قراءة + كتابة محدودة.
 *
 * القواعد:
 * - لا تُستخدم كمصدر افتراضي — API/PostgreSQL لا يزال المصدر.
 * - دوال القراءة تُعيد null عند الفشل ولا ترمي exception.
 * - دوال الكتابة تُعيد { success, error } — لا fallback صامت إلى API.
 * - لا تستخدم service_role — anon key فقط.
 * - لا أسرار في الكود — VITE_SUPABASE_ANON_KEY فقط.
 * - user_id يُجلب من session Supabase عند الحاجة.
 * - أي خطأ Supabase لا يكسر Preview.
 *
 * الجداول المدعومة للقراءة:
 *   Admin-managed: daily_messages, story_templates, themes, news, jobs
 *   User-owned:    appointments, financial_events, notifications
 *   Support:       complaints
 *
 * الجداول المدعومة للكتابة (Phase 12I — نطاق محدود):
 *   notifications — mark-read فقط (UPDATE is_read = true WHERE legacy_id = X)
 *
 * قيود Write Cutover:
 *   - mode=api/supabase_shadow: لا كتابة في Supabase (API فقط)
 *   - mode=supabase: mark-read يذهب لـ Supabase
 *   - NotificationsPage تبقى على Orval — Phase 12J (يحتاج read+write معاً)
 *   - الاختبار: /admin/data-layer → "اختبار الكتابة"
 *
 * RLS للـ notifications:
 *   - notifications_update_own: auth.uid() = user_id
 *   - يتطلب session Supabase Auth (hrq@hotmail.com)
 *   - بدون session: يُعيد error مناسباً (لا crash)
 */

import { supabase } from "./supabase";
import type {
  Appointment,
  FinancialEvent,
  Notification,
  DailyMessage,
  Theme,
  StoryTemplate,
  NewsItem,
  Job,
  Complaint,
} from "@workspace/api-client-react";

// ─────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────

function isConnected(): boolean {
  return supabase !== null;
}

async function getCurrentUserId(): Promise<string | null> {
  if (!supabase) return null;
  try {
    const { data } = await supabase.auth.getSession();
    return data.session?.user?.id ?? null;
  } catch {
    return null;
  }
}

// Asia/Riyadh "today" as a local-midnight Date (date boundaries follow KSA).
function riyadhToday(): Date {
  const s = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Riyadh", year: "numeric", month: "2-digit", day: "2-digit",
  }).format(new Date());
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

// Roll a recurring monthly event forward to its next occurrence relative to
// today. Past-due dates advance by whole months (day-of-month preserved and
// clamped to month length) until >= today; future dates are returned unchanged.
// Kept identical to the API server's source-of-truth implementation.
function nextRecurringOccurrence(storedDate: string, today: Date): string {
  const parts = String(storedDate).slice(0, 10).split("-").map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return String(storedDate).slice(0, 10);
  let [y, m] = parts;
  const d = parts[2];
  const clampDay = (yy: number, mm: number, dd: number) =>
    Math.min(dd, new Date(yy, mm, 0).getDate());
  let candidate = new Date(y, m - 1, clampDay(y, m, d));
  while (candidate.getTime() < today.getTime()) {
    m += 1;
    if (m > 12) { m = 1; y += 1; }
    candidate = new Date(y, m - 1, clampDay(y, m, d));
  }
  const mm = String(candidate.getMonth() + 1).padStart(2, "0");
  const dd = String(candidate.getDate()).padStart(2, "0");
  return `${candidate.getFullYear()}-${mm}-${dd}`;
}

// ─────────────────────────────────────────────────────────
// Admin-managed tables (لا تحتاج user_id)
// ─────────────────────────────────────────────────────────

export async function getDailyMessagesFromSupabase(): Promise<DailyMessage[] | null> {
  if (!isConnected()) return null;
  try {
    const { data, error } = await supabase!
      .from("daily_messages")
      .select("id, message, display_date, is_active, created_at")
      .order("id", { ascending: true });
    if (error) return null;
    return (data ?? []).map((row) => ({
      id: row.id as number,
      message: row.message as string,
      display_date: (row.display_date ?? null) as string | null,
      is_active: row.is_active as boolean,
      created_at: row.created_at as string,
    }));
  } catch {
    return null;
  }
}

export async function getStoryTemplatesFromSupabase(): Promise<StoryTemplate[] | null> {
  if (!isConnected()) return null;
  try {
    const { data, error } = await supabase!
      .from("story_templates")
      .select("id, name, description, template_text, background_color, text_color, is_active, created_at")
      .order("id", { ascending: true });
    if (error) return null;
    return (data ?? []).map((row) => ({
      id: row.id as number,
      name: row.name as string,
      description: (row.description ?? null) as string | null,
      template_text: (row.template_text ?? "") as string,
      background_color: (row.background_color ?? null) as string | null,
      text_color: (row.text_color ?? null) as string | null,
      is_active: row.is_active as boolean,
      created_at: row.created_at as string,
    }));
  } catch {
    return null;
  }
}

export async function getThemesFromSupabase(): Promise<Theme[] | null> {
  if (!isConnected()) return null;
  try {
    const { data, error } = await supabase!
      .from("themes")
      .select("id, name, slug, description, colors, is_active, is_available, tier, created_at")
      .order("id", { ascending: true });
    if (error) return null;
    return (data ?? []).map((row) => ({
      id: row.id as number,
      name: row.name as string,
      slug: row.slug as string,
      description: (row.description ?? null) as string | null,
      colors: (row.colors ?? {}) as Record<string, unknown>,
      is_active: row.is_active as boolean,
      is_available: row.is_available as boolean,
      tier: (row.tier ?? undefined) as string | undefined,
      created_at: row.created_at as string,
    }));
  } catch {
    return null;
  }
}

export async function getNewsFromSupabase(): Promise<NewsItem[] | null> {
  if (!isConnected()) return null;
  try {
    const { data, error } = await supabase!
      .from("news")
      .select("id, title, body, category, source, image_url, is_published, published_at, created_at")
      .order("id", { ascending: true });
    if (error) return null;
    return (data ?? []).map((row) => ({
      id: row.id as number,
      title: row.title as string,
      body: (row.body ?? null) as string | null,
      category: row.category as string,
      source: (row.source ?? null) as string | null,
      image_url: (row.image_url ?? null) as string | null,
      is_published: row.is_published as boolean,
      published_at: (row.published_at ?? null) as string | null,
      created_at: row.created_at as string,
    }));
  } catch {
    return null;
  }
}

export async function getJobsFromSupabase(): Promise<Job[] | null> {
  if (!isConnected()) return null;
  try {
    const { data, error } = await supabase!
      .from("jobs")
      .select("id, title, employer, sector, city, description, apply_url, deadline, is_active, created_at")
      .order("id", { ascending: true });
    if (error) return null;
    return (data ?? []).map((row) => ({
      id: row.id as number,
      title: row.title as string,
      employer: row.employer as string,
      sector: row.sector as string,
      city: row.city as string,
      description: (row.description ?? null) as string | null,
      apply_url: (row.apply_url ?? null) as string | null,
      deadline: (row.deadline ?? null) as string | null,
      is_active: (row.is_active ?? true) as boolean,
      created_at: row.created_at as string,
    }));
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────
// User-owned tables (تحتاج user_id من session)
// RLS تُرجع 0 صفوف إذا لا يوجد session — آمن
// ─────────────────────────────────────────────────────────

export async function getAppointmentsFromSupabase(): Promise<Appointment[] | null> {
  if (!isConnected()) return null;
  try {
    const userId = await getCurrentUserId();
    let query = supabase!
      .from("appointments")
      .select("id, legacy_id, title, description, date, time, category, color, priority, reminder_enabled, created_at")
      .order("date", { ascending: true });
    if (userId) {
      query = query.eq("user_id", userId);
    }
    const { data, error } = await query;
    if (error) return null;
    return (data ?? []).map((row) => ({
      id: (row.legacy_id ?? row.id) as number,
      title: row.title as string,
      description: (row.description ?? null) as string | null,
      date: row.date as string,
      time: (row.time ?? null) as string | null,
      category: row.category as string,
      color: (row.color ?? null) as string | null,
      priority: (row.priority ?? null) as string | null,
      reminder_enabled: (row.reminder_enabled ?? false) as boolean,
      created_at: row.created_at as string,
    }));
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────
// Phase 12N — Appointments Write + Upcoming
// استراتيجية id: (row.legacy_id ?? row.id) as number
//   - صفوف مُهاجَرة: legacy_id = integer قديم، id = Supabase bigint
//   - صفوف جديدة: legacy_id = null، id = Supabase bigint → cast number
// استراتيجية update/delete: .or('legacy_id.eq.X,id.eq.X')
// RLS: appointments_select/update/delete_own → auth.uid() = user_id
// ─────────────────────────────────────────────────────────

export interface AppointmentPayload {
  title: string;
  description?: string;
  date: string;
  time?: string;
  category?: string;
  color?: string;
  priority?: string;
  reminder_enabled?: boolean;
}

function mapAppointmentRow(row: Record<string, unknown>): Appointment {
  return {
    id: ((row.legacy_id ?? row.id) as number),
    title: row.title as string,
    description: (row.description ?? null) as string | null,
    date: row.date as string,
    time: (row.time ?? null) as string | null,
    category: (row.category ?? "شخصي") as string,
    color: (row.color ?? null) as string | null,
    priority: (row.priority ?? null) as string | null,
    reminder_enabled: (row.reminder_enabled ?? false) as boolean,
    created_at: row.created_at as string,
  };
}

export async function getUpcomingAppointmentsFromSupabase(limit = 5): Promise<Appointment[] | null> {
  if (!isConnected()) return null;
  try {
    const userId = await getCurrentUserId();
    const today = new Date().toISOString().split("T")[0];
    let query = supabase!
      .from("appointments")
      .select("id, legacy_id, title, description, date, time, category, color, priority, reminder_enabled, created_at")
      .gte("date", today)
      .order("date", { ascending: true })
      .limit(limit);
    if (userId) {
      query = query.eq("user_id", userId);
    }
    const { data, error } = await query;
    if (error) return null;
    return (data ?? []).map(row => mapAppointmentRow(row as Record<string, unknown>));
  } catch {
    return null;
  }
}

export async function createAppointmentInSupabase(payload: AppointmentPayload): Promise<WriteResult> {
  if (!supabase) return { success: false, error: "Supabase غير متصل" };
  try {
    const userId = await getCurrentUserId();
    if (!userId) return { success: false, error: "المستخدم غير مُسجَّل في Supabase" };
    const { error } = await supabase!.from("appointments").insert({
      user_id: userId,
      title: payload.title,
      description: payload.description ?? null,
      date: payload.date,
      time: payload.time ?? null,
      category: payload.category ?? "شخصي",
      color: payload.color ?? null,
      priority: payload.priority ?? null,
      reminder_enabled: payload.reminder_enabled ?? false,
    });
    if (error) return { success: false, error: `Supabase error: ${error.message}` };
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "خطأ غير متوقع" };
  }
}

export async function updateAppointmentInSupabase(id: number, payload: Partial<AppointmentPayload>): Promise<WriteResult> {
  if (!supabase) return { success: false, error: "Supabase غير متصل" };
  try {
    const patch: Record<string, unknown> = {};
    if (payload.title !== undefined) patch.title = payload.title;
    if (payload.description !== undefined) patch.description = payload.description ?? null;
    if (payload.date !== undefined) patch.date = payload.date;
    if (payload.time !== undefined) patch.time = payload.time ?? null;
    if (payload.category !== undefined) patch.category = payload.category;
    if (payload.color !== undefined) patch.color = payload.color ?? null;
    if (payload.priority !== undefined) patch.priority = payload.priority ?? null;
    if (payload.reminder_enabled !== undefined) patch.reminder_enabled = payload.reminder_enabled;
    const { error } = await supabase!
      .from("appointments")
      .update(patch)
      .or(`legacy_id.eq.${id},id.eq.${id}`);
    if (error) return { success: false, error: `Supabase error: ${error.message}` };
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "خطأ غير متوقع" };
  }
}

export async function deleteAppointmentInSupabase(id: number): Promise<WriteResult> {
  if (!supabase) return { success: false, error: "Supabase غير متصل" };
  try {
    const { error } = await supabase!
      .from("appointments")
      .delete()
      .or(`legacy_id.eq.${id},id.eq.${id}`);
    if (error) return { success: false, error: `Supabase error: ${error.message}` };
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "خطأ غير متوقع" };
  }
}

export async function getFinancialEventsFromSupabase(): Promise<FinancialEvent[] | null> {
  if (!isConnected()) return null;
  try {
    const userId = await getCurrentUserId();
    let query = supabase!
      .from("financial_events")
      .select("id, legacy_id, name, type, next_date, amount, notes, is_active, reminder_days_before, created_at")
      .order("next_date", { ascending: true });
    if (userId) {
      query = query.eq("user_id", userId);
    }
    const { data, error } = await query;
    if (error) return null;
    return (data ?? []).map((row) => ({
      id: (row.legacy_id ?? row.id) as number,
      name: row.name as string,
      type: row.type as string,
      next_date: row.next_date as string,
      amount: row.amount != null ? Number(row.amount) : null,
      notes: (row.notes ?? null) as string | null,
      is_active: (row.is_active ?? true) as boolean,
      reminder_days_before: (row.reminder_days_before ?? 3) as number,
      created_at: row.created_at as string,
    }));
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────
// Phase 12O: Financial Events Write + Countdown Gateway
// ─────────────────────────────────────────────────────────

export interface FinancialEventPayload {
  name: string;
  type: string;
  next_date: string;
  amount?: number | null;
  notes?: string | null;
  is_active?: boolean;
  reminder_days_before?: number;
}

export async function getFinancialCountdownFromSupabase(): Promise<Array<{
  id: number; name: string; type: string; next_date: string; days_remaining: number; amount: number | null;
}> | null> {
  if (!isConnected()) return null;
  try {
    const userId = await getCurrentUserId();
    let query = supabase!
      .from("financial_events")
      .select("id, legacy_id, name, type, next_date, amount, is_active")
      .eq("is_active", true)
      .order("next_date", { ascending: true });
    if (userId) {
      query = query.eq("user_id", userId);
    }
    const { data, error } = await query;
    if (error) return null;
    const today = riyadhToday();
    const items = (data ?? []).map((row) => {
      const nextDate = nextRecurringOccurrence(row.next_date as string, today);
      const daysRemaining = Math.round(
        (new Date(nextDate + "T00:00:00").getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );
      return {
        id: (row.legacy_id ?? row.id) as number,
        name: row.name as string,
        type: row.type as string,
        next_date: nextDate,
        days_remaining: daysRemaining,
        amount: row.amount != null ? Number(row.amount) : null,
      };
    });
    items.sort((a, b) =>
      a.next_date < b.next_date ? -1 :
      a.next_date > b.next_date ? 1 :
      (a.type === "salary" ? -1 : b.type === "salary" ? 1 : 0)
    );
    return items;
  } catch {
    return null;
  }
}

export async function createFinancialEventInSupabase(payload: FinancialEventPayload): Promise<WriteResult> {
  if (!isConnected()) return { success: false, error: "Supabase غير متصل" };
  try {
    const userId = await getCurrentUserId();
    if (!userId) return { success: false, error: "المستخدم غير مُسجَّل" };
    const { error } = await supabase!
      .from("financial_events")
      .insert({
        user_id: userId,
        name: payload.name,
        type: payload.type,
        next_date: payload.next_date,
        amount: payload.amount != null ? String(payload.amount) : null,
        notes: payload.notes ?? null,
        is_active: payload.is_active ?? true,
        reminder_days_before: payload.reminder_days_before ?? 3,
      });
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

export async function updateFinancialEventInSupabase(id: number, payload: Partial<FinancialEventPayload>): Promise<WriteResult> {
  if (!isConnected()) return { success: false, error: "Supabase غير متصل" };
  try {
    const updates: Record<string, unknown> = {};
    if (payload.name !== undefined) updates.name = payload.name;
    if (payload.type !== undefined) updates.type = payload.type;
    if (payload.next_date !== undefined) updates.next_date = payload.next_date;
    if (payload.amount !== undefined) updates.amount = payload.amount != null ? String(payload.amount) : null;
    if (payload.notes !== undefined) updates.notes = payload.notes ?? null;
    if (payload.is_active !== undefined) updates.is_active = payload.is_active;
    if (payload.reminder_days_before !== undefined) updates.reminder_days_before = payload.reminder_days_before;
    const { error } = await supabase!
      .from("financial_events")
      .update(updates)
      .or(`legacy_id.eq.${id},id.eq.${id}`);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

export async function deleteFinancialEventInSupabase(id: number): Promise<WriteResult> {
  if (!isConnected()) return { success: false, error: "Supabase غير متصل" };
  try {
    const { error } = await supabase!
      .from("financial_events")
      .delete()
      .or(`legacy_id.eq.${id},id.eq.${id}`);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

export async function getNotificationsFromSupabase(): Promise<Notification[] | null> {
  if (!isConnected()) return null;
  try {
    const userId = await getCurrentUserId();
    let query = supabase!
      .from("notifications")
      .select("id, legacy_id, title, body, type, is_read, created_at")
      .order("created_at", { ascending: false });
    if (userId) {
      query = query.eq("user_id", userId);
    }
    const { data, error } = await query;
    if (error) return null;
    return (data ?? []).map((row) => ({
      id: (row.legacy_id ?? row.id) as number,
      title: row.title as string,
      body: (row.body ?? null) as string | null,
      type: row.type as string,
      is_read: row.is_read as boolean,
      created_at: row.created_at as string,
    }));
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────
// Support table — complaints (user_id = NULL)
// ─────────────────────────────────────────────────────────

export async function getComplaintsFromSupabase(): Promise<Complaint[] | null> {
  if (!isConnected()) return null;
  try {
    const { data, error } = await supabase!
      .from("complaints")
      .select("id, legacy_id, type, message, contact, status, created_at")
      .order("id", { ascending: true });
    if (error) return null;
    return (data ?? []).map((row) => ({
      id: (row.legacy_id ?? row.id) as number,
      type: row.type as string,
      message: row.message as string,
      contact: (row.contact ?? null) as string | null,
      status: row.status as string,
      created_at: row.created_at as string,
    }));
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────
// Write Functions — Phase 12I (نطاق محدود: notifications mark-read فقط)
//
// القواعد:
// - لا fallback صامت إلى API عند فشل Supabase write.
// - يُعيد { success: boolean; error?: string } دائماً.
// - يتطلب session Supabase Auth — بدونه يُعيد error مناسب.
// - يستخدم legacy_id (المعرّف القديم من PostgreSQL) للتصفية.
// - لا service_role.
// ─────────────────────────────────────────────────────────

export interface WriteResult {
  success: boolean;
  error?: string;
}

/**
 * markNotificationReadInSupabase
 * يُحدّث is_read = true للإشعار ذي legacy_id المُحدَّد.
 *
 * RLS: notifications_update_own — يتطلب auth.uid() = user_id.
 * إذا كان المستخدم غير مُوثَّق → يُعيد error "جلسة Supabase مفقودة".
 * إذا كان RLS يرفض → يُعيد error "لا صلاحية".
 *
 * @param legacyId - المعرّف كما يصله من واجهة API (= legacy_id في Supabase)
 */
export async function markNotificationReadInSupabase(legacyId: number): Promise<WriteResult> {
  if (!supabase) {
    return { success: false, error: "Supabase غير متصل — تحقق من VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY" };
  }

  const userId = await getCurrentUserId();
  if (!userId) {
    return { success: false, error: "جلسة Supabase Auth مفقودة — يتطلب تسجيل دخول عبر Supabase" };
  }

  try {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("legacy_id", legacyId)
      .eq("user_id", userId);

    if (error) {
      return { success: false, error: `Supabase error: ${error.message}` };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "خطأ غير متوقع" };
  }
}

/**
 * markAllNotificationsReadInSupabase
 * يُحدّث is_read = true لجميع إشعارات المستخدم الحالي.
 *
 * RLS: notifications_update_own
 */
export async function markAllNotificationsReadInSupabase(): Promise<WriteResult> {
  if (!supabase) {
    return { success: false, error: "Supabase غير متصل" };
  }

  const userId = await getCurrentUserId();
  if (!userId) {
    return { success: false, error: "جلسة Supabase Auth مفقودة" };
  }

  try {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", userId)
      .eq("is_read", false);

    if (error) {
      return { success: false, error: `Supabase error: ${error.message}` };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "خطأ غير متوقع" };
  }
}

/**
 * deleteNotificationInSupabase
 * يحذف إشعاراً بـ legacy_id المُحدَّد.
 *
 * RLS: notifications_delete_own — auth.uid() = user_id.
 * يتطلب session Supabase Auth.
 * بدون session → error "جلسة Supabase Auth مفقودة".
 *
 * @param legacyId - معرّف الإشعار كما يظهر في الواجهة (= legacy_id في Supabase)
 */
export async function deleteNotificationInSupabase(legacyId: number): Promise<WriteResult> {
  if (!supabase) {
    return { success: false, error: "Supabase غير متصل" };
  }

  const userId = await getCurrentUserId();
  if (!userId) {
    return { success: false, error: "جلسة Supabase Auth مفقودة — يتطلب تسجيل دخول عبر Supabase" };
  }

  try {
    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("legacy_id", legacyId)
      .eq("user_id", userId);

    if (error) {
      return { success: false, error: `Supabase error: ${error.message}` };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "خطأ غير متوقع" };
  }
}

// ─────────────────────────────────────────────────────────
// Admin CRUD: الأخبار (news)
// جدول admin-managed — لا user_id — id عدد صحيح مباشر
// RLS: SELECT عام / INSERT-UPDATE-DELETE يتطلب session auth
// ─────────────────────────────────────────────────────────

export interface NewsPayload {
  title: string;
  body?: string;
  category: string;
  source?: string;
  is_published?: boolean;
}

export async function createNewsInSupabase(payload: NewsPayload): Promise<WriteResult> {
  if (!supabase) return { success: false, error: "Supabase غير متصل" };
  try {
    const { error } = await supabase!.from("news").insert({
      title: payload.title,
      body: payload.body ?? null,
      category: payload.category,
      source: payload.source ?? null,
      is_published: payload.is_published ?? true,
      published_at: payload.is_published ? new Date().toISOString() : null,
    });
    if (error) return { success: false, error: `Supabase error: ${error.message}` };
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "خطأ غير متوقع" };
  }
}

export async function updateNewsInSupabase(id: number, payload: Partial<NewsPayload>): Promise<WriteResult> {
  if (!supabase) return { success: false, error: "Supabase غير متصل" };
  try {
    const patch: Record<string, unknown> = {};
    if (payload.title !== undefined) patch.title = payload.title;
    if (payload.body !== undefined) patch.body = payload.body ?? null;
    if (payload.category !== undefined) patch.category = payload.category;
    if (payload.source !== undefined) patch.source = payload.source ?? null;
    if (payload.is_published !== undefined) {
      patch.is_published = payload.is_published;
      if (payload.is_published) patch.published_at = new Date().toISOString();
    }
    const { error } = await supabase!.from("news").update(patch).eq("id", id);
    if (error) return { success: false, error: `Supabase error: ${error.message}` };
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "خطأ غير متوقع" };
  }
}

export async function deleteNewsInSupabase(id: number): Promise<WriteResult> {
  if (!supabase) return { success: false, error: "Supabase غير متصل" };
  try {
    const { error } = await supabase!.from("news").delete().eq("id", id);
    if (error) return { success: false, error: `Supabase error: ${error.message}` };
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "خطأ غير متوقع" };
  }
}

// ─────────────────────────────────────────────────────────
// Admin CRUD: الوظائف (jobs)
// جدول admin-managed — لا user_id — id عدد صحيح مباشر
// RLS: SELECT عام / INSERT-UPDATE-DELETE يتطلب session auth
// ─────────────────────────────────────────────────────────

export interface JobPayload {
  title: string;
  employer: string;
  sector: string;
  city: string;
  description?: string;
  apply_url?: string;
  deadline?: string;
  is_active?: boolean;
}

export async function createJobInSupabase(payload: JobPayload): Promise<WriteResult> {
  if (!supabase) return { success: false, error: "Supabase غير متصل" };
  try {
    const { error } = await supabase!.from("jobs").insert({
      title: payload.title,
      employer: payload.employer,
      sector: payload.sector,
      city: payload.city,
      description: payload.description ?? null,
      apply_url: payload.apply_url ?? null,
      deadline: payload.deadline ?? null,
      is_active: payload.is_active ?? true,
    });
    if (error) return { success: false, error: `Supabase error: ${error.message}` };
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "خطأ غير متوقع" };
  }
}

export async function updateJobInSupabase(id: number, payload: Partial<JobPayload>): Promise<WriteResult> {
  if (!supabase) return { success: false, error: "Supabase غير متصل" };
  try {
    const patch: Record<string, unknown> = {};
    if (payload.title !== undefined) patch.title = payload.title;
    if (payload.employer !== undefined) patch.employer = payload.employer;
    if (payload.sector !== undefined) patch.sector = payload.sector;
    if (payload.city !== undefined) patch.city = payload.city;
    if (payload.description !== undefined) patch.description = payload.description ?? null;
    if (payload.apply_url !== undefined) patch.apply_url = payload.apply_url ?? null;
    if (payload.deadline !== undefined) patch.deadline = payload.deadline ?? null;
    if (payload.is_active !== undefined) patch.is_active = payload.is_active;
    const { error } = await supabase!.from("jobs").update(patch).eq("id", id);
    if (error) return { success: false, error: `Supabase error: ${error.message}` };
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "خطأ غير متوقع" };
  }
}

export async function deleteJobInSupabase(id: number): Promise<WriteResult> {
  if (!supabase) return { success: false, error: "Supabase غير متصل" };
  try {
    const { error } = await supabase!.from("jobs").delete().eq("id", id);
    if (error) return { success: false, error: `Supabase error: ${error.message}` };
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "خطأ غير متوقع" };
  }
}

// ─────────────────────────────────────────────────────────
// Admin CRUD: الثيمات (themes)
// edit-only — لا create/delete — id عدد صحيح مباشر
// ─────────────────────────────────────────────────────────

export interface ThemeUpdatePayload {
  name?: string;
  description?: string;
  is_active?: boolean;
  is_available?: boolean;
  tier?: string;
}

export async function updateThemeInSupabase(id: number, payload: ThemeUpdatePayload): Promise<WriteResult> {
  if (!supabase) return { success: false, error: "Supabase غير متصل" };
  try {
    const patch: Record<string, unknown> = {};
    if (payload.name !== undefined) patch.name = payload.name;
    if (payload.description !== undefined) patch.description = payload.description ?? null;
    if (payload.is_active !== undefined) patch.is_active = payload.is_active;
    if (payload.is_available !== undefined) patch.is_available = payload.is_available;
    if (payload.tier !== undefined) patch.tier = payload.tier;
    const { error } = await supabase!.from("themes").update(patch).eq("id", id);
    if (error) return { success: false, error: `Supabase error: ${error.message}` };
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "خطأ غير متوقع" };
  }
}

// ─────────────────────────────────────────────────────────
// Admin CRUD: قوالب الستوري (story_templates)
// full CRUD — id عدد صحيح مباشر
// ─────────────────────────────────────────────────────────

export interface StoryTemplatePayload {
  name: string;
  description?: string;
  template_text?: string;
  background_color?: string;
  text_color?: string;
  is_active?: boolean;
}

export async function createStoryTemplateInSupabase(payload: StoryTemplatePayload): Promise<WriteResult> {
  if (!supabase) return { success: false, error: "Supabase غير متصل" };
  try {
    const { error } = await supabase!.from("story_templates").insert({
      name: payload.name,
      description: payload.description ?? null,
      template_text: payload.template_text ?? null,
      background_color: payload.background_color ?? null,
      text_color: payload.text_color ?? null,
      is_active: payload.is_active ?? true,
    });
    if (error) return { success: false, error: `Supabase error: ${error.message}` };
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "خطأ غير متوقع" };
  }
}

export async function updateStoryTemplateInSupabase(id: number, payload: Partial<StoryTemplatePayload>): Promise<WriteResult> {
  if (!supabase) return { success: false, error: "Supabase غير متصل" };
  try {
    const patch: Record<string, unknown> = {};
    if (payload.name !== undefined) patch.name = payload.name;
    if (payload.description !== undefined) patch.description = payload.description ?? null;
    if (payload.template_text !== undefined) patch.template_text = payload.template_text ?? null;
    if (payload.background_color !== undefined) patch.background_color = payload.background_color ?? null;
    if (payload.text_color !== undefined) patch.text_color = payload.text_color ?? null;
    if (payload.is_active !== undefined) patch.is_active = payload.is_active;
    const { error } = await supabase!.from("story_templates").update(patch).eq("id", id);
    if (error) return { success: false, error: `Supabase error: ${error.message}` };
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "خطأ غير متوقع" };
  }
}

export async function deleteStoryTemplateInSupabase(id: number): Promise<WriteResult> {
  if (!supabase) return { success: false, error: "Supabase غير متصل" };
  try {
    const { error } = await supabase!.from("story_templates").delete().eq("id", id);
    if (error) return { success: false, error: `Supabase error: ${error.message}` };
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "خطأ غير متوقع" };
  }
}

// ─────────────────────────────────────────────────────────
// Admin CRUD: رسائل اليوم (daily_messages)
// full CRUD — id عدد صحيح مباشر
// ─────────────────────────────────────────────────────────

export interface DailyMessagePayload {
  message: string;
  display_date?: string;
  is_active?: boolean;
}

export async function createDailyMessageInSupabase(payload: DailyMessagePayload): Promise<WriteResult> {
  if (!supabase) return { success: false, error: "Supabase غير متصل" };
  try {
    const { error } = await supabase!.from("daily_messages").insert({
      message: payload.message,
      display_date: payload.display_date ?? null,
      is_active: payload.is_active ?? true,
    });
    if (error) return { success: false, error: `Supabase error: ${error.message}` };
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "خطأ غير متوقع" };
  }
}

export async function updateDailyMessageInSupabase(id: number, payload: Partial<DailyMessagePayload>): Promise<WriteResult> {
  if (!supabase) return { success: false, error: "Supabase غير متصل" };
  try {
    const patch: Record<string, unknown> = {};
    if (payload.message !== undefined) patch.message = payload.message;
    if (payload.display_date !== undefined) patch.display_date = payload.display_date ?? null;
    if (payload.is_active !== undefined) patch.is_active = payload.is_active;
    const { error } = await supabase!.from("daily_messages").update(patch).eq("id", id);
    if (error) return { success: false, error: `Supabase error: ${error.message}` };
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "خطأ غير متوقع" };
  }
}

export async function deleteDailyMessageInSupabase(id: number): Promise<WriteResult> {
  if (!supabase) return { success: false, error: "Supabase غير متصل" };
  try {
    const { error } = await supabase!.from("daily_messages").delete().eq("id", id);
    if (error) return { success: false, error: `Supabase error: ${error.message}` };
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "خطأ غير متوقع" };
  }
}

/**
 * getUnreadNotificationsCountFromSupabase
 * يُعيد عدد الإشعارات غير المقروءة للمستخدم الحالي.
 *
 * RLS: notifications_select_own — auth.uid() = user_id.
 * بدون session → يُعيد null.
 */
export async function getUnreadNotificationsCountFromSupabase(): Promise<number | null> {
  if (!isConnected()) return null;
  try {
    const userId = await getCurrentUserId();
    if (!userId) return null;

    const { count, error } = await supabase!
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("is_read", false);

    if (error) return null;
    return count ?? 0;
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────
// Shadow Comparison Utility
// يقارن Counts بين API وSupabase — لا يغيّر البيانات
// ─────────────────────────────────────────────────────────

export interface ShadowComparisonResult {
  table: string;
  apiCount: number;
  supabaseCount: number | null;
  match: boolean | null;
  error?: string;
}

export interface ShadowComparisonSummary {
  results: ShadowComparisonResult[];
  apiTotal: number;
  supabaseTotal: number | null;
  allMatch: boolean | null;
  supabaseConnected: boolean;
  runAt: string;
}

const TABLE_EXPECTED_API_COUNTS: Record<string, number> = {
  daily_messages: 8,
  story_templates: 2,
  themes: 10,
  news: 2,
  jobs: 2,
  appointments: 2,
  financial_events: 8,
  notifications: 3,
  complaints: 3,
};

async function getSupabaseCount(table: string, userId: string | null): Promise<number | null> {
  if (!supabase) return null;
  try {
    const userOwnedTables = ["appointments", "financial_events", "notifications"];
    let query = supabase.from(table).select("id", { count: "exact", head: true });
    if (userOwnedTables.includes(table) && userId) {
      query = query.eq("user_id", userId);
    }
    const { count, error } = await query;
    if (error) return null;
    return count;
  } catch {
    return null;
  }
}

export async function runShadowComparison(
  apiCounts?: Partial<Record<string, number>>
): Promise<ShadowComparisonSummary> {
  const connected = isConnected();
  const userId = connected ? await getCurrentUserId() : null;
  const tables = Object.keys(TABLE_EXPECTED_API_COUNTS);
  const effectiveCounts = { ...TABLE_EXPECTED_API_COUNTS, ...apiCounts };

  const results: ShadowComparisonResult[] = [];

  for (const table of tables) {
    const apiCount = effectiveCounts[table] ?? 0;
    if (!connected) {
      results.push({ table, apiCount, supabaseCount: null, match: null, error: "Supabase غير متصل" });
      continue;
    }
    const supabaseCount = await getSupabaseCount(table, userId);
    const match = supabaseCount !== null ? supabaseCount === apiCount : null;
    results.push({ table, apiCount, supabaseCount, match });
  }

  const apiTotal = results.reduce((s, r) => s + r.apiCount, 0);
  const supabaseCounts = results.map((r) => r.supabaseCount);
  const supabaseTotal = supabaseCounts.every((c) => c !== null)
    ? supabaseCounts.reduce((s, c) => (s ?? 0) + (c ?? 0), 0)
    : null;
  const allMatch = results.every((r) => r.match === true) ? true : results.some((r) => r.match === false) ? false : null;

  return {
    results,
    apiTotal,
    supabaseTotal,
    allMatch,
    supabaseConnected: connected,
    runAt: new Date().toISOString(),
  };
}
