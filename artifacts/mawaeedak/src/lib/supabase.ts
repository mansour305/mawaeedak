/**
 * Supabase Client — مواعيدك
 *
 * الحالة الحالية: جاهز للربط — المفاتيح غير مُضافة بعد.
 * عند إضافة VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY،
 * يُفعَّل الاتصال تلقائياً.
 *
 * تحذير أمني:
 * - استخدم VITE_SUPABASE_ANON_KEY فقط هنا (client-side)
 * - لا تضع مفاتيح الخادم عالية الصلاحية هنا أبداً
 * - RLS يحمي البيانات من جانب قاعدة البيانات
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/**
 * supabase — null إذا المفاتيح غير موجودة (demo/fallback mode)
 * يُستخدم Supabase فقط إذا كان الاتصال متاحاً
 */
export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
        },
      })
    : null;

/**
 * isSupabaseEnabled — هل Supabase متصل؟
 */
export const isSupabaseEnabled = supabase !== null;

if (import.meta.env.DEV) {
  if (!isSupabaseEnabled) {
    console.info(
      "[Supabase] غير مفعّل — VITE_SUPABASE_URL أو VITE_SUPABASE_ANON_KEY غير موجودان. " +
        "التطبيق يعمل بـ demo/fallback mode."
    );
  } else {
    console.info("[Supabase] متصل ✅");
  }
}
