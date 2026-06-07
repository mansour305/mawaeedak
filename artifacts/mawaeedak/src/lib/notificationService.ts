/**
 * Notification Service — مواعيدك
 * 
 * خدمة الإشعارات الداخلية
 */

import { supabase, isSupabaseEnabled } from "./supabase";

export type NotificationType = 
  | "prayer_reminder" 
  | "financial_reminder" 
  | "appointment_reminder" 
  | "trip_reminder" 
  | "system" 
  | "admin_message";

export type Notification = {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  is_read: boolean;
  data: Record<string, any>;
  created_at: string;
};

export type NotificationPreferences = {
  id: string;
  user_id: string;
  prayer_reminders: boolean;
  financial_reminders: boolean;
  appointment_reminders: boolean;
  system_notifications: boolean;
  email_notifications: boolean;
  created_at: string;
  updated_at: string;
};

/**
 * createNotification — إنشاء إشعار
 */
export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  body?: string,
  extraData?: Record<string, any>
): Promise<{ success: boolean; error?: string; data?: Notification }> {
  if (!isSupabaseEnabled || !supabase) {
    return { success: false, error: "Supabase غير مهيأ" };
  }
  
  const { data: notificationData, error } = await supabase
    .from("notifications")
    .insert({
      user_id: userId,
      type,
      title,
      body: body || null,
      is_read: false,
      data: extraData || {},
    })
    .select()
    .single();
  
  if (error) return { success: false, error: error.message };
  return { success: true, data: notificationData as Notification };
}

/**
 * getUserNotifications — جلب إشعارات المستخدم
 */
export async function getUserNotifications(userId: string): Promise<Notification[]> {
  if (!isSupabaseEnabled || !supabase) return [];
  
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);
  
  if (error) return [];
  return (data || []) as Notification[];
}

/**
 * getUnreadNotifications — جلب الإشعارات غير المقروءة
 */
export async function getUnreadNotifications(userId: string): Promise<Notification[]> {
  if (!isSupabaseEnabled || !supabase) return [];
  
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .eq("is_read", false)
    .order("created_at", { ascending: false });
  
  if (error) return [];
  return (data || []) as Notification[];
}

/**
 * markAsRead —标记 إشعار كمقروء
 */
export async function markAsRead(notificationId: string): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseEnabled || !supabase) {
    return { success: false, error: "Supabase غير مهيأ" };
  }
  
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId);
  
  if (error) return { success: false, error: error.message };
  return { success: true };
}

/**
 * markAllAsRead —标记 كل الإشعارات كمقروءة
 */
export async function markAllAsRead(userId: string): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseEnabled || !supabase) {
    return { success: false, error: "Supabase غير مهيأ" };
  }
  
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", userId)
    .eq("is_read", false);
  
  if (error) return { success: false, error: error.message };
  return { success: true };
}

/**
 * deleteNotification — حذف إشعار
 */
export async function deleteNotification(notificationId: string): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseEnabled || !supabase) {
    return { success: false, error: "Supabase غير مهيأ" };
  }
  
  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("id", notificationId);
  
  if (error) return { success: false, error: error.message };
  return { success: true };
}

/**
 * getNotificationPreferences — جلب تفضيلات الإشعارات
 */
export async function getNotificationPreferences(userId: string): Promise<NotificationPreferences | null> {
  if (!isSupabaseEnabled || !supabase) return null;
  
  const { data, error } = await supabase
    .from("notification_preferences")
    .select("*")
    .eq("user_id", userId)
    .single();
  
  if (error) return null;
  return data as NotificationPreferences;
}

/**
 * updateNotificationPreferences — تحديث تفضيلات الإشعارات
 */
export async function updateNotificationPreferences(
  userId: string,
  preferences: Partial<Omit<NotificationPreferences, "id" | "user_id" | "created_at">>
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseEnabled || !supabase) {
    return { success: false, error: "Supabase غير مهيأ" };
  }
  
  const { error } = await supabase
    .from("notification_preferences")
    .upsert({
      user_id: userId,
      ...preferences,
      updated_at: new Date().toISOString(),
    });
  
  if (error) return { success: false, error: error.message };
  return { success: true };
}

/**
 * createDefaultPreferences — إنشاء تفضيلات افتراضية
 */
export async function createDefaultPreferences(userId: string): Promise<{ success: boolean; error?: string }> {
  return updateNotificationPreferences(userId, {
    prayer_reminders: true,
    financial_reminders: true,
    appointment_reminders: true,
    system_notifications: true,
    email_notifications: false,
  });
}

/**
 * getUnreadCount — عدد الإشعارات غير المقروءة
 */
export async function getUnreadCount(userId: string): Promise<number> {
  const unread = await getUnreadNotifications(userId);
  return unread.length;
}