/**
 * Auth Service — مواعيدك
 *
 * يوفر واجهة موحدة للمصادقة:
 * - إذا Supabase متصل → يستخدم Supabase Auth
 * - إذا Supabase غير متصل → demo mode (localStorage)
 *
 * demo credentials: admin / mawaeedak@admin
 */

import { supabase, isSupabaseEnabled } from "./supabase";

export type AuthUser = {
  id: string;
  email?: string;
  role?: "user" | "admin" | "super_admin" | "content_manager" | "finance_manager";
  displayName?: string;
};

export type AuthSession = {
  user: AuthUser;
  isDemo: boolean;
};

// ── Demo mode constants ────────────────────────────────────────────────────
const DEMO_ADMIN_USERNAME = "admin";
const DEMO_ADMIN_PASSWORD = "mawaeedak@admin";
const DEMO_AUTH_KEY = "admin_authenticated";

// ── Supabase Auth ──────────────────────────────────────────────────────────

/**
 * signInWithSupabase — تسجيل دخول عبر Supabase Auth
 */
async function signInWithSupabase(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  if (!supabase) return { success: false, error: "Supabase غير متصل" };

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { success: false, error: error.message };
  return { success: true };
}

/**
 * signOutFromSupabase — تسجيل خروج من Supabase
 */
async function signOutFromSupabase(): Promise<void> {
  if (!supabase) return;
  await supabase.auth.signOut();
}

/**
 * getSupabaseSession — قراءة session الحالية
 */
async function getSupabaseSession(): Promise<AuthSession | null> {
  if (!supabase) return null;

  const { data } = await supabase.auth.getSession();
  if (!data.session?.user) return null;

  const user = data.session.user;

  // Check user_metadata first, then app_metadata as fallback.
  // app_metadata is set server-side (Supabase Dashboard / SQL) and is more reliable.
  const rawRole =
    (user.user_metadata?.role as AuthUser["role"] | undefined) ??
    (user.app_metadata?.role as AuthUser["role"] | undefined) ??
    "user";

  return {
    user: {
      id: user.id,
      email: user.email,
      role: rawRole,
      displayName:
        user.user_metadata?.display_name ??
        user.user_metadata?.name ??
        user.email?.split("@")[0],
    },
    isDemo: false,
  };
}

// ── Demo mode Auth ─────────────────────────────────────────────────────────

/**
 * signInDemo — تسجيل دخول demo (username/password)
 */
function signInDemo(
  username: string,
  password: string
): { success: boolean; error?: string } {
  if (username === DEMO_ADMIN_USERNAME && password === DEMO_ADMIN_PASSWORD) {
    localStorage.setItem(DEMO_AUTH_KEY, "true");
    return { success: true };
  }
  return { success: false, error: "اسم المستخدم أو كلمة المرور غير صحيحة" };
}

/**
 * signOutDemo — تسجيل خروج demo
 */
function signOutDemo(): void {
  localStorage.removeItem(DEMO_AUTH_KEY);
}

/**
 * getDemoSession — قراءة session demo
 */
function getDemoSession(): AuthSession | null {
  const isAuth = localStorage.getItem(DEMO_AUTH_KEY) === "true";
  if (!isAuth) return null;
  return {
    user: { id: "demo-admin", role: "admin", displayName: "مدير النظام" },
    isDemo: true,
  };
}

// ── Unified Auth API ───────────────────────────────────────────────────────

/**
 * authSignIn — تسجيل دخول موحد
 * Supabase عند توفر المفاتيح، وإلا demo mode
 */
export async function authSignIn(
  usernameOrEmail: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  if (isSupabaseEnabled) {
    return signInWithSupabase(usernameOrEmail, password);
  }
  return signInDemo(usernameOrEmail, password);
}

/**
 * authSignOut — تسجيل خروج موحد
 */
export async function authSignOut(): Promise<void> {
  if (isSupabaseEnabled) {
    await signOutFromSupabase();
  } else {
    signOutDemo();
  }
}

/**
 * getAuthSession — قراءة session موحدة
 */
export async function getAuthSession(): Promise<AuthSession | null> {
  if (isSupabaseEnabled) {
    return getSupabaseSession();
  }
  return getDemoSession();
}

/**
 * isAdminUser — هل المستخدم admin أو super_admin؟
 */
export function isAdminUser(session: AuthSession | null): boolean {
  if (!session) return false;
  return session.user.role === "admin" || session.user.role === "super_admin";
}

/**
 * getAuthMode — وضع المصادقة الحالي
 */
export function getAuthMode(): "supabase" | "demo" {
  return isSupabaseEnabled ? "supabase" : "demo";
}
