/**
 * dataGateway.ts — مواعيدك
 *
 * Data Gateway يوجّه القراءة والكتابة بين Express API وSupabase حسب DATA_SOURCE_MODE.
 * كل نداءات API تمر عبر authedFetch حتى تستخدم VITE_API_BASE_URL وBearer token من مصدر واحد.
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
  type ShadowComparisonResult,
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
} from "./api-client";

type CountdownItem = {
  id: number;
  name: string;
  type: string;
  next_date: string;
  days_remaining: number;
  amount: number | null;
};

async function fetchApi<T>(path: string): Promise<T[] | null> {
  try {
    const res = await authedFetch(path);
    if (!res.ok) return null;
    const data: unknown = await res.json();
    if (Array.isArray(data)) return data as T[];
    if (
      data &&
      typeof data === "object" &&
      "data" in data &&
      Array.isArray((data as Record<string, unknown>).data)
    ) {
      return (data as Record<string, unknown>).data as T[];
    }
    return null;
  } catch {
    return null;
  }
}

async function writeApi(path: string, init: RequestInit): Promise<WriteResult> {
  try {
    const resp = await authedFetch(path, init);
    if (!resp.ok) return { success: false, error: `API error: ${resp.status}` };
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "API خطأ شبكة" };
  }
}

const jsonHeaders = { "Content-Type": "application/json" };

async function gateway<T>(apiPath: string, supabaseReader: () => Promise<T[] | null>): Promise<T[] | null> {
  if (DATA_SOURCE_MODE === "supabase") {
    try {
      return await supabaseReader();
    } catch {
      return null;
    }
  }
  return fetchApi<T>(apiPath);
}

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

export async function gwGetFinancialCountdown(): Promise<CountdownItem[] | null> {
  if (isApiMode || isShadowMode) return fetchApi<CountdownItem>("/api/financial-events/countdown");
  return getFinancialCountdownFromSupabase();
}

export async function gwCreateFinancialEvent(payload: FinancialEventPayload): Promise<WriteResult> {
  if (isApiMode || isShadowMode) {
    return writeApi("/api/financial-events", {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify(payload),
    });
  }
  return createFinancialEventInSupabase(payload);
}

export async function gwUpdateFinancialEvent(id: number, payload: Partial<FinancialEventPayload>): Promise<WriteResult> {
  if (isApiMode || isShadowMode) {
    return writeApi(`/api/financial-events/${id}`, {
      method: "PATCH",
      headers: jsonHeaders,
      body: JSON.stringify(payload),
    });
  }
  return updateFinancialEventInSupabase(id, payload);
}

export async function gwDeleteFinancialEvent(id: number): Promise<WriteResult> {
  if (isApiMode || isShadowMode) return writeApi(`/api/financial-events/${id}`, { method: "DELETE" });
  return deleteFinancialEventInSupabase(id);
}

export async function gwGetUpcomingAppointments(limit = 5): Promise<Appointment[] | null> {
  if (isApiMode || isShadowMode) return fetchApi<Appointment>(`/api/appointments/upcoming?limit=${limit}`);
  return getUpcomingAppointmentsFromSupabase(limit);
}

export async function gwCreateAppointment(payload: AppointmentPayload): Promise<WriteResult> {
  if (isApiMode || isShadowMode) {
    return writeApi("/api/appointments", {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify(payload),
    });
  }
  return createAppointmentInSupabase(payload);
}

export async function gwUpdateAppointment(id: number, payload: Partial<AppointmentPayload>): Promise<WriteResult> {
  if (isApiMode || isShadowMode) {
    return writeApi(`/api/appointments/${id}`, {
      method: "PATCH",
      headers: jsonHeaders,
      body: JSON.stringify(payload),
    });
  }
  return updateAppointmentInSupabase(id, payload);
}

export async function gwDeleteAppointment(id: number): Promise<WriteResult> {
  if (isApiMode || isShadowMode) return writeApi(`/api/appointments/${id}`, { method: "DELETE" });
  return deleteAppointmentInSupabase(id);
}

export async function gwUpdateTheme(id: number, payload: ThemeUpdatePayload): Promise<WriteResult> {
  if (isApiMode || isShadowMode) {
    return writeApi(`/api/themes/${id}`, {
      method: "PATCH",
      headers: jsonHeaders,
      body: JSON.stringify(payload),
    });
  }
  return updateThemeInSupabase(id, payload);
}

export async function gwCreateStoryTemplate(payload: StoryTemplatePayload): Promise<WriteResult> {
  if (isApiMode || isShadowMode) return writeApi("/api/story-templates", { method: "POST", headers: jsonHeaders, body: JSON.stringify(payload) });
  return createStoryTemplateInSupabase(payload);
}

export async function gwUpdateStoryTemplate(id: number, payload: Partial<StoryTemplatePayload>): Promise<WriteResult> {
  if (isApiMode || isShadowMode) return writeApi(`/api/story-templates/${id}`, { method: "PATCH", headers: jsonHeaders, body: JSON.stringify(payload) });
  return updateStoryTemplateInSupabase(id, payload);
}

export async function gwDeleteStoryTemplate(id: number): Promise<WriteResult> {
  if (isApiMode || isShadowMode) return writeApi(`/api/story-templates/${id}`, { method: "DELETE" });
  return deleteStoryTemplateInSupabase(id);
}

export async function gwCreateDailyMessage(payload: DailyMessagePayload): Promise<WriteResult> {
  if (isApiMode || isShadowMode) return writeApi("/api/daily-messages", { method: "POST", headers: jsonHeaders, body: JSON.stringify(payload) });
  return createDailyMessageInSupabase(payload);
}

export async function gwUpdateDailyMessage(id: number, payload: Partial<DailyMessagePayload>): Promise<WriteResult> {
  if (isApiMode || isShadowMode) return writeApi(`/api/daily-messages/${id}`, { method: "PATCH", headers: jsonHeaders, body: JSON.stringify(payload) });
  return updateDailyMessageInSupabase(id, payload);
}

export async function gwDeleteDailyMessage(id: number): Promise<WriteResult> {
  if (isApiMode || isShadowMode) return writeApi(`/api/daily-messages/${id}`, { method: "DELETE" });
  return deleteDailyMessageInSupabase(id);
}

export async function gwCreateNews(payload: NewsPayload): Promise<WriteResult> {
  if (isApiMode || isShadowMode) return writeApi("/api/news", { method: "POST", headers: jsonHeaders, body: JSON.stringify(payload) });
  return createNewsInSupabase(payload);
}

export async function gwUpdateNews(id: number, payload: Partial<NewsPayload>): Promise<WriteResult> {
  if (isApiMode || isShadowMode) return writeApi(`/api/news/${id}`, { method: "PATCH", headers: jsonHeaders, body: JSON.stringify(payload) });
  return updateNewsInSupabase(id, payload);
}

export async function gwDeleteNews(id: number): Promise<WriteResult> {
  if (isApiMode || isShadowMode) return writeApi(`/api/news/${id}`, { method: "DELETE" });
  return deleteNewsInSupabase(id);
}

export async function gwCreateJob(payload: JobPayload): Promise<WriteResult> {
  if (isApiMode || isShadowMode) return writeApi("/api/jobs", { method: "POST", headers: jsonHeaders, body: JSON.stringify(payload) });
  return createJobInSupabase(payload);
}

export async function gwUpdateJob(id: number, payload: Partial<JobPayload>): Promise<WriteResult> {
  if (isApiMode || isShadowMode) return writeApi(`/api/jobs/${id}`, { method: "PATCH", headers: jsonHeaders, body: JSON.stringify(payload) });
  return updateJobInSupabase(id, payload);
}

export async function gwDeleteJob(id: number): Promise<WriteResult> {
  if (isApiMode || isShadowMode) return writeApi(`/api/jobs/${id}`, { method: "DELETE" });
  return deleteJobInSupabase(id);
}

export async function gwGetUnreadNotificationsCount(): Promise<number | null> {
  if (isApiMode || isShadowMode) {
    try {
      const res = await authedFetch("/api/notifications/unread-count");
      if (!res.ok) return null;
      const json = (await res.json()) as { count?: number };
      return json.count ?? 0;
    } catch {
      return null;
    }
  }
  const sbCount = await getUnreadNotificationsCountFromSupabase();
  return sbCount ?? 0;
}

export async function gwDeleteNotification(notificationId: number): Promise<WriteResult> {
  if (isApiMode || isShadowMode) return writeApi(`/api/notifications/${notificationId}`, { method: "DELETE" });
  return deleteNotificationInSupabase(notificationId);
}

export async function gwMarkNotificationRead(notificationId: number): Promise<WriteResult> {
  if (isApiMode || isShadowMode) {
    return writeApi(`/api/notifications/${notificationId}`, {
      method: "PATCH",
      headers: jsonHeaders,
      body: JSON.stringify({ is_read: true }),
    });
  }
  return markNotificationReadInSupabase(notificationId);
}

export async function gwMarkAllNotificationsRead(): Promise<WriteResult> {
  if (isApiMode || isShadowMode) return writeApi("/api/notifications/mark-all-read", { method: "POST" });
  return markAllNotificationsReadInSupabase();
}

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

export { DATA_SOURCE_MODE } from "./dataSourceMode";
export type {
  WriteResult,
  NewsPayload,
  JobPayload,
  ThemeUpdatePayload,
  StoryTemplatePayload,
  DailyMessagePayload,
  AppointmentPayload,
  FinancialEventPayload,
  ShadowComparisonSummary,
  ShadowComparisonResult,
};

