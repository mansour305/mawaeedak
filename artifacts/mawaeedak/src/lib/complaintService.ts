/**
 * Complaint Service — مواعيدك
 * 
 * خدمة الشكاوى والاقتراحات
 */

import { supabase, isSupabaseEnabled } from "./supabase";

export type ComplaintType = "complaint" | "suggestion" | "inquiry";
export type ComplaintStatus = "pending" | "in_progress" | "resolved" | "rejected";

export type Complaint = {
  id: string;
  user_id: string | null;
  type: ComplaintType;
  category: string;
  message: string;
  status: ComplaintStatus;
  admin_response: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateComplaintInput = {
  type: ComplaintType;
  category?: string;
  message: string;
};

/**
 * createComplaint — إرسال شكوى أو اقتراح
 */
export async function createComplaint(
  input: CreateComplaintInput,
  userId?: string
): Promise<{ success: boolean; error?: string; data?: Complaint }> {
  if (!isSupabaseEnabled || !supabase) {
    return { success: false, error: "Supabase غير مهيأ" };
  }
  
  if (!input.message.trim()) {
    return { success: false, error: "الرسالة مطلوبة" };
  }
  
  if (input.message.length < 10) {
    return { success: false, error: "الرسالة قصيرة جداً (10 أحرف على الأقل)" };
  }
  
  const { data, error } = await supabase
    .from("complaints")
    .insert({
      user_id: userId || null,
      type: input.type,
      category: input.category || "general",
      message: input.message.trim(),
      status: "pending",
    })
    .select()
    .single();
  
  if (error) return { success: false, error: error.message };
  return { success: true, data: data as Complaint };
}

/**
 * getUserComplaints — جلب شكاوى المستخدم
 */
export async function getUserComplaints(userId: string): Promise<Complaint[]> {
  if (!isSupabaseEnabled || !supabase) return [];
  
  const { data, error } = await supabase
    .from("complaints")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  
  if (error) return [];
  return (data || []) as Complaint[];
}

/**
 * getAllComplaints — جلب كل الشكاوى (للأدمن)
 */
export async function getAllComplaints(): Promise<Complaint[]> {
  if (!isSupabaseEnabled || !supabase) return [];
  
  const { data, error } = await supabase
    .from("complaints")
    .select("*")
    .order("created_at", { ascending: false });
  
  if (error) return [];
  return (data || []) as Complaint[];
}

/**
 * getComplaintsByStatus — جلب الشكاوى حسب الحالة
 */
export async function getComplaintsByStatus(status: ComplaintStatus): Promise<Complaint[]> {
  if (!isSupabaseEnabled || !supabase) return [];
  
  const { data, error } = await supabase
    .from("complaints")
    .select("*")
    .eq("status", status)
    .order("created_at", { ascending: false });
  
  if (error) return [];
  return (data || []) as Complaint[];
}

/**
 * updateComplaintStatus — تحديث حالة الشكوى (للأدمن)
 */
export async function updateComplaintStatus(
  complaintId: string,
  status: ComplaintStatus,
  adminResponse?: string
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseEnabled || !supabase) {
    return { success: false, error: "Supabase غير مهيأ" };
  }
  
  const updates: Partial<Complaint> = {
    status,
    updated_at: new Date().toISOString(),
  };
  
  if (adminResponse) {
    updates.admin_response = adminResponse;
  }
  
  const { error } = await supabase
    .from("complaints")
    .update(updates)
    .eq("id", complaintId);
  
  if (error) return { success: false, error: error.message };
  return { success: true };
}

/**
 * getComplaintStats — إحصائيات الشكاوى (للأدمن)
 */
export async function getComplaintStats(): Promise<{
  total: number;
  pending: number;
  in_progress: number;
  resolved: number;
  rejected: number;
}> {
  const all = await getAllComplaints();
  
  return {
    total: all.length,
    pending: all.filter(c => c.status === "pending").length,
    in_progress: all.filter(c => c.status === "in_progress").length,
    resolved: all.filter(c => c.status === "resolved").length,
    rejected: all.filter(c => c.status === "rejected").length,
  };
}

/**
 * deleteComplaint — حذف الشكوى
 */
export async function deleteComplaint(complaintId: string): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseEnabled || !supabase) {
    return { success: false, error: "Supabase غير مهيأ" };
  }
  
  const { error } = await supabase
    .from("complaints")
    .delete()
    .eq("id", complaintId);
  
  if (error) return { success: false, error: error.message };
  return { success: true };
}
