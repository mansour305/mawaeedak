/**
 * Auth Service — مواعيدك
 *
 * يوفر واجهة موحدة للمصادقة:
 * - Supabase Auth عند توفر المفاتيح
 * - ممنوع Demo mode في الإنتاج
 */

import { supabase, isSupabaseEnabled, isProduction } from "./supabase";

export type AuthUser = {
  id: string;
  email?: string;
  role?: "user" | "admin" | "super_admin" | "owner";
  displayName?: string;
};

export type AuthSession = {
  user: AuthUser;
  isDemo: boolean;
};

// ── Demo mode constants ────────────────────────────────────────────────────
const DEMO_ADMIN_USERNAME = "admin";
const DEMO_ADMIN_PASSWORD = import.meta.env.VITE_DEMO_ADMIN_PASSWORD || "admin123";
const DEMO_SESSION_KEY = "mawaeedak_demo_session";
// Demo mode allowed in development when no Supabase, or when explicitly configured
const isDemoAuthAllowed = import.meta.env.DEV && !isProduction;

// ── Admin roles ────────────────────────────────────────────────────────────
const ADMIN_ROLES = ["admin", "super_admin", "owner"] as const;

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

  // Trust roles only from app_metadata. user_metadata is user-editable and
  // must not grant production admin access.
  const rawRole =
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
  if (!isDemoAuthAllowed) {
    return { success: false, error: "تسجيل دخول العرض غير متاح في بيئة الإنتاج" };
  }

  if (username === DEMO_ADMIN_USERNAME && password === DEMO_ADMIN_PASSWORD) {
    const demoUser = {
      user: { id: "demo-admin", role: "admin", displayName: "مدير النظام" },
      isDemo: true,
    };
    sessionStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(demoUser));
    // Also save to localStorage so useStore picks it up
    localStorage.setItem('app-user', JSON.stringify({
      id: "demo-admin",
      name: "مدير النظام",
      email: "demo@mawaeedak.local",
      city: "الرياض",
      cityKey: "riyadh",
      timezone: "Asia/Riyadh",
      role: "admin",
      onboardingComplete: true,
      interests: [],
    }));
    return { success: true };
  }
  return { success: false, error: "اسم المستخدم أو كلمة المرور غير صحيحة" };
}

/**
 * signOutDemo — تسجيل خروج demo
 */
function signOutDemo(): void {
  sessionStorage.removeItem(DEMO_SESSION_KEY);
}

/**
 * getDemoSession — قراءة session demo
 */
function getDemoSession(): AuthSession | null {
  if (!isDemoAuthAllowed) {
    sessionStorage.removeItem(DEMO_SESSION_KEY);
    return null;
  }

  try {
    const raw = sessionStorage.getItem(DEMO_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthSession;
    if (!parsed || !parsed.user || typeof parsed.user.id !== "string") {
      sessionStorage.removeItem(DEMO_SESSION_KEY);
      return null;
    }
    return parsed;
  } catch {
    sessionStorage.removeItem(DEMO_SESSION_KEY);
    return null;
  }
}

// ── Unified Auth API ───────────────────────────────────────────────────────

/**
 * authSignIn — تسجيل دخول موحد
 * Supabase Auth فقط في الإنتاج
 * Demo mode ممنوع في الإنتاج
 */
export async function authSignIn(
  usernameOrEmail: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  // Production requires Supabase
  if (isProduction && !isSupabaseEnabled) {
    return { success: false, error: "التطبيق يتطلب إعداد Supabase للاتصال" };
  }
  
  if (isSupabaseEnabled) {
    return signInWithSupabase(usernameOrEmail, password);
  }
  
  // Demo mode only in development
  if (isDemoAuthAllowed) {
    return signInDemo(usernameOrEmail, password);
  }
  
  return { success: false, error: "تسجيل الدخول يتطلب إعداد Supabase" };
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
  if (!session?.user?.id) return false;

  if (session.isDemo) {
    return (
      isDemoAuthAllowed &&
      session.user.id === "demo-admin" &&
      session.user.role === "admin"
    );
  }

  return ADMIN_ROLES.includes(session.user.role as typeof ADMIN_ROLES[number]);
}

/**
 * isAllowedAdminSession — guard for legacy admin login call sites.
 */
export function isAllowedAdminSession(session: AuthSession | null): boolean {
  return isAdminUser(session);
}

declare global {
  var isAllowedAdminSession: ((session: AuthSession | null) => boolean) | undefined;
}

globalThis.isAllowedAdminSession = isAllowedAdminSession;

/**
 * getAuthMode — وضع المصادقة الحالي
 */
export function getAuthMode(): "supabase" | "demo" {
  return isSupabaseEnabled ? "supabase" : "demo";
}

