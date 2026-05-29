/**
 * dataGateway.ts — مواعيدك Phase 12G
 *
 * Data Gateway — يوجّه القراءة بين API وSupabase حسب DATA_SOURCE_MODE.
 *
 * القرار المعماري:
 *   - Read Cutover Only: القراءة من Supabase عند mode=supabase.
 *   - Mutations (POST/PATCH/DELETE) تبقى على API في كل الأوضاع.
 *   - API لا يُحذف — يبقى كـ fallback وكمصدر للكتابة.
 *
 * الأوضاع:
 *   api              → fetch من Express API مباشرة (السلوك الحالي)
 *   supabase_shadow  → fetch من Express API (Supabase للمقارنة في الخلفية فقط)
 *   supabase         → supabaseData.ts مع fallback إلى API عند الفشل
 *
 * ملاحظات أمان:
 *   - لا service_role هنا ولا في supabaseData.ts
 *   - لا أسرار hardcoded
 *   - أي خطأ Supabase → fallback آمن إلى API
 *   - لا DROP/TRUNCATE/DELETE
 */

import { DATA_SOURCE_MODE, isApiMode, isShadowMode } from "./dataSourceMode";
import { authedFetch } from "./apiAuth";
import {
  getDailyMessagesFromSupabase,
  getStoryTemplatesFromSupabase,
  getThemesFromSupabase,
  getNewsFromSupabase,
  getJobsFromSupabase,
  getAppointmentsFromSupabase,
  getFinancialEventsFromSupabase,
  getNotificationsFromSupabase,
  getUnreadNotificationsCountFromSupabase,
  getComplaintsFromSupabase,
  runShadowComparison,
  markNotificationReadInSupabase,
  markAllNotificationsReadInSupabase,
  deleteNotificationInSupabase,
  createNewsInSupabase,
  updateNewsInSupabase,
  deleteNewsInSupabase,
  createJobInSupabase,
  updateJobInSupabase,
  deleteJobInSupabase,
  updateThemeInSupabase,
  createStoryTemplateInSupabase,
  updateStoryTemplateInSupabase,
  deleteStoryTemplateInSupabase,
  createDailyMessageInSupabase,
  updateDailyMessageInSupabase,
  deleteDailyMessageInSupabase,
  getUpcomingAppointmentsFromSupabase,
  createAppointmentInSupabase,
  updateAppointmentInSupabase,
  deleteAppointmentInSupabase,
  getFinancialCountdownFromSupabase,
  createFinancialEventInSupabase,
  updateFinancialEventInSupabase,
  deleteFinancialEventInSupabase,
  type NewsPayload,
  type JobPayload,
  type ThemeUpdatePayload,
  type StoryTemplatePayload,
  type DailyMessagePayload,
  type AppointmentPayload,
  type FinancialEventPayload,
  type ShadowComparisonSummary,
  type WriteResult,
} from "./supabaseData";
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
// API fetch helper
// fetch مباشر من Express API — نفس ما يفعله Orval داخلياً
// ─────────────────────────────────────────────────────────

