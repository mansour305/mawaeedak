/**
 * useGatewayData.ts — مواعيدك Phase 12H
 *
 * React Query hooks تُغلّف Data Gateway للقراءة فقط.
 *
 * هذه الـ hooks:
 * - تعمل لأوضاع api / supabase_shadow / supabase حسب DATA_SOURCE_MODE.
 * - تُعيد نفس shape الـ useQuery القياسية (data, isLoading, isError).
 * - تستخدم query keys مستقلة بـ prefix "gw:" لتجنب تعارض مع Orval cache.
 * - تُستخدم فقط في صفحات القراءة الخالصة (بدون mutations).
 *
 * الصفحات المُرتبطة (بعد Phase 12O):
 *
 * Gateway Complete (قراءة + كتابة):
 *   - CalendarPage        (appointments — 12N)
 *   - HomePage            (upcoming appointments + financial countdown — 12N/12O)
 *   - FinancePage         (financial_events — 12O)
 *   - NotificationsPage   (notifications read/mark/delete — 12J/12K)
 *   - AdminNotifications  (notifications read/delete — 12K؛ send يبقى API)
 *   - AdminNewsJobs       (news + jobs — 12L)
 *   - AdminThemes         (themes — 12M)
 *   - AdminStory          (story_templates — 12M)
 *   - AdminMessages       (daily_messages — 12M)
 *
 * Gateway Read Only:
 *   - CentersNewsPage, CentersJobsPage, AccountPage, StoryPage (12H)
 *   - TopBar unread count (12K)
 *
 * API Intentionally (لا تحويل مخطط):
 *   - prayer times, today message — server-computed endpoints
 *   - AdminDashboard stats + audit logs — server-computed
 *   - AdminEvents (public_events) — ليس في Supabase schema
 *   - AdminFinancial — admin view كل المستخدمين (لا RLS)
 *   - AdminReports (audit_logs) — server-only
 *   - CentersComplaintsPage write — Orval form submission
 *   - AdminNotifications send — fan-out server-side
 */

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import {
  gwGetNews,
  gwGetJobs,
  gwGetThemes,
  gwGetStoryTemplates,
  gwGetDailyMessages,
  gwGetAppointments,
  gwGetUpcomingAppointments,
  gwGetFinancialEvents,
  gwGetFinancialCountdown,
  gwGetNotifications,
  gwGetUnreadNotificationsCount,
  gwGetComplaints,
} from "@/lib/dataGateway";
import type {
  NewsItem,
  Job,
  Theme,
  StoryTemplate,
  DailyMessage,
  Appointment,
  FinancialEvent,
  Notification,
  Complaint,
} from "@api-client";

// ─────────────────────────────────────────────────────────
// Query Keys
// ─────────────────────────────────────────────────────────

export const gwQueryKeys = {
  news: ["gw", "news"] as const,
  jobs: ["gw", "jobs"] as const,
  themes: ["gw", "themes"] as const,
  storyTemplates: ["gw", "story-templates"] as const,
  dailyMessages: ["gw", "daily-messages"] as const,
  appointments: ["gw", "appointments"] as const,
  upcomingAppointments: ["gw", "upcoming-appointments"] as const,
  financialEvents: ["gw", "financial-events"] as const,
  financialCountdown: ["gw", "financial-countdown"] as const,
  notifications: ["gw", "notifications"] as const,
  unreadCount: ["gw", "unread-count"] as const,
  complaints: ["gw", "complaints"] as const,
};

// ─────────────────────────────────────────────────────────
// Admin-managed: الأخبار
// CentersNewsPage
// ─────────────────────────────────────────────────────────

export function useGatewayNews(): UseQueryResult<NewsItem[] | null> {
  return useQuery({
    queryKey: gwQueryKeys.news,
    queryFn: () => gwGetNews(),
    staleTime: 60_000,
    retry: 1,
  });
}

// ─────────────────────────────────────────────────────────
// Admin-managed: الوظائف
// CentersJobsPage
// ─────────────────────────────────────────────────────────

export function useGatewayJobs(): UseQueryResult<Job[] | null> {
  return useQuery({
    queryKey: gwQueryKeys.jobs,
    queryFn: () => gwGetJobs(),
    staleTime: 60_000,
    retry: 1,
  });
}

// ─────────────────────────────────────────────────────────
// Admin-managed: الثيمات
// AccountPage — theme picker
// ─────────────────────────────────────────────────────────

export function useGatewayThemes(): UseQueryResult<Theme[] | null> {
  return useQuery({
    queryKey: gwQueryKeys.themes,
    queryFn: () => gwGetThemes(),
    staleTime: 300_000,
    retry: 1,
  });
}

