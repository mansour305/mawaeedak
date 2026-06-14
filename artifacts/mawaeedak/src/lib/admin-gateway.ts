/**
 * Admin Gateway — Supabase-backed Admin Operations
 * 
 * This module replaces the removed localStorage admin fallback.
 * All admin operations now go through Supabase with proper
 * authentication and authorization.
 * 
 * Features:
 * - Supabase client for database operations
 * - JWT authentication
 * - Admin role verification via app_metadata
 * - Optimistic updates for better UX
 * - Offline fallback with clear messaging
 */

import { supabase, isSupabaseEnabled } from "./supabase";
import { showTopNotification } from "@/components/layout/TopNotificationBanner";

// =============================================================================
// TYPES
// =============================================================================

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: "user" | "admin" | "super_admin" | "owner";
  status: "active" | "banned";
  created_at: string;
  updated_at: string;
}

export interface FinancialEvent {
  id: string;
  title: string;
  amount: string;
  date: string;
  type: "salary" | "support" | "housing" | "pension" | "other";
  status: "published" | "draft";
  created_at: string;
  updated_at: string;
}

export interface OfficialPrayerTime {
  id: string;
  city_key: string;
  city_name_ar: string;
  date_gregorian: string;
  date_hijri: string;
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  is_confirmed: boolean;
  source_name: string;
  source_url: string;
  created_at: string;
  updated_at: string;
}

