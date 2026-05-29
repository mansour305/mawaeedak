import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  LayoutDashboard, Users, Calendar, Wallet, MessageSquare,
  Image as ImageIcon, Paintbrush, Bell, Newspaper,
  FileText, Shield, LogOut, Menu, Loader2, Database, Zap, BookOpen,
  AlertTriangle, ArrowRight, UserPlus, Mail, CheckCircle2, Twitter,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  authSignIn,
  authSignOut,
  getAuthSession,
  getAuthMode,
  type AuthSession,
} from "@/lib/auth";
import { supabase, isSupabaseEnabled } from "@/lib/supabase";

// ── Constants ────────────────────────────────────────────────────────────────
const ALLOWED_ROLES = ["admin", "super_admin"] as const;
const LOGIN_SUBMIT_TIMEOUT_MS = 8000;

// ── Helpers ──────────────────────────────────────────────────────────────────
function hasAdminAccess(session: AuthSession | null): boolean {
  if (!session) return false;
  if (session.isDemo) return true;
  return ALLOWED_ROLES.includes(session.user.role as typeof ALLOWED_ROLES[number]);
}

/** Hard-reset: sign out + wipe all Supabase localStorage keys */
async function hardResetAuth() {
  try {
    if (supabase) await supabase.auth.signOut({ scope: "local" });
  } catch { /* ignore */ }
  Object.keys(localStorage).forEach((k) => {
    if (k.includes("supabase") || k.startsWith("sb-")) {
      localStorage.removeItem(k);
    }
  });
}

// ── Component ────────────────────────────────────────────────────────────────
type AdminAuthPhase =
  | "checking"
  | "login"
  | "forgot_password"
  | "signup"
  | "ready"
  | "access_denied";

/** Wraps a promise with a timeout — rejects with TIMEOUT:label if deadline exceeded */
function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`TIMEOUT:${label}`)), ms)
    ),
  ]);
}

/** Translate login errors to Arabic */
function translateLoginError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  if (msg.startsWith("TIMEOUT:")) return "انتهت مهلة تسجيل الدخول، تحقق من الاتصال وحاول مرة أخرى";
  if (/invalid.*credentials|wrong.*password|Invalid login/i.test(msg)) return "بيانات الدخول غير صحيحة";
  if (/email.*confirm|not confirmed/i.test(msg)) return "يرجى تأكيد بريدك الإلكتروني أولاً";
  if (/fetch|network|Failed to fetch|ERR_/i.test(msg)) return "تعذر الاتصال حالياً، حاول مرة أخرى";
  return "حدث خطأ في تسجيل الدخول، حاول مرة أخرى";
}

/** Translate signup errors to Arabic */
function translateSignupError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  if (/already registered|already exists|already in use/i.test(msg)) return "البريد الإلكتروني مسجّل مسبقاً";
  if (/weak.*password|Password.*short|at least/i.test(msg)) return "كلمة المرور ضعيفة، استخدم 8 أحرف على الأقل";
  if (/invalid.*email/i.test(msg)) return "صيغة البريد الإلكتروني غير صحيحة";
  if (/fetch|network|ERR_/i.test(msg)) return "تعذر الاتصال حالياً، حاول مرة أخرى";
  return "تعذر إنشاء الحساب، حاول مرة أخرى";
}

// ── Shared UI helpers ────────────────────────────────────────────────────────
function AuthPageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-[100dvh] flex items-center justify-center p-6 rtl max-w-[480px] mx-auto app-frame relative"
      style={{
        background: "radial-gradient(ellipse at top, hsl(36 28% 92%) 0%, hsl(36 22% 88%) 100%)",
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, hsl(38 40% 60% / 0.12) 1px, transparent 1px)",
          backgroundSize: "18px 18px",
        }}
      />
      <div className="w-full max-w-sm relative z-10">{children}</div>
    </div>
  );
}

function AuthHeader({ subtitle }: { subtitle: string }) {
  return (
    <div
      className="rounded-t-3xl px-6 py-6 text-center"
      style={{
        background: "linear-gradient(160deg, hsl(22 72% 16%) 0%, hsl(16 72% 12%) 60%, hsl(22 62% 14%) 100%)",
        borderTop: "1px solid hsl(38 65% 38% / 0.4)",
        borderLeft: "1px solid hsl(38 65% 38% / 0.4)",
        borderRight: "1px solid hsl(38 65% 38% / 0.4)",
      }}
    >
      <div className="flex items-center gap-2 justify-center mb-3">
        <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, transparent, hsl(38 55% 42% / 0.5))" }} />
        <div className="w-1.5 h-1.5 rotate-45" style={{ background: "hsl(38 72% 55%)" }} />
        <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, hsl(38 55% 42% / 0.5), transparent)" }} />
      </div>
      <h1 className="text-2xl font-extrabold tracking-wider mb-1" style={{ color: "hsl(38 85% 82%)" }}>
        مواعيدك
      </h1>
      <p className="text-[12px] font-semibold" style={{ color: "hsl(38 55% 58%)" }}>
        {subtitle}
      </p>
    </div>
  );
}

function AuthCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-b-3xl px-6 py-6 shadow-xl"
      style={{
        background: "linear-gradient(145deg, #FFFBF4 0%, hsl(36 28% 93%) 100%)",
        border: "1px solid hsl(38 55% 72% / 0.55)",
        borderTop: "none",
        boxShadow: "0 8px 30px -4px rgba(80,40,10,0.20)",
      }}
    >
      {children}
    </div>
  );
}

function GoldButton({ loading, children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
  return (
    <button
      {...props}
      className="w-full h-12 rounded-xl font-extrabold text-base flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
      style={{
        background: loading
          ? "hsl(38 50% 52%)"
          : "linear-gradient(135deg, hsl(38 72% 48%) 0%, hsl(32 68% 40%) 100%)",
        boxShadow: "0 4px 14px hsl(38 72% 52% / 0.35)",
        color: "#fff",
        border: "none",
      }}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div
      className="px-4 py-3 rounded-xl text-[12px] font-semibold text-center"
      style={{
        background: "hsl(10 55% 52% / 0.10)",
        border: "1px solid hsl(10 55% 52% / 0.25)",
        color: "hsl(10 50% 42%)",
      }}
    >
      {message}
    </div>
  );
}

function BackLink({ onClick, label = "العودة لتسجيل الدخول" }: { onClick: () => void; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1 text-[12px] font-semibold mx-auto mt-1"
      style={{ color: "hsl(38 55% 45%)" }}
    >
      <ArrowRight className="w-3.5 h-3.5" />
      {label}
    </button>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [phase, setPhase] = useState<AdminAuthPhase>("checking");
  const [timedOut, setTimedOut] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  // Forgot password states
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotLoading, setForgotLoading] = useState(false);

  // Signup states
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPwd, setSignupPwd] = useState("");
  const [signupConfirm, setSignupConfirm] = useState("");
  const [signupTerms, setSignupTerms] = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);

  const [location, setLocation] = useLocation();
  const mountedRef = useRef(true);

  // ── URL escape hatches ────────────────────────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    // ?reset=1 — hard reset and show login
    if (params.get("reset") === "1") {
      if (import.meta.env.DEV) console.info("[AdminLogin] ?reset=1 detected");
      void (async () => {
        try {
          if (supabase) await supabase.auth.signOut({ scope: "local" });
        } catch { /* ignore */ }
        Object.keys(localStorage).forEach((k) => {
          if (k.includes("supabase") || k.startsWith("sb-") || k.includes("auth")) {
            localStorage.removeItem(k);
          }
        });
        sessionStorage.clear();
        window.history.replaceState(null, "", "/admin");
        if (mountedRef.current) setPhase("login");
      })();
    }

    // ?view=forgot_password | signup — jump to specific phase (dev/preview only)
    // NOTE: do NOT replaceState here — auth useEffect must still read this param
    const view = params.get("view");
    if (view === "forgot_password" || view === "signup") {
      if (mountedRef.current) setPhase(view as AdminAuthPhase);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Auth state ────────────────────────────────────────────────────────────
  useEffect(() => {
    mountedRef.current = true;

    // If ?view param is active (screenshot/preview mode), skip auth check
    const viewParam = new URLSearchParams(window.location.search).get("view");
    if (viewParam === "forgot_password" || viewParam === "signup") {
      window.history.replaceState(null, "", "/admin");
      setPhase(viewParam as AdminAuthPhase);
      return () => { mountedRef.current = false; };
    }

    const absoluteTimer = setTimeout(() => {
      if (mountedRef.current) {
        setTimedOut(true);
        setPhase("login");
      }
    }, 10000);

    // ── Demo mode ─────────────────────────────────────────────────────────
    if (!isSupabaseEnabled || !supabase) {
      const isDemoAuth = localStorage.getItem("admin_authenticated") === "true";
      if (isDemoAuth) {
        setSession({ user: { id: "demo-admin", role: "admin", displayName: "مدير النظام" }, isDemo: true });
        setPhase("ready");
      } else {
        setPhase("login");
      }
      clearTimeout(absoluteTimer);
      return () => { mountedRef.current = false; };
    }

    // ── Supabase mode ─────────────────────────────────────────────────────
    const buildAuthSession = (
      sbUser: { id: string; email?: string; user_metadata?: Record<string, unknown>; app_metadata?: Record<string, unknown> }
    ): AuthSession => {
      const role = (
        (sbUser.user_metadata?.role as string | undefined) ??
        (sbUser.app_metadata?.role as string | undefined) ??
        "user"
      ) as AuthSession["user"]["role"];
      return {
        user: {
          id: sbUser.id,
          email: sbUser.email,
          role,
          displayName:
            (sbUser.user_metadata?.display_name as string | undefined) ??
            (sbUser.user_metadata?.name as string | undefined) ??
            sbUser.email?.split("@")[0],
        },
        isDemo: false,
      };
    };

    const applySession = (
      sbUser: { id: string; email?: string; user_metadata?: Record<string, unknown>; app_metadata?: Record<string, unknown> } | undefined,
      clearTimer: boolean
    ) => {
      if (clearTimer) clearTimeout(absoluteTimer);
      if (!sbUser) { setPhase("login"); return; }
      const s = buildAuthSession(sbUser);
      const role = s.user.role ?? "user";
      if (ALLOWED_ROLES.includes(role as typeof ALLOWED_ROLES[number])) {
        setSession(s);
        setTimedOut(false);
        setPhase("ready");
      } else {
        setPhase("access_denied");
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, sbSession) => {
      if (!mountedRef.current) return;

      if (event === "INITIAL_SESSION") {
        applySession(sbSession?.user, true);
        return;
      }
      if (event === "SIGNED_IN") {
        clearTimeout(absoluteTimer);
        if (sbSession?.user) {
          const s = buildAuthSession(sbSession.user);
          const role = s.user.role ?? "user";
          if (ALLOWED_ROLES.includes(role as typeof ALLOWED_ROLES[number])) {
            setSession(s);
            setTimedOut(false);
            setPhase("ready");
          }
        }
        return;
      }
      if (event === "SIGNED_OUT") {
        setSession(null);
        if (mountedRef.current) setPhase("login");
        return;
      }
      if (event === "TOKEN_REFRESHED" && sbSession?.user) {
        if (mountedRef.current) setSession(buildAuthSession(sbSession.user));
        return;
      }
      if (event === "USER_UPDATED" && sbSession?.user) {
        if (mountedRef.current) {
          const s = buildAuthSession(sbSession.user);
          const role = s.user.role ?? "user";
          if (ALLOWED_ROLES.includes(role as typeof ALLOWED_ROLES[number])) {
            setSession(s);
          }
        }
        return;
      }
    });

    return () => {
      mountedRef.current = false;
      clearTimeout(absoluteTimer);
      subscription.unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Login handler ─────────────────────────────────────────────────────────
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setLoginError(null);
    setSubmitting(true);

    try {
      if (!supabase) {
        const { success, error } = await withTimeout(
          authSignIn(identifier.trim(), password),
          LOGIN_SUBMIT_TIMEOUT_MS,
          "signIn"
        );
        if (!success) {
          setLoginError(error ?? "بيانات الدخول غير صحيحة");
          return;
        }
        const s = await withTimeout(getAuthSession(), 5000, "getSession");
        setSession(s);
        setPhase("ready");
        return;
      }

      const { error: signInError } = await withTimeout(
        supabase.auth.signInWithPassword({ email: identifier.trim(), password }),
        LOGIN_SUBMIT_TIMEOUT_MS,
        "signIn"
      );

      if (signInError) {
        setLoginError(translateLoginError(signInError));
        return;
      }

      const { data: { user }, error: userError } = await withTimeout(
        supabase.auth.getUser(),
        5000,
        "getUser"
      );

      if (userError || !user) {
        setLoginError("تعذر قراءة بيانات الحساب، حاول مرة أخرى");
        await supabase.auth.signOut({ scope: "local" });
        return;
      }

      const roleVal =
        (user.user_metadata?.role as string | undefined) ??
        (user.app_metadata?.role as string | undefined) ??
        "user";

      if (!ALLOWED_ROLES.includes(roleVal as typeof ALLOWED_ROLES[number])) {
        setPhase("access_denied");
        return;
      }

      const authSession: AuthSession = {
        user: {
          id: user.id,
          email: user.email,
          role: roleVal as AuthSession["user"]["role"],
          displayName:
            user.user_metadata?.display_name ??
            user.user_metadata?.name ??
            user.email?.split("@")[0],
        },
        isDemo: false,
      };

      setSession(authSession);
      setPhase("ready");
      setTimedOut(false);

    } catch (err) {
      setLoginError(translateLoginError(err));
    } finally {
      if (mountedRef.current) {
        setSubmitting(false);
        setPassword("");
      }
    }
  };

  // ── Forgot password handler ───────────────────────────────────────────────
  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (forgotLoading) return;
    setForgotError(null);
    setForgotLoading(true);
    try {
      if (supabase) {
        const redirectTo =
          typeof window !== "undefined"
            ? `${window.location.origin}/reset-password`
            : "/reset-password";
        await supabase.auth.resetPasswordForEmail(forgotEmail.trim(), { redirectTo });
      }
      // Always show success — never reveal if email exists
      if (mountedRef.current) setForgotSent(true);
    } catch {
      // Still show generic success for security
      if (mountedRef.current) setForgotSent(true);
    } finally {
      if (mountedRef.current) setForgotLoading(false);
    }
  };

  // ── Signup handler ────────────────────────────────────────────────────────
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signupLoading) return;
    setSignupError(null);

    if (signupPwd !== signupConfirm) {
      setSignupError("كلمة المرور وتأكيدها غير متطابقتان");
      return;
    }
    if (signupPwd.length < 8) {
      setSignupError("كلمة المرور يجب أن تكون 8 أحرف على الأقل");
      return;
    }
    if (!signupName.trim()) {
      setSignupError("يرجى إدخال الاسم");
      return;
    }
    if (!signupTerms) {
      setSignupError("يجب الموافقة على الشروط وسياسة الخصوصية");
      return;
    }

    setSignupLoading(true);
    try {
      if (!supabase) {
        setSignupError("إنشاء الحساب يتطلب الاتصال بخدمة المصادقة");
        return;
      }
      const emailRedirectTo =
        typeof window !== "undefined"
          ? `${window.location.origin}/auth/callback`
          : "/auth/callback";
      const { error } = await supabase.auth.signUp({
        email: signupEmail.trim(),
        password: signupPwd,
        options: {
          emailRedirectTo,
          data: { role: "user", name: signupName.trim() },
        },
      });
      if (error) {
        setSignupError(translateSignupError(error));
        return;
      }
      if (mountedRef.current) setSignupSuccess(true);
    } catch (err) {
      if (mountedRef.current) setSignupError(translateSignupError(err));
    } finally {
      if (mountedRef.current) setSignupLoading(false);
    }
  };

  // ── Hard reset (back-to-login) ────────────────────────────────────────────
  const handleBackToLogin = async () => {
    setSubmitting(false);
    setLoginError(null);
    setTimedOut(false);
    setIdentifier("");
    setPassword("");
    setSession(null);
    setForgotEmail("");
    setForgotSent(false);
    setForgotError(null);
    setSignupName("");
    setSignupEmail("");
    setSignupPwd("");
    setSignupConfirm("");
    setSignupTerms(false);
    setSignupError(null);
    setSignupSuccess(false);
    try {
      if (supabase) await supabase.auth.signOut({ scope: "local" });
    } catch { /* ignore */ }
    Object.keys(localStorage).forEach((k) => {
      if (k.includes("supabase") || k.startsWith("sb-") || k.includes("auth")) {
        localStorage.removeItem(k);
      }
    });
    sessionStorage.clear();
    window.history.replaceState(null, "", "/admin");
    if (mountedRef.current) setPhase("login");
  };

  // ── Sign out ──────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    await authSignOut();
    setSession(null);
    setPhase("login");
    setLocation("/");
  };

  const authMode = getAuthMode();
  const isSupabase = authMode === "supabase";

  // ── Render: checking ──────────────────────────────────────────────────────
  if (phase === "checking") {
    return (
      <div
        className="min-h-[100dvh] flex items-center justify-center max-w-[480px] mx-auto app-frame"
        style={{ background: "hsl(var(--background))" }}
      >
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{
              background: "linear-gradient(145deg, hsl(22 62% 22%), hsl(18 68% 18%))",
              boxShadow: "0 4px 16px rgba(80,40,10,0.25)",
              border: "1.5px solid hsl(38 55% 40% / 0.4)",
            }}
          >
            <Loader2 className="w-7 h-7 animate-spin" style={{ color: "hsl(38 82% 68%)" }} />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold" style={{ color: "hsl(38 40% 52%)" }}>
              جارٍ التحقق…
            </p>
            <p className="text-[11px] mt-1" style={{ color: "hsl(38 25% 65%)" }}>
              مواعيدك — لوحة المالك
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Render: access_denied ─────────────────────────────────────────────────
  if (phase === "access_denied") {
    return (
      <AuthPageWrapper>
        <AuthHeader subtitle="لوحة المالك" />
        <div
          className="rounded-b-3xl px-6 py-8 shadow-xl"
          style={{
            background: "linear-gradient(145deg, #FFFBF4 0%, hsl(36 28% 93%) 100%)",
            border: "1px solid hsl(38 55% 72% / 0.55)",
            borderTop: "none",
            boxShadow: "0 8px 30px -4px rgba(80,40,10,0.20)",
          }}
        >
          <div className="text-center space-y-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto"
              style={{
                background: "hsl(10 55% 48% / 0.12)",
                border: "1.5px solid hsl(10 55% 48% / 0.3)",
              }}
            >
              <AlertTriangle className="w-6 h-6" style={{ color: "hsl(10 50% 45%)" }} />
            </div>
            <div>
              <h2 className="font-bold text-base" style={{ color: "hsl(22 45% 25%)" }}>
                لا تملك صلاحية الوصول
              </h2>
              <p className="text-[12px] mt-2 leading-relaxed" style={{ color: "hsl(22 30% 45%)" }}>
                هذا الحساب لا يملك صلاحية لوحة المالك.
                <br />
                لوحة المالك مخصصة للمالك وفريق الإدارة فقط.
              </p>
            </div>
            <button
              type="button"
              onClick={handleBackToLogin}
              className="w-full h-11 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
              style={{
                background: "linear-gradient(135deg, hsl(38 72% 48%) 0%, hsl(32 68% 40%) 100%)",
                color: "#fff",
                boxShadow: "0 4px 14px hsl(38 72% 52% / 0.30)",
              }}
            >
              <ArrowRight className="w-4 h-4" />
              العودة لتسجيل الدخول
            </button>
            <button
              type="button"
              onClick={() => { setPhase("signup"); }}
              className="text-[12px] font-semibold"
              style={{ color: "hsl(38 55% 42%)" }}
            >
              إنشاء حساب مستخدم عادي
            </button>
          </div>
        </div>
      </AuthPageWrapper>
    );
  }

  // ── Render: forgot_password ───────────────────────────────────────────────
  if (phase === "forgot_password") {
    return (
      <AuthPageWrapper>
        <AuthHeader subtitle="استعادة كلمة المرور" />
        <div
          className="rounded-b-3xl px-6 py-6 shadow-xl"
          style={{
            background: "linear-gradient(145deg, #FFFBF4 0%, hsl(36 28% 93%) 100%)",
            border: "1px solid hsl(38 55% 72% / 0.55)",
            borderTop: "none",
            boxShadow: "0 8px 30px -4px rgba(80,40,10,0.20)",
          }}
        >
          {forgotSent ? (
            <div className="text-center space-y-4 py-2">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto"
                style={{
                  background: "hsl(130 45% 45% / 0.12)",
                  border: "1.5px solid hsl(130 45% 45% / 0.3)",
                }}
              >
                <CheckCircle2 className="w-6 h-6" style={{ color: "hsl(130 40% 40%)" }} />
              </div>
              <div>
                <h3 className="font-bold text-sm mb-1" style={{ color: "hsl(22 45% 28%)" }}>
                  تم الإرسال
                </h3>
                <p className="text-[12px] leading-relaxed" style={{ color: "hsl(22 30% 45%)" }}>
                  إذا كان البريد الإلكتروني مسجلاً في المنصة، سيصلك رابط استعادة كلمة المرور.
                </p>
              </div>
              <BackLink onClick={handleBackToLogin} />
            </div>
          ) : (
            <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
              <div className="space-y-1">
                <p className="text-[12px] text-center leading-relaxed mb-3" style={{ color: "hsl(22 30% 45%)" }}>
                  أدخل بريدك الإلكتروني وسنرسل لك رابط استعادة كلمة المرور
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-bold" style={{ color: "hsl(22 45% 30%)" }}>
                  البريد الإلكتروني
                </Label>
                <Input
                  type="email"
                  value={forgotEmail}
                  onChange={e => setForgotEmail(e.target.value)}
                  dir="ltr"
                  className="h-12 rounded-xl text-sm"
                  style={{ background: "#fff", border: "1.5px solid hsl(38 45% 72% / 0.7)" }}
                  autoComplete="email"
                  placeholder="example@email.com"
                  required
                />
              </div>

              {!isSupabase && (
                <div
                  className="px-4 py-3 rounded-xl text-[12px] font-semibold text-center"
                  style={{
                    background: "hsl(10 55% 52% / 0.10)",
                    border: "1px solid hsl(10 55% 52% / 0.25)",
                    color: "hsl(10 50% 42%)",
                  }}
                >
                  تعذر الاتصال بخدمة المصادقة حالياً
                </div>
              )}

              {forgotError && <div
                className="px-4 py-3 rounded-xl text-[12px] font-semibold text-center"
                style={{
                  background: "hsl(10 55% 52% / 0.10)",
                  border: "1px solid hsl(10 55% 52% / 0.25)",
                  color: "hsl(10 50% 42%)",
                }}
              >{forgotError}</div>}

              {isSupabase && (
                <GoldButton type="submit" loading={forgotLoading}>
                  إرسال رابط الاستعادة
                </GoldButton>
              )}

              <div className="flex justify-center">
                <BackLink onClick={handleBackToLogin} />
              </div>
            </form>
          )}
        </div>
      </AuthPageWrapper>
    );
  }

  // ── Render: signup ────────────────────────────────────────────────────────
  if (phase === "signup") {
    return (
      <AuthPageWrapper>
        <AuthHeader subtitle="إنشاء حساب جديد" />
        <div
          className="rounded-b-3xl px-6 py-6 shadow-xl"
          style={{
            background: "linear-gradient(145deg, #FFFBF4 0%, hsl(36 28% 93%) 100%)",
            border: "1px solid hsl(38 55% 72% / 0.55)",
            borderTop: "none",
            boxShadow: "0 8px 30px -4px rgba(80,40,10,0.20)",
          }}
        >
          {signupSuccess ? (
            <div className="text-center space-y-4 py-2">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto"
                style={{
                  background: "hsl(130 45% 45% / 0.12)",
                  border: "1.5px solid hsl(130 45% 45% / 0.3)",
                }}
              >
                <CheckCircle2 className="w-6 h-6" style={{ color: "hsl(130 40% 40%)" }} />
              </div>
              <div>
                <h3 className="font-bold text-sm mb-1" style={{ color: "hsl(22 45% 28%)" }}>
                  تم إنشاء الحساب
                </h3>
                <p className="text-[12px] leading-relaxed" style={{ color: "hsl(22 30% 45%)" }}>
                  تحقق من بريدك الإلكتروني لتفعيل حسابك والبدء في استخدام المنصة.
                </p>
              </div>
              <BackLink onClick={handleBackToLogin} />
            </div>
          ) : (
            <form onSubmit={handleSignupSubmit} className="space-y-4">
              <div
                className="px-3 py-2 rounded-xl text-[11px] text-center"
                style={{
                  background: "hsl(38 55% 52% / 0.08)",
                  border: "1px solid hsl(38 55% 52% / 0.2)",
                  color: "hsl(32 40% 40%)",
                }}
              >
                الحساب الجديد للاستخدام الشخصي فقط — لا يمنح صلاحية الإدارة
              </div>

              {!isSupabase && (
                <div
                  className="px-4 py-3 rounded-xl text-[12px] text-center"
                  style={{
                    background: "hsl(10 55% 52% / 0.10)",
                    border: "1px solid hsl(10 55% 52% / 0.25)",
                    color: "hsl(10 50% 42%)",
                  }}
                >
                  تعذر الاتصال بخدمة المصادقة حالياً
                </div>
              )}

              {isSupabase && (
                <>
                  <div className="space-y-2">
                    <Label className="text-sm font-bold" style={{ color: "hsl(22 45% 30%)" }}>الاسم</Label>
                    <Input
                      type="text"
                      value={signupName}
                      onChange={e => setSignupName(e.target.value)}
                      className="h-11 rounded-xl text-sm"
                      style={{ background: "#fff", border: "1.5px solid hsl(38 45% 72% / 0.7)" }}
                      placeholder="اسمك الكامل"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-bold" style={{ color: "hsl(22 45% 30%)" }}>البريد الإلكتروني</Label>
                    <Input
                      type="email"
                      value={signupEmail}
                      onChange={e => setSignupEmail(e.target.value)}
                      dir="ltr"
                      className="h-11 rounded-xl text-sm"
                      style={{ background: "#fff", border: "1.5px solid hsl(38 45% 72% / 0.7)" }}
                      autoComplete="email"
                      placeholder="example@email.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-bold" style={{ color: "hsl(22 45% 30%)" }}>كلمة المرور</Label>
                    <Input
                      type="password"
                      value={signupPwd}
                      onChange={e => setSignupPwd(e.target.value)}
                      dir="ltr"
                      className="h-11 rounded-xl text-sm"
                      style={{ background: "#fff", border: "1.5px solid hsl(38 45% 72% / 0.7)" }}
                      autoComplete="new-password"
                      placeholder="8 أحرف على الأقل"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-bold" style={{ color: "hsl(22 45% 30%)" }}>تأكيد كلمة المرور</Label>
                    <Input
                      type="password"
                      value={signupConfirm}
                      onChange={e => setSignupConfirm(e.target.value)}
                      dir="ltr"
                      className="h-11 rounded-xl text-sm"
                      style={{ background: "#fff", border: "1.5px solid hsl(38 45% 72% / 0.7)" }}
                      autoComplete="new-password"
                      placeholder="أعد كتابة كلمة المرور"
                      required
                    />
                  </div>
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={signupTerms}
                      onChange={e => setSignupTerms(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded accent-amber-700"
                    />
                    <span className="text-[11px] leading-relaxed" style={{ color: "hsl(22 30% 45%)" }}>
                      أوافق على{" "}
                      <a href="/terms" target="_blank" className="underline font-semibold" style={{ color: "hsl(38 60% 42%)" }}>
                        الشروط والأحكام
                      </a>{" "}
                      و{" "}
                      <a href="/privacy" target="_blank" className="underline font-semibold" style={{ color: "hsl(38 60% 42%)" }}>
                        سياسة الخصوصية
                      </a>
                    </span>
                  </label>
                </>
              )}

              {signupError && (
                <div
                  className="px-4 py-3 rounded-xl text-[12px] font-semibold text-center"
                  style={{
                    background: "hsl(10 55% 52% / 0.10)",
                    border: "1px solid hsl(10 55% 52% / 0.25)",
                    color: "hsl(10 50% 42%)",
                  }}
                >
                  {signupError}
                </div>
              )}

              {isSupabase && (
                <GoldButton type="submit" loading={signupLoading}>
                  <UserPlus className="w-4 h-4" />
                  إنشاء الحساب
                </GoldButton>
              )}

              <div className="flex justify-center">
                <BackLink onClick={handleBackToLogin} />
              </div>
            </form>
          )}
        </div>
      </AuthPageWrapper>
    );
  }

  // ── Render: login form ────────────────────────────────────────────────────
  if (phase === "login") {
    return (
      <AuthPageWrapper>
        <AuthHeader subtitle="لوحة المالك · تسجيل دخول الإدارة" />
        <div
          className="rounded-b-3xl px-6 py-6 shadow-xl"
          style={{
            background: "linear-gradient(145deg, #FFFBF4 0%, hsl(36 28% 93%) 100%)",
            border: "1px solid hsl(38 55% 72% / 0.55)",
            borderTop: "none",
            boxShadow: "0 8px 30px -4px rgba(80,40,10,0.20)",
          }}
        >
          {timedOut && (
            <div
              className="mb-4 px-4 py-3 rounded-xl text-[12px] font-semibold text-center"
              style={{
                background: "hsl(38 60% 52% / 0.12)",
                border: "1px solid hsl(38 60% 52% / 0.3)",
                color: "hsl(32 55% 38%)",
              }}
            >
              انتهت مهلة التحقق، سجّل الدخول مرة أخرى
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-bold" style={{ color: "hsl(22 45% 30%)" }}>
                {isSupabase ? "البريد الإلكتروني" : "اسم المستخدم"}
              </Label>
              <Input
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                type={isSupabase ? "email" : "text"}
                dir="ltr"
                className="h-12 rounded-xl text-sm"
                style={{ background: "#fff", border: "1.5px solid hsl(38 45% 72% / 0.7)" }}
                autoComplete={isSupabase ? "email" : "username"}
                placeholder={isSupabase ? "example@email.com" : "admin"}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-bold" style={{ color: "hsl(22 45% 30%)" }}>
                  كلمة المرور
                </Label>
                {isSupabase && (
                  <button
                    type="button"
                    onClick={() => { setLoginError(null); setPhase("forgot_password"); }}
                    className="text-[11px] font-semibold"
                    style={{ color: "hsl(38 55% 45%)" }}
                  >
                    نسيت كلمة المرور؟
                  </button>
                )}
              </div>
              <Input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                dir="ltr"
                className="h-12 rounded-xl text-sm"
                style={{ background: "#fff", border: "1.5px solid hsl(38 45% 72% / 0.7)" }}
                autoComplete="current-password"
                required
              />
            </div>

            {loginError && (
              <div
                className="px-4 py-3 rounded-xl text-[12px] font-semibold text-center"
                style={{
                  background: "hsl(10 55% 52% / 0.10)",
                  border: "1px solid hsl(10 55% 52% / 0.25)",
                  color: "hsl(10 50% 42%)",
                }}
              >
                {loginError}
              </div>
            )}

            <GoldButton type="submit" loading={submitting}>
              تسجيل الدخول
            </GoldButton>
          </form>

          <div
            className="mt-5 pt-4 text-center space-y-2"
            style={{ borderTop: "1px solid hsl(38 30% 82% / 0.6)" }}
          >
            <p className="text-[11px]" style={{ color: "hsl(22 25% 55%)" }}>
              لوحة المالك مخصصة لإدارة التطبيق
            </p>
            <button
              type="button"
              onClick={() => { setLoginError(null); setPhase("signup"); }}
              className="flex items-center gap-1.5 text-[12px] font-bold mx-auto"
              style={{ color: "hsl(38 60% 42%)" }}
            >
              <UserPlus className="w-3.5 h-3.5" />
              تسجيل عضو جديد
            </button>
          </div>
        </div>
      </AuthPageWrapper>
    );
  }

  // ── Render: ready (dashboard) ─────────────────────────────────────────────
  const menuItems = [
    { label: "لوحة التحكم", icon: LayoutDashboard, path: "/admin/dashboard" },
    { label: "إدارة الأعضاء", icon: Users, path: "/admin/members" },
    { label: "إدارة المواعيد", icon: Calendar, path: "/admin/events" },
    { label: "الرواتب والدعم", icon: Wallet, path: "/admin/financial" },
    { label: "الرسائل اليومية", icon: MessageSquare, path: "/admin/messages" },
    { label: "ستوري اليوم", icon: ImageIcon, path: "/admin/story" },
    { label: "الثيمات", icon: Paintbrush, path: "/admin/themes" },
    { label: "الإشعارات", icon: Bell, path: "/admin/notifications" },
    { label: "الأخبار والوظائف", icon: Newspaper, path: "/admin/news-jobs" },
    { label: "الشكاوى والاقتراحات", icon: MessageSquare, path: "/admin/complaints" },
    { label: "أتمتة X (تويتر)", icon: Twitter, path: "/admin/social" },
    { label: "التقارير", icon: FileText, path: "/admin/reports" },
    { label: "الصلاحيات", icon: Shield, path: "/admin/permissions" },
    { label: "طبقة البيانات", icon: Database, path: "/admin/data-layer" },
    { label: "الأتمتة اليومية", icon: Zap, path: "/admin/automation" },
    { label: "دليل التصميم", icon: BookOpen, path: "/admin/visual-guide" },
  ];

  return (
    <div className="min-h-[100dvh] bg-background text-foreground flex flex-col max-w-[480px] mx-auto shadow-2xl relative overflow-hidden rtl">
      <header className="heritage-header sticky top-0 h-[58px] border-b z-40 flex items-center px-4 justify-between">
        <div className="flex items-center gap-3">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 text-[hsl(var(--header-fg))] hover:bg-white/10 hover:text-[hsl(var(--header-fg))]"
              >
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] rtl p-0 flex flex-col">
              {/* Sidebar Header */}
              <div
                className="p-5 border-b"
                style={{
                  background: "linear-gradient(160deg, hsl(22 72% 16%) 0%, hsl(16 72% 12%) 100%)",
                  borderColor: "hsl(38 55% 35% / 0.4)",
                }}
              >
                <h2 className="text-[17px] font-extrabold tracking-wide mb-0.5" style={{ color: "hsl(38 85% 82%)" }}>
                  مواعيدك
                </h2>
                <p className="text-[11px] font-semibold mb-2" style={{ color: "hsl(38 55% 58%)" }}>
                  لوحة المالك
                </p>
                {session?.user.displayName && (
                  <p className="text-[11px]" style={{ color: "hsl(38 45% 65%)" }}>
                    {session.user.displayName}
                  </p>
                )}
                {session?.user.role && (
                  <span
                    className="text-[9px] px-2 py-0.5 rounded-full font-bold inline-block mt-1"
                    style={{
                      background: "hsl(38 72% 52% / 0.2)",
                      color: "hsl(38 72% 68%)",
                      border: "1px solid hsl(38 72% 52% / 0.3)",
                    }}
                  >
                    {session.user.role === "super_admin" ? "المالك" :
                     session.user.role === "admin" ? "مدير النظام" :
                     "مدير"}
                  </span>
                )}
              </div>
              <div className="flex-1 overflow-y-auto py-2" style={{ background: "hsl(var(--card))" }}>
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    location === item.path ||
                    (location === "/admin" && item.path === "/admin/dashboard");
                  return (
                    <Link key={item.path} href={item.path}>
                      <span
                        className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-all"
                        style={
                          isActive
                            ? {
                                background: "hsl(38 72% 52% / 0.12)",
                                color: "hsl(38 62% 38%)",
                                borderRight: "3px solid hsl(38 72% 52%)",
                                fontWeight: 700,
                              }
                            : { color: "hsl(38 20% 50%)" }
                        }
                      >
                        <Icon className="w-4.5 h-4.5" />
                        <span className="text-[13px]">{item.label}</span>
                      </span>
                    </Link>
                  );
                })}
              </div>
              <div className="p-4 border-t" style={{ borderColor: "hsl(38 30% 80% / 0.5)" }}>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 h-10 rounded-xl font-bold text-sm transition-all"
                  style={{
                    background: "hsl(10 55% 52% / 0.10)",
                    border: "1px solid hsl(10 55% 52% / 0.25)",
                    color: "hsl(10 50% 42%)",
                  }}
                >
                  <LogOut className="w-4 h-4" />
                  تسجيل الخروج
                </button>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-bold" style={{ color: "hsl(var(--header-fg))" }}>
            لوحة المالك
          </span>
        </div>

        <div className="w-8" />
      </header>

      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
