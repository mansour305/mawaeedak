/**
 * dataSourceMode.ts — مواعيدك Phase 12Q
 *
 * Feature Flag لتحديد مصدر البيانات.
 * القيمة الافتراضية: "api" (PostgreSQL/Express) — لا تُغيَّر داخل الكود.
 *
 * الأوضاع:
 *   "api"              — PostgreSQL/Express (الافتراضي الآمن)
 *   "supabase_shadow"  — API يُعرض للمستخدم، Supabase يُجلب للمقارنة
 *   "supabase"         — Supabase مصدر الحقيقة (الإنتاج)
 *
 * لتفعيل Supabase في الإنتاج — عبر env فقط، لا تعديل في الكود:
 *   VITE_DATA_SOURCE_MODE=supabase
 *
 * أي قيمة غير صحيحة أو غياب المتغير → يُعيد "api" تلقائياً.
 *
 * Gateway Complete منذ Phase 12O:
 *   appointments, financial_events, notifications, news, jobs,
 *   themes, story_templates, daily_messages
 *
 * API Intentionally (لا تحويل مخطط):
 *   prayer_times, today_message, admin stats, audit_logs,
 *   public_events, AdminFinancial, notification send, complaints write
 */

export type DataSourceMode = "api" | "supabase_shadow" | "supabase";

function resolveMode(): DataSourceMode {
  const raw = import.meta.env.VITE_DATA_SOURCE_MODE as string | undefined;
  if (raw === "supabase_shadow" || raw === "supabase") {
    return raw;
  }
  return "api";
}

export const DATA_SOURCE_MODE: DataSourceMode = resolveMode();

export const isApiMode = DATA_SOURCE_MODE === "api";
export const isShadowMode = DATA_SOURCE_MODE === "supabase_shadow";
export const isSupabaseMode = DATA_SOURCE_MODE === "supabase";

if (import.meta.env.DEV) {
  console.info(`[DataLayer] وضع البيانات: ${DATA_SOURCE_MODE}`);
}