export interface OfficialFinancialDate {
  id: string;
  event_key: string;
  event_name_ar: string;
  occurrence_date_gregorian: string;
  occurrence_date_hijri: string;
  owning_authority_name: string;
  source_name: string;
  source_url: string;
  approval_status: "pending" | "approved" | "rejected";
  adjustment_type?: "advance" | "delay" | null;
  adjustment_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface DailyMessage {
  id: string;
  content: string;
  scheduled_date: string;
  is_today: boolean;
  status: "scheduled" | "sent" | "draft";
  created_at: string;
  updated_at: string;
}

export interface StoryTemplate {
  id: string;
  title: string;
  content: string;
  date: string;
  linked_prayer: boolean;
  linked_financial: boolean;
  status: "active" | "draft";
  created_at: string;
  updated_at: string;
}

export interface Theme {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdminNotification {
  id: string;
  title: string;
  body: string;
  type: "system" | "broadcast" | "personal";
  target: "all" | string[];
  scheduled_for?: string;
  sent_at?: string;
  created_at: string;
}

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  status: "published" | "draft" | "hidden";
  created_at: string;
  updated_at: string;
}

export interface JobItem {
  id: string;
  title: string;
  content: string;
  company: string;
  apply_url?: string;
  status: "published" | "draft" | "hidden";
  created_at: string;
  updated_at: string;
}

export interface ReportLog {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  user_id: string;
  details: string;
  created_at: string;
}

export interface AdminSettings {
  app_name: string;
  maintenance_mode: boolean;
  time_format: "12h" | "24h";
  notifications_enabled: boolean;
  default_theme: string;
  created_at: string;
  updated_at: string;
}

export interface SocialLink {
  platform: "twitter" | "instagram" | "telegram" | "whatsapp";
  username: string;
  is_connected: boolean;
  auto_post_enabled: boolean;
  auto_post_time: string;
  created_at: string;
  updated_at: string;
}

export interface SupportTicket {
  id: string;
  user_id: string;
  user_name?: string;
  subject: string;
  message: string;
  status: "open" | "in_progress" | "closed";
  priority: "low" | "medium" | "high";
  replies: TicketReply[];
  created_at: string;
  updated_at: string;
}

export interface TicketReply {
  id: string;
  sender: "user" | "admin";
  message: string;
  created_at: string;
}

// =============================================================================
// RESULT TYPE
// =============================================================================

export type GatewayResult<T = void> = {
  success: boolean;
  data?: T;
  error?: string;
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Check if Supabase is available
 */
function checkSupabase(): boolean {
  if (!isSupabaseEnabled || !supabase) {
    console.error("❌ Admin Gateway: Supabase is not available");
    return false;
  }
  return true;
}

/**
 * Get Supabase client or throw
 */
function getSupabase() {
  if (!supabase) {
    throw new Error("Supabase not initialized");
  }
  return supabase;
}

/**
 * Get current user from Supabase
 */
async function getCurrentUser() {
  const client = getSupabase();
  const { data: { user }, error } = await client.auth.getUser();
  if (error || !user) {
    return null;
  }
  return user;
}

/**
 * Check if user has admin role
 */
async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;
  
  const role = user.app_metadata?.role;
  return role === "admin" || role === "super_admin" || role === "owner";
}

// =============================================================================
// ADMIN GATEWAY — DATABASE OPERATIONS
// =============================================================================

export const adminGateway = {
  // =========================================================================
  // THEMES
  // =========================================================================
  
  async getThemes(): Promise<GatewayResult<Theme[]>> {
    if (!checkSupabase()) {
      return { success: false, error: "Supabase غير متوفر" };
    }
    
    try {
      const { data, error } = await getSupabase()
        .from("themes")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  },
  
  async createTheme(theme: Omit<Theme, "id" | "created_at" | "updated_at">): Promise<GatewayResult<Theme>> {
    if (!checkSupabase()) {
      return { success: false, error: "Supabase غير متوفر" };
    }
    
    if (!await isAdmin()) {
      return { success: false, error: "غير مصرح - يلزم دور admin" };
    }
    
    try {
      const { data, error } = await getSupabase()
        .from("themes")
        .insert([{
          name: theme.name,
          colors: theme.colors,
          is_active: theme.is_active
        }])
        .select()
        .single();
      
      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  },
  
  async updateTheme(id: string, updates: Partial<Theme>): Promise<GatewayResult<Theme>> {
    if (!checkSupabase()) {
      return { success: false, error: "Supabase غير متوفر" };
    }
    
    if (!await isAdmin()) {
      return { success: false, error: "غير مصرح - يلزم دور admin" };
    }
    
    try {
      const { data, error } = await getSupabase()
        .from("themes")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  },
  
  async deleteTheme(id: string): Promise<GatewayResult> {
    if (!checkSupabase()) {
      return { success: false, error: "Supabase غير متوفر" };
    }
    
    if (!await isAdmin()) {
      return { success: false, error: "غير مصرح - يلزم دور admin" };
    }
    
    try {
      const { error } = await getSupabase()
        .from("themes")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      return { success: true };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  },
  
  async activateTheme(id: string): Promise<GatewayResult<Theme>> {
    if (!checkSupabase()) {
      return { success: false, error: "Supabase غير متوفر" };
    }
    
    if (!await isAdmin()) {
      return { success: false, error: "غير مصرح - يلزم دور admin" };
    }
    
    try {
      // Deactivate all themes first
      await getSupabase()
        .from("themes")
        .update({ is_active: false })
        .neq("id", "never-match");
      
      // Activate the selected theme
      const { data, error } = await getSupabase()
        .from("themes")
        .update({ is_active: true, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  },
  
  // =========================================================================
  // NEWS
  // =========================================================================
  
  async getNews(): Promise<GatewayResult<NewsItem[]>> {
    if (!checkSupabase()) {
      return { success: false, error: "Supabase غير متوفر" };
    }
    
    try {
      const { data, error } = await getSupabase()
        .from("news")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  },
  
  async createNews(news: Omit<NewsItem, "id" | "created_at" | "updated_at">): Promise<GatewayResult<NewsItem>> {
    if (!checkSupabase()) {
      return { success: false, error: "Supabase غير متوفر" };
    }
    
    if (!await isAdmin()) {
      return { success: false, error: "غير مصرح - يلزم دور admin" };
    }
    
    try {
      const { data, error } = await getSupabase()
        .from("news")
        .insert([{
          title: news.title,
          content: news.content,
          status: news.status
        }])
        .select()
        .single();
      
      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  },
  
  async updateNews(id: string, updates: Partial<NewsItem>): Promise<GatewayResult<NewsItem>> {
    if (!checkSupabase()) {
      return { success: false, error: "Supabase غير متوفر" };
    }
    
    if (!await isAdmin()) {
      return { success: false, error: "غير مصرح - يلزم دور admin" };
    }
    
    try {
      const { data, error } = await getSupabase()
        .from("news")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  },
  
  async deleteNews(id: string): Promise<GatewayResult> {
    if (!checkSupabase()) {
      return { success: false, error: "Supabase غير متوفر" };
    }
    
    if (!await isAdmin()) {
      return { success: false, error: "غير مصرح - يلزم دور admin" };
    }
    
    try {
      const { error } = await getSupabase()
        .from("news")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      return { success: true };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  },
  
  // =========================================================================
  // JOBS
  // =========================================================================
  
  async getJobs(): Promise<GatewayResult<JobItem[]>> {
    if (!checkSupabase()) {
      return { success: false, error: "Supabase غير متوفر" };
    }
    
    try {
      const { data, error } = await getSupabase()
        .from("jobs")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  },
  
  async createJob(job: Omit<JobItem, "id" | "created_at" | "updated_at">): Promise<GatewayResult<JobItem>> {
    if (!checkSupabase()) {
      return { success: false, error: "Supabase غير متوفر" };
    }
    
    if (!await isAdmin()) {
      return { success: false, error: "غير مصرح - يلزم دور admin" };
    }
    
    try {
      const { data, error } = await getSupabase()
        .from("jobs")
        .insert([{
          title: job.title,
          content: job.content,
          company: job.company,
          apply_url: job.apply_url,
          status: job.status
        }])
        .select()
        .single();
      
      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  },
  
  async updateJob(id: string, updates: Partial<JobItem>): Promise<GatewayResult<JobItem>> {
    if (!checkSupabase()) {
      return { success: false, error: "Supabase غير متوفر" };
    }
    
    if (!await isAdmin()) {
      return { success: false, error: "غير مصرح - يلزم دور admin" };
    }
    
    try {
      const { data, error } = await getSupabase()
        .from("jobs")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  },
  
  async deleteJob(id: string): Promise<GatewayResult> {
    if (!checkSupabase()) {
      return { success: false, error: "Supabase غير متوفر" };
    }
    
    if (!await isAdmin()) {
      return { success: false, error: "غير مصرح - يلزم دور admin" };
    }
    
    try {
      const { error } = await getSupabase()
        .from("jobs")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      return { success: true };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  },
  
  // =========================================================================
  // DAILY MESSAGES
  // =========================================================================
  
  async getDailyMessages(): Promise<GatewayResult<DailyMessage[]>> {
    if (!checkSupabase()) {
      return { success: false, error: "Supabase غير متوفر" };
    }
    
    try {
      const { data, error } = await getSupabase()
        .from("daily_messages")
        .select("*")
        .order("scheduled_date", { ascending: false });
      
      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  },
  
  async createDailyMessage(message: Omit<DailyMessage, "id" | "created_at" | "updated_at">): Promise<GatewayResult<DailyMessage>> {
    if (!checkSupabase()) {
      return { success: false, error: "Supabase غير متوفر" };
    }
    
    if (!await isAdmin()) {
      return { success: false, error: "غير مصرح - يلزم دور admin" };
    }
    
    try {
      const { data, error } = await getSupabase()
        .from("daily_messages")
        .insert([{
          content: message.content,
          scheduled_date: message.scheduled_date,
          is_today: message.is_today,
          status: message.status
        }])
        .select()
        .single();
      
      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  },
  
  async updateDailyMessage(id: string, updates: Partial<DailyMessage>): Promise<GatewayResult<DailyMessage>> {
    if (!checkSupabase()) {
      return { success: false, error: "Supabase غير متوفر" };
    }
    
    if (!await isAdmin()) {
      return { success: false, error: "غير مصرح - يلزم دور admin" };
    }
    
    try {
      const { data, error } = await getSupabase()
        .from("daily_messages")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  },
  
  async deleteDailyMessage(id: string): Promise<GatewayResult> {
    if (!checkSupabase()) {
      return { success: false, error: "Supabase غير متوفر" };
    }
    
    if (!await isAdmin()) {
      return { success: false, error: "غير مصرح - يلزم دور admin" };
    }
    
    try {
      const { error } = await getSupabase()
        .from("daily_messages")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      return { success: true };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  },
  
  async setTodayMessage(messageId: string): Promise<GatewayResult<DailyMessage>> {
    if (!checkSupabase()) {
      return { success: false, error: "Supabase غير متوفر" };
    }
    
    if (!await isAdmin()) {
      return { success: false, error: "غير مصرح - يلزم دور admin" };
    }
    
    try {
      // Clear all is_today flags
      await getSupabase()
        .from("daily_messages")
        .update({ is_today: false })
        .eq("is_today", true);
      
      // Set the new today message
      const { data, error } = await getSupabase()
        .from("daily_messages")
        .update({ is_today: true, updated_at: new Date().toISOString() })
        .eq("id", messageId)
        .select()
        .single();
      
      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  },
  
  // =========================================================================
  // STORY PRESET READS
  // =========================================================================
  
  async getStoryTemplates(): Promise<GatewayResult<StoryTemplate[]>> {
    if (!checkSupabase()) {
      return { success: false, error: "Supabase غير متوفر" };
    }
    
    try {
      const { data, error } = await getSupabase()
        .from("story_templates")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  },
  
  async createStoryTemplate(template: Omit<StoryTemplate, "id" | "created_at" | "updated_at">): Promise<GatewayResult<StoryTemplate>> {
    if (!checkSupabase()) {
      return { success: false, error: "Supabase غير متوفر" };
    }
    
    if (!await isAdmin()) {
      return { success: false, error: "غير مصرح - يلزم دور admin" };
    }
    
    try {
      const { data, error } = await getSupabase()
        .from("story_templates")
        .insert([{
          title: template.title,
          content: template.content,
          date: template.date,
          linked_prayer: template.linked_prayer,
          linked_financial: template.linked_financial,
          status: template.status
        }])
        .select()
        .single();
      
      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  },
  
  async updateStoryTemplate(id: string, updates: Partial<StoryTemplate>): Promise<GatewayResult<StoryTemplate>> {
    if (!checkSupabase()) {
      return { success: false, error: "Supabase غير متوفر" };
    }
    
    if (!await isAdmin()) {
      return { success: false, error: "غير مصرح - يلزم دور admin" };
    }
    
    try {
      const { data, error } = await getSupabase()
        .from("story_templates")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  },
  
  async deleteStoryTemplate(id: string): Promise<GatewayResult> {
    if (!checkSupabase()) {
      return { success: false, error: "Supabase غير متوفر" };
    }
    
    if (!await isAdmin()) {
      return { success: false, error: "غير مصرح - يلزم دور admin" };
    }
    
    try {
      const { error } = await getSupabase()
        .from("story_templates")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      return { success: true };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  },
  
  // =========================================================================
  // NOTIFICATIONS
  // =========================================================================
  
  async getNotifications(): Promise<GatewayResult<AdminNotification[]>> {
    if (!checkSupabase()) {
      return { success: false, error: "Supabase غير متوفر" };
    }
    
    try {
      const { data, error } = await getSupabase()
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  },
  
  async sendNotification(notification: Omit<AdminNotification, "id" | "created_at">): Promise<GatewayResult<AdminNotification>> {
    if (!checkSupabase()) {
      return { success: false, error: "Supabase غير متوفر" };
    }
    
    if (!await isAdmin()) {
      return { success: false, error: "غير مصرح - يلزم دور admin" };
    }
    
    try {
      const { data, error } = await getSupabase()
        .from("notifications")
        .insert([{
          title: notification.title,
          body: notification.body,
          type: notification.type,
          target: notification.target,
          sent_at: new Date().toISOString()
        }])
        .select()
        .single();
      
      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  },
  
  async scheduleNotification(notification: Omit<AdminNotification, "id" | "created_at">): Promise<GatewayResult<AdminNotification>> {
    if (!checkSupabase()) {
      return { success: false, error: "Supabase غير متوفر" };
    }
    
    if (!await isAdmin()) {
      return { success: false, error: "غير مصرح - يلزم دور admin" };
    }
    
    try {
      const { data, error } = await getSupabase()
        .from("notifications")
        .insert([{
          title: notification.title,
          body: notification.body,
          type: notification.type,
          target: notification.target,
          scheduled_for: notification.scheduled_for
        }])
        .select()
        .single();
      
      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  },
  
  async deleteNotification(id: string): Promise<GatewayResult> {
    if (!checkSupabase()) {
      return { success: false, error: "Supabase غير متوفر" };
    }
    
    if (!await isAdmin()) {
      return { success: false, error: "غير مصرح - يلزم دور admin" };
    }
    
    try {
      const { error } = await getSupabase()
        .from("notifications")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      return { success: true };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  },
  
  // =========================================================================
  // FINANCIAL EVENTS
  // =========================================================================
  
  async getFinancialEvents(): Promise<GatewayResult<FinancialEvent[]>> {
    if (!checkSupabase()) {
      return { success: false, error: "Supabase غير متوفر" };
    }
    
    try {
      const { data, error } = await getSupabase()
        .from("financial_events")
        .select("*")
        .order("date", { ascending: true });
      
      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  },
  
  async createFinancialEvent(event: Omit<FinancialEvent, "id" | "created_at" | "updated_at">): Promise<GatewayResult<FinancialEvent>> {
    if (!checkSupabase()) {
      return { success: false, error: "Supabase غير متوفر" };
    }
    
    if (!await isAdmin()) {
      return { success: false, error: "غير مصرح - يلزم دور admin" };
    }
    
    try {
      const { data, error } = await getSupabase()
        .from("financial_events")
        .insert([{
          title: event.title,
          amount: event.amount,
          date: event.date,
          type: event.type,
          status: event.status
        }])
        .select()
        .single();
      
      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  },
  
  async updateFinancialEvent(id: string, updates: Partial<FinancialEvent>): Promise<GatewayResult<FinancialEvent>> {
    if (!checkSupabase()) {
      return { success: false, error: "Supabase غير متوفر" };
    }
    
    if (!await isAdmin()) {
      return { success: false, error: "غير مصرح - يلزم دور admin" };
    }
    
    try {
      const { data, error } = await getSupabase()
        .from("financial_events")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  },
  
  async deleteFinancialEvent(id: string): Promise<GatewayResult> {
    if (!checkSupabase()) {
      return { success: false, error: "Supabase غير متوفر" };
    }
    
    if (!await isAdmin()) {
      return { success: false, error: "غير مصرح - يلزم دور admin" };
    }
    
    try {
      const { error } = await getSupabase()
        .from("financial_events")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      return { success: true };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  },
  
  // =========================================================================
  // OFFICIAL PRAYER TIMES
  // =========================================================================
  
  async getOfficialPrayerTimes(): Promise<GatewayResult<OfficialPrayerTime[]>> {
    if (!checkSupabase()) {
      return { success: false, error: "Supabase غير متوفر" };
    }
    
    try {
      const { data, error } = await getSupabase()
        .from("official_prayer_times")
        .select("*")
        .order("date_gregorian", { ascending: false });
      
      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  },
  
  async createOfficialPrayerTime(time: Omit<OfficialPrayerTime, "id" | "created_at" | "updated_at">): Promise<GatewayResult<OfficialPrayerTime>> {
    if (!checkSupabase()) {
      return { success: false, error: "Supabase غير متوفر" };
    }
    
    if (!await isAdmin()) {
      return { success: false, error: "غير مصرح - يلزم دور admin" };
    }
    
    try {
      const { data, error } = await getSupabase()
        .from("official_prayer_times")
        .insert([{
          city_key: time.city_key,
          city_name_ar: time.city_name_ar,
          date_gregorian: time.date_gregorian,
          date_hijri: time.date_hijri,
          fajr: time.fajr,
          sunrise: time.sunrise,
          dhuhr: time.dhuhr,
          asr: time.asr,
          maghrib: time.maghrib,
          isha: time.isha,
          is_confirmed: time.is_confirmed,
          source_name: time.source_name,
          source_url: time.source_url
        }])
        .select()
        .single();
      
      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  },
  
  async updateOfficialPrayerTime(id: string, updates: Partial<OfficialPrayerTime>): Promise<GatewayResult<OfficialPrayerTime>> {
    if (!checkSupabase()) {
      return { success: false, error: "Supabase غير متوفر" };
    }
    
    if (!await isAdmin()) {
      return { success: false, error: "غير مصرح - يلزم دور admin" };
    }
    
    try {
      const { data, error } = await getSupabase()
        .from("official_prayer_times")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  },
  
  async deleteOfficialPrayerTime(id: string): Promise<GatewayResult> {
    if (!checkSupabase()) {
      return { success: false, error: "Supabase غير متوفر" };
    }
    
    if (!await isAdmin()) {
      return { success: false, error: "غير مصرح - يلزم دور admin" };
    }
    
    try {
      const { error } = await getSupabase()
        .from("official_prayer_times")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      return { success: true };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  },
  
  // =========================================================================
  // OFFICIAL FINANCIAL DATES
  // =========================================================================
  
  async getOfficialFinancialDates(): Promise<GatewayResult<OfficialFinancialDate[]>> {
    if (!checkSupabase()) {
      return { success: false, error: "Supabase غير متوفر" };
    }
    
    try {
      const { data, error } = await getSupabase()
        .from("official_financial_dates")
        .select("*")
        .order("occurrence_date_gregorian", { ascending: true });
      
      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  },
  
  async createOfficialFinancialDate(date: Omit<OfficialFinancialDate, "id" | "created_at" | "updated_at">): Promise<GatewayResult<OfficialFinancialDate>> {
    if (!checkSupabase()) {
      return { success: false, error: "Supabase غير متوفر" };
    }
    
    if (!await isAdmin()) {
      return { success: false, error: "غير مصرح - يلزم دور admin" };
    }
    
    try {
      const { data, error } = await getSupabase()
        .from("official_financial_dates")
        .insert([{
          event_key: date.event_key,
          event_name_ar: date.event_name_ar,
          occurrence_date_gregorian: date.occurrence_date_gregorian,
          occurrence_date_hijri: date.occurrence_date_hijri,
          owning_authority_name: date.owning_authority_name,
          source_name: date.source_name,
          source_url: date.source_url,
          approval_status: date.approval_status,
          adjustment_type: date.adjustment_type,
          adjustment_reason: date.adjustment_reason
        }])
        .select()
        .single();
      
      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  },
  
  async updateOfficialFinancialDate(id: string, updates: Partial<OfficialFinancialDate>): Promise<GatewayResult<OfficialFinancialDate>> {
    if (!checkSupabase()) {
      return { success: false, error: "Supabase غير متوفر" };
    }
    
    if (!await isAdmin()) {
      return { success: false, error: "غير مصرح - يلزم دور admin" };
    }
    
    try {
      const { data, error } = await getSupabase()
        .from("official_financial_dates")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  },
  
  async deleteOfficialFinancialDate(id: string): Promise<GatewayResult> {
    if (!checkSupabase()) {
      return { success: false, error: "Supabase غير متوفر" };
    }
    
    if (!await isAdmin()) {
      return { success: false, error: "غير مصرح - يلزم دور admin" };
    }
    
    try {
      const { error } = await getSupabase()
        .from("official_financial_dates")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      return { success: true };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  },
  
  // =========================================================================
  // AUDIT LOGS
  // =========================================================================
  
  async getAuditLogs(): Promise<GatewayResult<ReportLog[]>> {
    if (!checkSupabase()) {
      return { success: false, error: "Supabase غير متوفر" };
    }
    
    if (!await isAdmin()) {
      return { success: false, error: "غير مصرح - يلزم دور admin" };
    }
    
    try {
      const { data, error } = await getSupabase()
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  },
  
  async addAuditLog(log: Omit<ReportLog, "id" | "created_at">): Promise<GatewayResult<ReportLog>> {
    if (!checkSupabase()) {
      return { success: false, error: "Supabase غير متوفر" };
    }
    
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "غير مصرح" };
    }
    
    try {
      const { data, error } = await getSupabase()
        .from("audit_logs")
        .insert([{
          action: log.action,
          entity_type: log.entity_type,
          entity_id: log.entity_id,
          user_id: user.id,
          details: log.details
        }])
        .select()
        .single();
      
      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  },
  
  // =========================================================================
  // PUBLIC EVENTS
  // =========================================================================
  
  async getPublicEvents(): Promise<GatewayResult<any[]>> {
    if (!checkSupabase()) {
      return { success: false, error: "Supabase غير متوفر" };
    }
    
    try {
      const { data, error } = await getSupabase()
        .from("public_events")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  },
  
  async createPublicEvent(event: any): Promise<GatewayResult<any>> {
    if (!checkSupabase()) {
      return { success: false, error: "Supabase غير متوفر" };
    }
    
    if (!await isAdmin()) {
      return { success: false, error: "غير مصرح - يلزم دور admin" };
    }
    
    try {
      const { data, error } = await getSupabase()
        .from("public_events")
        .insert([event])
        .select()
        .single();
      
      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  },
  
  async updatePublicEvent(id: string, updates: any): Promise<GatewayResult<any>> {
    if (!checkSupabase()) {
      return { success: false, error: "Supabase غير متوفر" };
    }
    
    if (!await isAdmin()) {
      return { success: false, error: "غير مصرح - يلزم دور admin" };
    }
    
    try {
      const { data, error } = await getSupabase()
        .from("public_events")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  },
  
  async deletePublicEvent(id: string): Promise<GatewayResult> {
    if (!checkSupabase()) {
      return { success: false, error: "Supabase غير متوفر" };
    }
    
    if (!await isAdmin()) {
      return { success: false, error: "غير مصرح - يلزم دور admin" };
    }
    
    try {
      const { error } = await getSupabase()
        .from("public_events")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      return { success: true };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  },
  
  // =========================================================================
  // APPOINTMENTS (user-owned, admin can view)
  // =========================================================================
  
  async getAppointments(): Promise<GatewayResult<any[]>> {
    if (!checkSupabase()) {
      return { success: false, error: "Supabase غير متوفر" };
    }
    
    try {
      const { data, error } = await getSupabase()
        .from("appointments")
        .select("*")
        .order("date", { ascending: true });
      
      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  },
  
  // =========================================================================
  // COMPLAINTS
  // =========================================================================
  
  async getComplaints(): Promise<GatewayResult<any[]>> {
    if (!checkSupabase()) {
      return { success: false, error: "Supabase غير متوفر" };
    }
    
    try {
      const { data, error } = await getSupabase()
        .from("complaints")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  },
  
  async createComplaint(complaint: any): Promise<GatewayResult<any>> {
    if (!checkSupabase()) {
      return { success: false, error: "Supabase غير متوفر" };
    }
    
    try {
      const { data, error } = await getSupabase()
        .from("complaints")
        .insert([complaint])
        .select()
        .single();
      
      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  },
};

export default adminGateway;

