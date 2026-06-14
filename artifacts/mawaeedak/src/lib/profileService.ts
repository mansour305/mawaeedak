/**
 * Profile Service — مواعيدك
 * 
 * واجهة موحدة لإدارة ملفات المستخدمين
 * القراءة: user_profiles أولاً، ثم app_metadata كـ fallback
 */

import { supabase, isSupabaseEnabled } from "./supabase";

export type UserProfile = {
  id: string;
  user_id: string;
  full_name: string;
  phone: string | null;
  city_key: string | null;
  city_name_ar: string | null;
  timezone: string;
  role: "user" | "admin" | "super_admin" | "owner";
  onboarding_complete: boolean;
  location_consent: boolean;
  notification_consent: boolean;
  time_format_preference: "12h" | "24h";
  created_at: string;
  updated_at: string;
};

export type UserRole = "user" | "admin" | "super_admin" | "owner";

const ADMIN_ROLES: UserRole[] = ["admin", "super_admin", "owner"];

/**
 * getUserProfile — جلب ملف المستخدم من user_profiles
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  if (!isSupabaseEnabled || !supabase) return null;
  
  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("user_id", userId)
    .single();
  
  if (error) return null;
  return data as UserProfile;
}

/**
 * getRoleFromProfile — قراءة الدور من user_profiles.role
 * هذا هو المصدر الأول للدور
 */
export async function getRoleFromProfile(userId: string): Promise<UserRole> {
  const profile = await getUserProfile(userId);
  if (profile?.role) return profile.role;
  return "user";
}

/**
 * getRoleWithFallback — قراءة الدور مع fallback لـ app_metadata
 * الترتيب:
 * 1. user_profiles.role (المصدر الأول)
 * 2. auth.user.app_metadata.role (fallback)
 */
export async function getRoleWithFallback(supabaseUser: any): Promise<UserRole> {
  // المصدر الأول: user_profiles
  if (supabaseUser?.id) {
    const profileRole = await getRoleFromProfile(supabaseUser.id);
    if (profileRole !== "user" && ADMIN_ROLES.includes(profileRole)) {
      return profileRole;
    }
  }
  
  // المصدر الثاني: app_metadata.role
  const metaRole = supabaseUser?.app_metadata?.role as UserRole | undefined;
  if (metaRole && ADMIN_ROLES.includes(metaRole)) {
    return metaRole;
  }
  
  return "user";
}

/**
 * updateUserProfile — تحديث ملف المستخدم
 */
export async function updateUserProfile(
  userId: string,
  updates: Partial<Omit<UserProfile, "id" | "user_id" | "created_at">>
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseEnabled || !supabase) {
    return { success: false, error: "Supabase غير مهيأ" };
  }
  
  const { error } = await supabase
    .from("user_profiles")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("user_id", userId);
  
  if (error) return { success: false, error: error.message };
  return { success: true };
}

/**
 * updateUserRole — تحديث دور المستخدم (للأدمن فقط)
 */
export async function updateUserRole(
  userId: string,
  newRole: UserRole
): Promise<{ success: boolean; error?: string }> {
  return updateUserProfile(userId, { role: newRole });
}

/**
 * isAdmin — هل المستخدم أدمن؟
 * يستخدم getRoleWithFallback للتوحيد
 */
export async function isAdmin(supabaseUser: any): Promise<boolean> {
  const role = await getRoleWithFallback(supabaseUser);
  return ADMIN_ROLES.includes(role);
}

/**
 * getAllProfiles — جلب كل الملفات (للأدمن)
 */
export async function getAllProfiles(): Promise<UserProfile[]> {
  if (!isSupabaseEnabled || !supabase) return [];
  
  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .order("created_at", { ascending: false });
  
  if (error) return [];
  return (data || []) as UserProfile[];
}

/**
 * updateCityKey — تحديث المدينة للمستخدم
 */
export async function updateCityKey(
  userId: string,
  cityKey: string,
  cityNameAr: string
): Promise<{ success: boolean; error?: string }> {
  return updateUserProfile(userId, { 
    city_key: cityKey, 
    city_name_ar: cityNameAr,
    location_consent: true 
  });
}

/**
 * setOnboardingComplete — تحديد اكتمال التسجيل
 */
export async function setOnboardingComplete(userId: string): Promise<{ success: boolean; error?: string }> {
  return updateUserProfile(userId, { onboarding_complete: true });
}

/**
 * setLocationConsent — حفظ موافقة الموقع
 */
export async function setLocationConsent(userId: string, consent: boolean): Promise<{ success: boolean; error?: string }> {
  return updateUserProfile(userId, { location_consent: consent });
}

/**
 * setNotificationConsent — حفظ موافقة الإشعارات
 */
export async function setNotificationConsent(userId: string, consent: boolean): Promise<{ success: boolean; error?: string }> {
  return updateUserProfile(userId, { notification_consent: consent });
}