async function fetchApi<T>(path: string): Promise<T[] | null> {
  try {
    const res = await fetch(path, { credentials: "include" });
    if (!res.ok) return null;
    const data: unknown = await res.json();
    if (Array.isArray(data)) return data as T[];
    // بعض endpoints تُعيد { data: [...] }
    if (data && typeof data === "object" && "data" in data && Array.isArray((data as Record<string, unknown>).data)) {
      return (data as Record<string, unknown>).data as T[];
    }
    return null;
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────
// Gateway core: يختار المصدر حسب الوضع
// ─────────────────────────────────────────────────────────

async function gateway<T>(
  apiPath: string,
  supabaseReader: () => Promise<T[] | null>
): Promise<T[] | null> {
  if (DATA_SOURCE_MODE === "supabase") {
    // حاول Supabase أولاً — fallback إلى API عند الفشل
    try {
      const sbData = await supabaseReader();
      if (sbData !== null) {
        if (import.meta.env.DEV) {
          console.info(`[Gateway:supabase] ${apiPath} → ${sbData.length} صف`);
        }
        return sbData;
      }
    } catch {
      // تجاهل الخطأ — fallback
    }
    if (import.meta.env.DEV) {
      console.warn(`[Gateway:supabase] fallback إلى API: ${apiPath}`);
    }
    return fetchApi<T>(apiPath);
  }

  // mode=api أو mode=supabase_shadow: استخدم API دائماً
  return fetchApi<T>(apiPath);
}

// ─────────────────────────────────────────────────────────
// دوال القراءة العامة — Read-only
// استخدمها بدلاً من Orval hooks عند الحاجة للمصدر المرن
// ─────────────────────────────────────────────────────────

export async function gwGetDailyMessages(): Promise<DailyMessage[] | null> {
  return gateway<DailyMessage>("/api/daily-messages", getDailyMessagesFromSupabase);
}

export async function gwGetStoryTemplates(): Promise<StoryTemplate[] | null> {
  return gateway<StoryTemplate>("/api/story-templates", getStoryTemplatesFromSupabase);
}

export async function gwGetThemes(): Promise<Theme[] | null> {
  return gateway<Theme>("/api/themes", getThemesFromSupabase);
}

export async function gwGetNews(): Promise<NewsItem[] | null> {
  return gateway<NewsItem>("/api/news", getNewsFromSupabase);
}

export async function gwGetJobs(): Promise<Job[] | null> {
  return gateway<Job>("/api/jobs", getJobsFromSupabase);
}

export async function gwGetAppointments(): Promise<Appointment[] | null> {
  return gateway<Appointment>("/api/appointments", getAppointmentsFromSupabase);
}

export async function gwGetFinancialEvents(): Promise<FinancialEvent[] | null> {
  return gateway<FinancialEvent>("/api/financial-events", getFinancialEventsFromSupabase);
}

export async function gwGetNotifications(): Promise<Notification[] | null> {
  return gateway<Notification>("/api/notifications", getNotificationsFromSupabase);
}

export async function gwGetComplaints(): Promise<Complaint[] | null> {
  return gateway<Complaint>("/api/complaints", getComplaintsFromSupabase);
}

// ─────────────────────────────────────────────────────────
// Write Gateway — Phase 12I (نطاق محدود: notifications mark-read)
//
// سياسة الكتابة حسب الوضع:
//   mode=api:              PATCH /api/notifications/:id عبر fetch
//   mode=supabase_shadow:  PATCH /api/notifications/:id عبر fetch (لا كتابة لـ Supabase)
//   mode=supabase:         markNotificationReadInSupabase() — Supabase مباشرة
//
// ملاحظة: NotificationsPage تبقى على Orval (read+write من نفس مصدر — Phase 12J).
// هذا الـ gateway write يُستخدم حالياً من /admin/data-layer للاختبار.
// ─────────────────────────────────────────────────────────

export type { WriteResult, NewsPayload, JobPayload, ThemeUpdatePayload, StoryTemplatePayload, DailyMessagePayload, AppointmentPayload, FinancialEventPayload };

// ─────────────────────────────────────────────────────────
// Phase 12O: Financial Events Gateway — قراءة + كتابة
// mode=api/shadow → /api/financial-events
// mode=supabase   → Supabase (getFinancialCountdownFromSupabase / etc.)
// لا fallback صامت في write عند mode=supabase
// countdown: يُحسب days_remaining = Math.ceil((nextDate - now) / msPerDay)
//            مطابق لحساب API server — cutover كامل آمن
// ─────────────────────────────────────────────────────────

export async function gwGetFinancialCountdown(): Promise<Array<{
  id: number; name: string; type: string; next_date: string; days_remaining: number; amount: number | null;
}> | null> {
  if (isApiMode || isShadowMode) {
    return fetchApi<{ id: number; name: string; type: string; next_date: string; days_remaining: number; amount: number | null }>(
      "/api/financial-events/countdown"
    );
  }
  return getFinancialCountdownFromSupabase();
}

export async function gwCreateFinancialEvent(payload: FinancialEventPayload): Promise<WriteResult> {
  if (isApiMode || isShadowMode) {
    try {
      const resp = await fetch("/api/financial-events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!resp.ok) return { success: false, error: `API error: ${resp.status}` };
      return { success: true };
    } catch (e) {
      return { success: false, error: String(e) };
    }
  }
  return createFinancialEventInSupabase(payload);
}

export async function gwUpdateFinancialEvent(id: number, payload: Partial<FinancialEventPayload>): Promise<WriteResult> {
  if (isApiMode || isShadowMode) {
    try {
      const resp = await fetch(`/api/financial-events/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!resp.ok) return { success: false, error: `API error: ${resp.status}` };
      return { success: true };
    } catch (e) {
      return { success: false, error: String(e) };
    }
  }
  return updateFinancialEventInSupabase(id, payload);
}

export async function gwDeleteFinancialEvent(id: number): Promise<WriteResult> {
  if (isApiMode || isShadowMode) {
    try {
      const resp = await fetch(`/api/financial-events/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!resp.ok) return { success: false, error: `API error: ${resp.status}` };
      return { success: true };
    } catch (e) {
      return { success: false, error: String(e) };
    }
  }
  return deleteFinancialEventInSupabase(id);
}

// ─────────────────────────────────────────────────────────
// Phase 12N: Appointments Gateway — قراءة وكتابة
// mode=api/shadow → /api/appointments
// mode=supabase   → Supabase (createAppointmentInSupabase / etc.)
// لا fallback صامت في write عند mode=supabase
// ─────────────────────────────────────────────────────────

export async function gwGetUpcomingAppointments(limit = 5): Promise<Appointment[] | null> {
  if (isApiMode || isShadowMode) {
    return fetchApi<Appointment>(`/api/appointments/upcoming?limit=${limit}`);
  }
  return getUpcomingAppointmentsFromSupabase(limit);
}

export async function gwCreateAppointment(payload: AppointmentPayload): Promise<WriteResult> {
  if (isApiMode || isShadowMode) {
    try {
      const resp = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!resp.ok) return { success: false, error: `API error: ${resp.status}` };
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "API خطأ شبكة" };
    }
  }
  return createAppointmentInSupabase(payload);
}

export async function gwUpdateAppointment(id: number, payload: Partial<AppointmentPayload>): Promise<WriteResult> {
  if (isApiMode || isShadowMode) {
    try {
      const resp = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!resp.ok) return { success: false, error: `API error: ${resp.status}` };
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "API خطأ شبكة" };
    }
  }
  return updateAppointmentInSupabase(id, payload);
}

