/**
 * Supabase Client — مواعيدك
 *
 * الحالة الحالية: جاهز للربط الفعلي
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
 * isProduction — هل نحن في بيئة الإنتاج؟
 */
export const isProduction = import.meta.env.PROD || import.meta.env.NODE_ENV === "production";

/**
 * isSupabaseConfigured — هل Supabase مفعل؟
 */
export const isSupabaseEnabled = Boolean(supabaseUrl && supabaseAnonKey);

/**
 * supabase — null إذا المفاتيح غير موجودة (demo/fallback mode)
 * يُستخدم Supabase فقط إذا كان الاتصال متاحاً
 */
export const supabase: SupabaseClient | null =
  isSupabaseEnabled && supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
        },
      })
    : null;

/**
 * PRODUCTION VALIDATION
 * لا يُعرض التطبيق كـ "جاهز" في الإنتاج بدون Supabase
 */
if (isProduction && !isSupabaseEnabled) {
  console.error(
    "[مواعيدك] خطأ إعداد: التطبيق في وضع الإنتاج لكن مفاتيح Supabase غير موجودة.\n" +
    "VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY مطلوبة.\n" +
    "التطبيق لا يعمل بدون Supabase في بيئة الإنتاج."
  );
}

if (import.meta.env.DEV) {
  if (!isSupabaseEnabled) {
    console.info(
      "[Supabase] غير مفعّل — VITE_SUPABASE_URL أو VITE_SUPABASE_ANON_KEY غير موجودان. " +
        "التطبيق يعمل بـ demo/fallback mode (development فقط)."
    );
  } else {
    console.info("[Supabase] متصل ✅");
  }
}

/**
 * PRODUCTION BLOCK: يمنع التطبيق من العمل بدون Supabase في الإنتاج
 */
export function requireSupabase(): SupabaseClient {
  if (!supabase) {
    if (isProduction) {
      throw new Error(
        "خطأ إعداد: التطبيق يتطلب Supabase في بيئة الإنتاج. " +
        "أضف VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY في ملف .env"
      );
    }
    throw new Error("Supabase غير مهيأ. أضف مفاتيح Supabase في .env");
  }
  return supabase;
}