// ─────────────────────────────────────────────────────────
// Admin-managed: قوالب الستوري
// StoryPage — read-only display
// ─────────────────────────────────────────────────────────

export function useGatewayStoryTemplates(): UseQueryResult<StoryTemplate[] | null> {
  return useQuery({
    queryKey: gwQueryKeys.storyTemplates,
    queryFn: () => gwGetStoryTemplates(),
    staleTime: 120_000,
    retry: 1,
  });
}

// ─────────────────────────────────────────────────────────
// Admin-managed: رسائل اليوم (قائمة كاملة)
// ملاحظة: StoryPage / HomePage يستخدمان useGetTodayMessage من Orval
//   لأنه endpoint خاص (/api/daily-messages/today) — يبقى على Orval
// ─────────────────────────────────────────────────────────

export function useGatewayDailyMessages(): UseQueryResult<DailyMessage[] | null> {
  return useQuery({
    queryKey: gwQueryKeys.dailyMessages,
    queryFn: () => gwGetDailyMessages(),
    staleTime: 60_000,
    retry: 1,
  });
}

// ─────────────────────────────────────────────────────────
// Phase 12N: المواعيد — قراءة + upcoming
// CalendarPage + HomePage يستخدمان هذه الـ hooks
// ─────────────────────────────────────────────────────────

export function useGatewayAppointments(): UseQueryResult<Appointment[] | null> {
  return useQuery({
    queryKey: gwQueryKeys.appointments,
    queryFn: () => gwGetAppointments(),
    staleTime: 30_000,
    retry: 1,
  });
}

export function useGatewayUpcomingAppointments(limit = 5): UseQueryResult<Appointment[] | null> {
  return useQuery({
    queryKey: [...gwQueryKeys.upcomingAppointments, limit] as const,
    queryFn: () => gwGetUpcomingAppointments(limit),
    staleTime: 30_000,
    retry: 1,
  });
}

// ─────────────────────────────────────────────────────────
// User-owned: الأحداث المالية — Phase 12O (قراءة + كتابة Gateway)
// ─────────────────────────────────────────────────────────

export function useGatewayFinancialEvents(): UseQueryResult<FinancialEvent[] | null> {
  return useQuery({
    queryKey: gwQueryKeys.financialEvents,
    queryFn: () => gwGetFinancialEvents(),
    staleTime: 30_000,
    retry: 1,
  });
}

export function useGatewayFinancialCountdown(): UseQueryResult<Array<{
  id: number; name: string; type: string; next_date: string; days_remaining: number; amount: number | null;
}> | null> {
  return useQuery({
    queryKey: gwQueryKeys.financialCountdown,
    queryFn: () => gwGetFinancialCountdown(),
    staleTime: 60_000,
    retry: 1,
  });
}

// ─────────────────────────────────────────────────────────
// User-owned: الإشعارات (قراءة فقط)
// ملاحظة: NotificationsPage يبقى على Orval — mark-read + delete مختلطة
//   هذا hook متاح للاستخدام المستقبلي في Phase 12I
// ─────────────────────────────────────────────────────────

export function useGatewayNotifications(): UseQueryResult<Notification[] | null> {
  return useQuery({
    queryKey: gwQueryKeys.notifications,
    queryFn: () => gwGetNotifications(),
    staleTime: 20_000,
    retry: 1,
  });
}

// ─────────────────────────────────────────────────────────
// User-owned: عدد الإشعارات غير المقروءة
// TopBar — يتحدث بعد كل mark-read / mark-all-read / delete / send
//
// mode=api/shadow: GET /api/notifications/unread-count → { count }
// mode=supabase: Supabase COUNT WHERE is_read=false AND user_id=current
//               fallback إلى API عند فشل Supabase
// staleTime منخفض (10s) لضمان تحديث فوري بعد العمليات
// ─────────────────────────────────────────────────────────

export function useGatewayUnreadCount(): UseQueryResult<number | null> {
  return useQuery({
    queryKey: gwQueryKeys.unreadCount,
    queryFn: () => gwGetUnreadNotificationsCount(),
    staleTime: 10_000,
    retry: 1,
  });
}

// ─────────────────────────────────────────────────────────
// Support: الشكاوى (admin read فقط)
// ─────────────────────────────────────────────────────────

export function useGatewayComplaints(): UseQueryResult<Complaint[] | null> {
  return useQuery({
    queryKey: gwQueryKeys.complaints,
    queryFn: () => gwGetComplaints(),
    staleTime: 30_000,
    retry: 1,
  });
}