export async function gwDeleteAppointment(id: number): Promise<WriteResult> {
  if (isApiMode || isShadowMode) {
    try {
      const resp = await fetch(`/api/appointments/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!resp.ok) return { success: false, error: `API error: ${resp.status}` };
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "API خطأ شبكة" };
    }
  }
  return deleteAppointmentInSupabase(id);
}

// ─────────────────────────────────────────────────────────
// Admin CRUD Gateway: الثيمات (themes)
// edit-only (لا create/delete) — mode=api/shadow → PATCH /themes/:id | mode=supabase → Supabase
// ─────────────────────────────────────────────────────────

export async function gwUpdateTheme(id: number, payload: ThemeUpdatePayload): Promise<WriteResult> {
  if (isApiMode || isShadowMode) {
    try {
      const resp = await authedFetch(`/api/themes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!resp.ok) return { success: false, error: `API error: ${resp.status}` };
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "API خطأ شبكة" };
    }
  }
  return updateThemeInSupabase(id, payload);
}

// ─────────────────────────────────────────────────────────
// Admin CRUD Gateway: قوالب الستوري (story_templates)
// full CRUD — mode=api/shadow → /story-templates | mode=supabase → Supabase
// ─────────────────────────────────────────────────────────

export async function gwCreateStoryTemplate(payload: StoryTemplatePayload): Promise<WriteResult> {
  if (isApiMode || isShadowMode) {
    try {
      const resp = await authedFetch("/api/story-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!resp.ok) return { success: false, error: `API error: ${resp.status}` };
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "API خطأ شبكة" };
    }
  }
  return createStoryTemplateInSupabase(payload);
}

export async function gwUpdateStoryTemplate(id: number, payload: Partial<StoryTemplatePayload>): Promise<WriteResult> {
  if (isApiMode || isShadowMode) {
    try {
      const resp = await authedFetch(`/api/story-templates/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!resp.ok) return { success: false, error: `API error: ${resp.status}` };
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "API خطأ شبكة" };
    }
  }
  return updateStoryTemplateInSupabase(id, payload);
}

export async function gwDeleteStoryTemplate(id: number): Promise<WriteResult> {
  if (isApiMode || isShadowMode) {
    try {
      const resp = await authedFetch(`/api/story-templates/${id}`, {
        method: "DELETE",
      });
      if (!resp.ok) return { success: false, error: `API error: ${resp.status}` };
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "API خطأ شبكة" };
    }
  }
  return deleteStoryTemplateInSupabase(id);
}

// ─────────────────────────────────────────────────────────
// Admin CRUD Gateway: رسائل اليوم (daily_messages)
// full CRUD — mode=api/shadow → /daily-messages | mode=supabase → Supabase
// ─────────────────────────────────────────────────────────

export async function gwCreateDailyMessage(payload: DailyMessagePayload): Promise<WriteResult> {
  if (isApiMode || isShadowMode) {
    try {
      const resp = await authedFetch("/api/daily-messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!resp.ok) return { success: false, error: `API error: ${resp.status}` };
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "API خطأ شبكة" };
    }
  }
  return createDailyMessageInSupabase(payload);
}

export async function gwUpdateDailyMessage(id: number, payload: Partial<DailyMessagePayload>): Promise<WriteResult> {
  if (isApiMode || isShadowMode) {
    try {
      const resp = await authedFetch(`/api/daily-messages/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!resp.ok) return { success: false, error: `API error: ${resp.status}` };
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "API خطأ شبكة" };
    }
  }
  return updateDailyMessageInSupabase(id, payload);
}

