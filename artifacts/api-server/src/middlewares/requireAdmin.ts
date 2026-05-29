import type { Request, RequestHandler } from "express";

const ADMIN_ROLES = new Set(["admin", "super_admin"]);

type SupabaseUser = {
  id: string;
  email?: string;
  role?: string;
  user_metadata?: Record<string, unknown>;
  app_metadata?: Record<string, unknown>;
};

/**
 * يستخرج الدور من app_metadata فقط.
 *
 * تحذير أمني: user_metadata قابل للتعديل من المستخدم نفسه عبر
 * supabase.auth.updateUser({ data: {...} }) → الوثوق به يسمح برفع الصلاحيات.
 * app_metadata لا يُعدَّل إلا من جانب الخادم (service_role) → مصدر ثقة الدور.
 */
function extractRole(user: SupabaseUser): string {
  const appRole = user.app_metadata?.role;
  if (typeof appRole === "string") return appRole;
  const appRoles = user.app_metadata?.roles;
  if (Array.isArray(appRoles)) {
    const match = appRoles.find((r) => typeof r === "string" && ADMIN_ROLES.has(r));
    if (typeof match === "string") return match;
  }
  return "user";
}

/**
 * requireAdmin — يتحقق من Supabase JWT في رأس Authorization ثم يفحص الدور.
 *
 * - يطلب Authorization: Bearer <supabase_access_token>
 * - يتحقق من التوكن عبر Supabase Auth API (/auth/v1/user) باستخدام anon key
 * - يسمح فقط للأدوار: admin, super_admin
 * - لا يثق بأي علم محلي (localStorage) — التحقق من جانب الخادم حصراً
 */
export const requireAdmin: RequestHandler = async (req, res, next) => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    req.log?.error("requireAdmin: SUPABASE_URL أو SUPABASE_ANON_KEY غير مضبوطين");
    res.status(503).json({ error: "خدمة المصادقة غير مهيأة على الخادم" });
    return;
  }

  const authHeader = req.headers.authorization ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";

  if (!token) {
    res.status(401).json({ error: "مطلوب تسجيل دخول المالك" });
    return;
  }

  try {
    const resp = await fetch(`${supabaseUrl.replace(/\/+$/, "")}/auth/v1/user`, {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${token}`,
      },
    });

    if (!resp.ok) {
      res.status(401).json({ error: "جلسة غير صالحة أو منتهية" });
      return;
    }

    const user = (await resp.json()) as SupabaseUser;
    const role = extractRole(user);

    if (!ADMIN_ROLES.has(role)) {
      res.status(403).json({ error: "صلاحيات غير كافية" });
      return;
    }

    (req as Request & { adminUser?: SupabaseUser }).adminUser = user;
    next();
  } catch (err) {
    req.log?.error({ err }, "requireAdmin: فشل التحقق من Supabase");
    res.status(401).json({ error: "تعذر التحقق من الجلسة" });
  }
};
