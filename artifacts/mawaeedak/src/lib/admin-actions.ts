/**
 * Admin Actions — Centralized Admin Panel Action Handlers
 * 
 * PHASE 2: Admin Recovery - All actions now use adminGateway (Supabase)
 * 
 * This module contains all action handlers for the admin panel.
 * All handlers use adminGateway which connects to Supabase.
 * The old localStorage admin fallback was removed from production code.
 * 
 * DEPRECATION NOTICE:
 * All operations now go through adminGateway → Supabase.
 */

import { adminGateway, type AdminUser, type FinancialEvent, type OfficialPrayerTime, type OfficialFinancialDate, type DailyMessage, type StoryTemplate, type Theme, type AdminNotification, type NewsItem, type JobItem, type ReportLog } from "./admin-gateway";
import { showTopNotification } from "@/components/layout/TopNotificationBanner";
import {
  updateComplaintStatus as updateComplaintStatusInSupabase,
  deleteComplaint as deleteComplaintInSupabase,
  type ComplaintStatus,
} from "./complaintService";
import { getRiyadhTodayKey } from "./riyadhTime";

// Generic result type
export type ActionResult<T = void> = {
  success: boolean;
  data?: T;
  error?: string;
};

// Helper to create async wrapper with loading state
export function withLoadingState<T>(
  action: () => Promise<ActionResult<T>>,
  onLoading: (loading: boolean) => void,
  onSuccess?: (data: T) => void,
  onError?: (error: string) => void
): () => Promise<void> {
  return async () => {
    onLoading(true);
    try {
      const result = await action();
      if (result.success) {
        onSuccess?.(result.data as T);
        showTopNotification(result.success ? "تم بنجاح" : "حدث خطأ", result.success ? "success" : "error");
      } else {
        onError?.(result.error || "حدث خطأ غير معروف");
        showTopNotification(result.error || "حدث خطأ", "error");
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "حدث خطأ غير متوقع";
      onError?.(errorMsg);
      showTopNotification(errorMsg, "error");
    } finally {
      onLoading(false);
    }
  };
}

// ============================================
// FINANCIAL EVENTS ACTIONS
// ============================================

export async function fetchFinancialEvents(): Promise<ActionResult<FinancialEvent[]>> {
  return adminGateway.getFinancialEvents();
}

export async function addFinancialEvent(data: { title: string; amount: string; date: string; type: FinancialEvent["type"] }): Promise<ActionResult<FinancialEvent>> {
  return adminGateway.createFinancialEvent({ ...data, status: "draft" });
}

export async function updateFinancialEvent(id: string, data: Partial<FinancialEvent>): Promise<ActionResult<FinancialEvent>> {
  return adminGateway.updateFinancialEvent(id, data);
}

export async function deleteFinancialEvent(id: string): Promise<ActionResult> {
  return adminGateway.deleteFinancialEvent(id);
}

export async function toggleFinancialEventStatus(id: string, published: boolean): Promise<ActionResult<FinancialEvent>> {
  return adminGateway.updateFinancialEvent(id, { status: published ? "published" : "draft" });
}

// ============================================
// OFFICIAL PRAYER TIMES ACTIONS
// ============================================

export async function fetchOfficialPrayerTimes(): Promise<ActionResult<OfficialPrayerTime[]>> {
  return adminGateway.getOfficialPrayerTimes();
}

export async function addOfficialPrayerTime(data: Omit<OfficialPrayerTime, "id" | "created_at" | "updated_at">): Promise<ActionResult<OfficialPrayerTime>> {
  return adminGateway.createOfficialPrayerTime(data);
}

export async function updateOfficialPrayerTime(id: string, data: Partial<OfficialPrayerTime>): Promise<ActionResult<OfficialPrayerTime>> {
  return adminGateway.updateOfficialPrayerTime(id, data);
}

export async function deleteOfficialPrayerTime(id: string): Promise<ActionResult> {
  return adminGateway.deleteOfficialPrayerTime(id);
}

export async function confirmPrayerTime(id: string): Promise<ActionResult<OfficialPrayerTime>> {
  return adminGateway.updateOfficialPrayerTime(id, { is_confirmed: true });
}

// ============================================
// OFFICIAL FINANCIAL DATES ACTIONS
// ============================================

export async function fetchOfficialFinancialDates(): Promise<ActionResult<OfficialFinancialDate[]>> {
  return adminGateway.getOfficialFinancialDates();
}

export async function addOfficialFinancialDate(data: Omit<OfficialFinancialDate, "id" | "created_at" | "updated_at">): Promise<ActionResult<OfficialFinancialDate>> {
  return adminGateway.createOfficialFinancialDate(data);
}

export async function updateOfficialFinancialDate(id: string, data: Partial<OfficialFinancialDate>): Promise<ActionResult<OfficialFinancialDate>> {
  return adminGateway.updateOfficialFinancialDate(id, data);
}

export async function deleteOfficialFinancialDate(id: string): Promise<ActionResult> {
  return adminGateway.deleteOfficialFinancialDate(id);
}

export async function adjustFinancialDate(id: string, type: "advance" | "delay", reason: string): Promise<ActionResult<OfficialFinancialDate>> {
  return adminGateway.updateOfficialFinancialDate(id, { adjustment_type: type, adjustment_reason: reason });
}

// ============================================
// DAILY MESSAGES ACTIONS
// ============================================

export async function fetchDailyMessages(): Promise<ActionResult<DailyMessage[]>> {
  return adminGateway.getDailyMessages();
}

export async function addDailyMessage(data: Omit<DailyMessage, "id" | "created_at" | "updated_at">): Promise<ActionResult<DailyMessage>> {
  return adminGateway.createDailyMessage(data);
}

export async function updateDailyMessage(id: string, updates: Partial<DailyMessage>): Promise<ActionResult<DailyMessage>> {
  return adminGateway.updateDailyMessage(id, updates);
}

export async function deleteDailyMessage(id: string): Promise<ActionResult> {
  return adminGateway.deleteDailyMessage(id);
}

export async function setTodayMessage(messageId: string): Promise<ActionResult<DailyMessage>> {
  return adminGateway.setTodayMessage(messageId);
}

// ============================================
// STORY PRESET ACTIONS
// ============================================

export async function fetchStoryTemplates(): Promise<ActionResult<StoryTemplate[]>> {
  return adminGateway.getStoryTemplates();
}

export async function addStoryTemplate(data: Omit<StoryTemplate, "id" | "created_at" | "updated_at">): Promise<ActionResult<StoryTemplate>> {
  return adminGateway.createStoryTemplate(data);
}

export async function updateStoryTemplate(id: string, updates: Partial<StoryTemplate>): Promise<ActionResult<StoryTemplate>> {
  return adminGateway.updateStoryTemplate(id, updates);
}

export async function deleteStoryTemplate(id: string): Promise<ActionResult> {
  return adminGateway.deleteStoryTemplate(id);
}

// ============================================
// THEMES ACTIONS
// ============================================

export async function fetchThemes(): Promise<ActionResult<Theme[]>> {
  return adminGateway.getThemes();
}

export async function addTheme(data: Omit<Theme, "id" | "created_at" | "updated_at">): Promise<ActionResult<Theme>> {
  return adminGateway.createTheme(data);
}

export async function updateTheme(id: string, updates: Partial<Theme>): Promise<ActionResult<Theme>> {
  return adminGateway.updateTheme(id, updates);
}

export async function deleteTheme(id: string): Promise<ActionResult> {
  return adminGateway.deleteTheme(id);
}

export async function activateTheme(id: string): Promise<ActionResult<Theme>> {
  return adminGateway.activateTheme(id);
}

// ============================================
// NOTIFICATIONS ACTIONS
// ============================================

export async function fetchNotifications(): Promise<ActionResult<AdminNotification[]>> {
  return adminGateway.getNotifications();
}

export async function sendNotification(data: Omit<AdminNotification, "id" | "created_at">): Promise<ActionResult<AdminNotification>> {
  return adminGateway.sendNotification(data);
}

export async function scheduleNotification(data: Omit<AdminNotification, "id" | "created_at">): Promise<ActionResult<AdminNotification>> {
  return adminGateway.scheduleNotification(data);
}

export async function deleteNotification(id: string): Promise<ActionResult> {
  return adminGateway.deleteNotification(id);
}

// ============================================
// COMPLAINTS ACTIONS
// ============================================

export async function fetchComplaints(): Promise<ActionResult<any[]>> {
  return adminGateway.getComplaints();
}

export async function replyToComplaint(id: string, reply: string): Promise<ActionResult<any>> {
  const result = await updateComplaintStatusInSupabase(id, "in_progress", reply);
  return { success: result.success, error: result.error };
}

export async function updateComplaintStatus(id: string, status: string): Promise<ActionResult<any>> {
  const result = await updateComplaintStatusInSupabase(id, status as ComplaintStatus);
  return { success: result.success, error: result.error };
}

export async function deleteComplaint(id: string): Promise<ActionResult> {
  return deleteComplaintInSupabase(id);
}

// ============================================
// NEWS ACTIONS
// ============================================

export async function fetchNews(): Promise<ActionResult<NewsItem[]>> {
  return adminGateway.getNews();
}

export async function addNews(data: Omit<NewsItem, "id" | "created_at" | "updated_at">): Promise<ActionResult<NewsItem>> {
  return adminGateway.createNews(data);
}

export async function updateNews(id: string, updates: Partial<NewsItem>): Promise<ActionResult<NewsItem>> {
  return adminGateway.updateNews(id, updates);
}

export async function deleteNews(id: string): Promise<ActionResult> {
  return adminGateway.deleteNews(id);
}

export async function toggleNewsStatus(id: string, published: boolean): Promise<ActionResult<NewsItem>> {
  return adminGateway.updateNews(id, { status: published ? "published" : "draft" });
}

// ============================================
// JOBS ACTIONS
// ============================================

export async function fetchJobs(): Promise<ActionResult<JobItem[]>> {
  return adminGateway.getJobs();
}

export async function addJob(data: Omit<JobItem, "id" | "created_at" | "updated_at">): Promise<ActionResult<JobItem>> {
  return adminGateway.createJob(data);
}

export async function updateJob(id: string, updates: Partial<JobItem>): Promise<ActionResult<JobItem>> {
  return adminGateway.updateJob(id, updates);
}

export async function deleteJob(id: string): Promise<ActionResult> {
  return adminGateway.deleteJob(id);
}

export async function toggleJobStatus(id: string, published: boolean): Promise<ActionResult<JobItem>> {
  return adminGateway.updateJob(id, { status: published ? "published" : "draft" });
}

// ============================================
// REPORTS ACTIONS
// ============================================

export async function fetchReportsLog(): Promise<ActionResult<ReportLog[]>> {
  return adminGateway.getAuditLogs();
}

export async function addReportLog(action: string, entityType: string, entityId: string, details: string): Promise<ActionResult> {
  const result = await adminGateway.addAuditLog({
    action,
    entity_type: entityType,
    entity_id: entityId,
    user_id: "", // Will be filled by gateway
    details
  });
  return { success: result.success, error: result.error };
}

export function exportReportsToCSV(logs: ReportLog[]): void {
  const headers = ["التاريخ", "الإجراء", "الكيان", "التفاصيل"];
  const rows = logs.map(log => [
    new Date(log.created_at).toLocaleDateString("ar-SA"),
    log.action,
    log.entity_type,
    log.details
  ]);
  
  const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
  const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `reports_${getRiyadhTodayKey()}.csv`;
  link.click();
}

// ============================================
// USERS ACTIONS (server admin endpoint required)
// ============================================

const USER_ADMIN_ENDPOINT_REQUIRED = "إدارة المستخدمين تتطلب endpoint إداري server-side مع صلاحيات service role ولا تُنفّذ من المتصفح.";

export async function fetchUsers(): Promise<ActionResult<AdminUser[]>> {
  return { success: false, error: USER_ADMIN_ENDPOINT_REQUIRED };
}

export async function updateUserRole(userId: string, role: AdminUser["role"]): Promise<ActionResult<AdminUser>> {
  void userId;
  void role;
  return { success: false, error: USER_ADMIN_ENDPOINT_REQUIRED };
}

export async function toggleUserBan(userId: string, banned: boolean): Promise<ActionResult<AdminUser>> {
  void userId;
  void banned;
  return { success: false, error: USER_ADMIN_ENDPOINT_REQUIRED };
}

export async function deleteUser(userId: string): Promise<ActionResult> {
  void userId;
  return { success: false, error: USER_ADMIN_ENDPOINT_REQUIRED };
}

// ============================================
// APPOINTMENTS ACTIONS (admin view)
// ============================================

export async function fetchAppointments(): Promise<ActionResult<any[]>> {
  return adminGateway.getAppointments();
}

// ============================================
// PUBLIC EVENTS ACTIONS
// ============================================

export async function fetchPublicEvents(): Promise<ActionResult<any[]>> {
  return adminGateway.getPublicEvents();
}

export async function addPublicEvent(data: any): Promise<ActionResult<any>> {
  return adminGateway.createPublicEvent(data);
}

export async function updatePublicEvent(id: string, updates: any): Promise<ActionResult<any>> {
  return adminGateway.updatePublicEvent(id, updates);
}

export async function deletePublicEvent(id: string): Promise<ActionResult> {
  return adminGateway.deletePublicEvent(id);
}

// Default export with all actions
export default {
  // Financial
  fetchFinancialEvents,
  addFinancialEvent,
  updateFinancialEvent,
  deleteFinancialEvent,
  toggleFinancialEventStatus,
  
  // Prayer Times
  fetchOfficialPrayerTimes,
  addOfficialPrayerTime,
  updateOfficialPrayerTime,
  deleteOfficialPrayerTime,
  confirmPrayerTime,
  
  // Financial Dates
  fetchOfficialFinancialDates,
  addOfficialFinancialDate,
  updateOfficialFinancialDate,
  deleteOfficialFinancialDate,
  adjustFinancialDate,
  
  // Daily Messages
  fetchDailyMessages,
  addDailyMessage,
  updateDailyMessage,
  deleteDailyMessage,
  setTodayMessage,
  
  // Story Templates
  fetchStoryTemplates,
  addStoryTemplate,
  updateStoryTemplate,
  deleteStoryTemplate,
  
  // Themes
  fetchThemes,
  addTheme,
  updateTheme,
  deleteTheme,
  activateTheme,
  
  // Notifications
  fetchNotifications,
  sendNotification,
  scheduleNotification,
  deleteNotification,
  
  // Complaints
  fetchComplaints,
  replyToComplaint,
  updateComplaintStatus,
  deleteComplaint,
  
  // News
  fetchNews,
  addNews,
  updateNews,
  deleteNews,
  toggleNewsStatus,
  
  // Jobs
  fetchJobs,
  addJob,
  updateJob,
  deleteJob,
  toggleJobStatus,
  
  // Reports
  fetchReportsLog,
  addReportLog,
  exportReportsToCSV,
  
  // Users (placeholder)
  fetchUsers,
  updateUserRole,
  toggleUserBan,
  deleteUser,
  
  // Appointments
  fetchAppointments,
  
  // Public Events
  fetchPublicEvents,
  addPublicEvent,
  updatePublicEvent,
  deletePublicEvent,
};