export async function gwDeleteDailyMessage(id: number): Promise<WriteResult> {
  if (isApiMode || isShadowMode) {
    try {
      const resp = await authedFetch(`/api/daily-messages/${id}`, {
        method: "DELETE",
      });
      if (!resp.ok) return { success: false, error: `API error: ${resp.status}` };
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "API خطأ شبكة" };
    }
  }
  return deleteDailyMessageInSupabase(id);
}

// ─────────────────────────────────────────────────────────
// Admin CRUD Gateway: الأخبار (news)
// mode=api/shadow → fetch API | mode=supabase → Supabase
// لا fallback صامت في write عند mode=supabase
// ─────────────────────────────────────────────────────────

export async function gwCreateNews(payload: NewsPayload): Promise<WriteResult> {
  if (isApiMode || isShadowMode) {
    try {
      const resp = await authedFetch("/api/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!resp.ok) return { success: false, error: `API error: ${resp.status}` };
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "API خطأ شبكة" };
    }
  }
  return createNewsInSupabase(payload);
}

export async function gwUpdateNews(id: number, payload: Partial<NewsPayload>): Promise<WriteResult> {
  if (isApiMode || isShadowMode) {
    try {
      const resp = await authedFetch(`/api/news/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!resp.ok) return { success: false, error: `API error: ${resp.status}` };
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "API خطأ شبكة" };
    }
  }
  return updateNewsInSupabase(id, payload);
}

export async function gwDeleteNews(id: number): Promise<WriteResult> {
  if (isApiMode || isShadowMode) {
    try {
      const resp = await authedFetch(`/api/news/${id}`, {
        method: "DELETE",
      });
      if (!resp.ok) return { success: false, error: `API error: ${resp.status}` };
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "API خطأ شبكة" };
    }
  }
  return deleteNewsInSupabase(id);
}

// ─────────────────────────────────────────────────────────
// Admin CRUD Gateway: الوظائف (jobs)
// mode=api/shadow → fetch API | mode=supabase → Supabase
// لا fallback صامت في write عند mode=supabase
// ─────────────────────────────────────────────────────────

export async function gwCreateJob(payload: JobPayload): Promise<WriteResult> {
  if (isApiMode || isShadowMode) {
    try {
      const resp = await authedFetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!resp.ok) return { success: false, error: `API error: ${resp.status}` };
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "API خطأ شبكة" };
    }
  }
  return createJobInSupabase(payload);
}

export async function gwUpdateJob(id: number, payload: Partial<JobPayload>): Promise<WriteResult> {
  if (isApiMode || isShadowMode) {
    try {
      const resp = await authedFetch(`/api/jobs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!resp.ok) return { success: false, error: `API error: ${resp.status}` };
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "API خطأ شبكة" };
    }
  }
  return updateJobInSupabase(id, payload);
}

export async function gwDeleteJob(id: number): Promise<WriteResult> {
  if (isApiMode || isShadowMode) {
    try {
      const resp = await authedFetch(`/api/jobs/${id}`, {
        method: "DELETE",
      });
      if (!resp.ok) return { success: false, error: `API error: ${resp.status}` };
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "API خطأ شبكة" };
    }
  }
  return deleteJobInSupabase(id);
}

/**
 * gwGetUnreadNotificationsCount
 * يُعيد عدد الإشعارات غير المقروءة حسب وضع البيانات.
 *
 * mode=api/supabase_shadow: GET /api/notifications/unread-count → { count: number }
 * mode=supabase: Supabase COUNT WHERE is_read=false AND user_id=current
 *   fallback إلى API عند فشل Supabase (قراءة فقط — آمن)
 */
export async function gwGetUnreadNotificationsCount(): Promise<number | null> {
  if (isApiMode || isShadowMode) {
    try {
      const res = await fetch("/api/notifications/unread-count", { credentials: "include" });
      if (!res.ok) return null;
      const json = await res.json() as { count: number };
      return json.count ?? 0;
    } catch {
      return null;
    }
  }

  // mode=supabase → Supabase COUNT فقط (بدون fallback إلى API لتفادي count خاطئ)
  // إذا لا session → null → يُعيد 0 (بدل API التي تعد كل الإشعارات بدون user filter)
  const sbCount = await getUnreadNotificationsCountFromSupabase();
  return sbCount ?? 0;
}

/**
 * gwDeleteNotification
 * يحذف إشعاراً حسب وضع البيانات.
 *
 * mode=api/supabase_shadow: DELETE /api/notifications/:id عبر API
 * mode=supabase: supabase.delete() WHERE legacy_id = id AND user_id = current
 *
 * RLS: notifications_delete_own موجودة — آمن.
 * عند فشل Supabase: لا fallback صامت — يُعيد error واضح.
 */
export async function gwDeleteNotification(notificationId: number): Promise<WriteResult> {
  if (isApiMode || isShadowMode) {
    try {
      const resp = await fetch(`/api/notifications/${notificationId}`, {
        method: "DELETE",
      });
      if (!resp.ok) {
        return { success: false, error: `API error: ${resp.status} ${resp.statusText}` };
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "API خطأ شبكة" };
    }
  }

  // mode=supabase → Supabase delete (لا fallback صامت)
  return deleteNotificationInSupabase(notificationId);
}

/**
 * gwMarkNotificationRead
 * يُحدّث is_read = true للإشعار المحدد حسب وضع البيانات.
 *
 * mode=api/supabase_shadow: PATCH /api/notifications/:id
 * mode=supabase: Supabase UPDATE WHERE legacy_id = id
 *
 * عند فشل Supabase write: لا fallback صامت — يُعيد error واضح.
 */
export async function gwMarkNotificationRead(notificationId: number): Promise<WriteResult> {
  if (isApiMode || isShadowMode) {
    try {
      const resp = await fetch(`/api/notifications/${notificationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_read: true }),
      });
      if (!resp.ok) {
        return { success: false, error: `API error: ${resp.status} ${resp.statusText}` };
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "API خطأ شبكة" };
    }
  }

  // mode=supabase → Supabase write (لا fallback صامت)
  return markNotificationReadInSupabase(notificationId);
}

/**
 * gwMarkAllNotificationsRead
 * يُحدّث is_read = true لجميع الإشعارات.
 *
 * mode=api/supabase_shadow: POST /api/notifications/mark-all-read
 * mode=supabase: Supabase UPDATE WHERE user_id = current
 */
export async function gwMarkAllNotificationsRead(): Promise<WriteResult> {
  if (isApiMode || isShadowMode) {
    try {
      const resp = await fetch("/api/notifications/mark-all-read", { method: "POST" });
      if (!resp.ok) {
        return { success: false, error: `API error: ${resp.status}` };
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "API خطأ شبكة" };
    }
  }

  return markAllNotificationsReadInSupabase();
}

// ─────────────────────────────────────────────────────────
// Shadow Comparison — للمقارنة في وضع supabase_shadow أو من /admin
// ─────────────────────────────────────────────────────────

export async function gwRunShadowComparison(): Promise<ShadowComparisonSummary> {
  const apiCounts: Partial<Record<string, number>> = {};
  const tables: Array<{ key: string; path: string }> = [
    { key: "daily_messages", path: "/api/daily-messages" },
    { key: "story_templates", path: "/api/story-templates" },
    { key: "themes", path: "/api/themes" },
    { key: "news", path: "/api/news" },
    { key: "jobs", path: "/api/jobs" },
    { key: "appointments", path: "/api/appointments" },
    { key: "financial_events", path: "/api/financial-events" },
    { key: "notifications", path: "/api/notifications" },
    { key: "complaints", path: "/api/complaints" },
  ];

  await Promise.allSettled(
    tables.map(async ({ key, path }) => {
      const data = await fetchApi<unknown>(path);
      apiCounts[key] = data?.length ?? 0;
    })
  );

  return runShadowComparison(apiCounts);
}

// ─────────────────────────────────────────────────────────
// حالة المصدر الحالية — للعرض في /admin
// ─────────────────────────────────────────────────────────

export { DATA_SOURCE_MODE } from "./dataSourceMode";
export type { ShadowComparisonSummary, ShadowComparisonResult } from "./supabaseData";
