import { useState } from "react";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  LogIn,
  UserPlus,
  Mail,
  Loader2,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useStore } from "@/hooks/useStore";

export type AuthMode = "login" | "signup" | "forgot";

const SUBMIT_TIMEOUT_MS = 8000;

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`TIMEOUT:${label}`)), ms)
    ),
  ]);
}

function translateLoginError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  if (msg.startsWith("TIMEOUT:")) return "انتهت مهلة تسجيل الدخول، تحقق من الاتصال وحاول مرة أخرى";
  if (/invalid.*credentials|wrong.*password|Invalid login/i.test(msg)) return "بيانات الدخول غير صحيحة";
  if (/email.*confirm|not confirmed/i.test(msg)) return "يرجى تأكيد بريدك الإلكتروني أولاً";
  if (/fetch|network|Failed to fetch|ERR_/i.test(msg)) return "تعذر الاتصال حالياً، حاول مرة أخرى";
  return "حدث خطأ في تسجيل الدخول، حاول مرة أخرى";
}

function translateSignupError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  if (/already registered|already exists|already in use/i.test(msg)) return "البريد الإلكتروني مسجّل مسبقاً";
  if (/weak.*password|Password.*short|at least/i.test(msg)) return "كلمة المرور ضعيفة، استخدم 8 أحرف على الأقل";
  if (/invalid.*email/i.test(msg)) return "صيغة البريد الإلكتروني غير صحيحة";
  if (/fetch|network|ERR_/i.test(msg)) return "تعذر الاتصال حالياً، حاول مرة أخرى";
  return "تعذر إنشاء الحساب، حاول مرة أخرى";
}

function PageWrapper({ children }: { children: React.ReactNode }) {
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

function Header({ subtitle }: { subtitle: string }) {
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
      <h1 className="font-extrabold text-xl" style={{ color: "hsl(38 72% 78%)" }}>
        مواعيدك
      </h1>
      <p className="text-[12px] mt-1" style={{ color: "hsl(38 40% 60%)" }}>
        {subtitle}
      </p>
    </div>
  );
}

function CardBody({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-b-3xl px-6 py-7 shadow-xl"
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

const goldButtonStyle: React.CSSProperties = {
  background: "linear-gradient(135deg, hsl(38 72% 48%) 0%, hsl(32 68% 40%) 100%)",
  color: "#fff",
  boxShadow: "0 4px 14px hsl(38 72% 52% / 0.30)",
};

export default function AuthPage({ mode }: { mode: AuthMode }) {
  const [, setLocation] = useLocation();
  const { setUser } = useStore();

  // login state
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // signup state
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPwd, setSignupPwd] = useState("");
  const [signupConfirm, setSignupConfirm] = useState("");
  const [signupTerms, setSignupTerms] = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);

  // forgot state
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  // ── Login: identity only, NO admin role gate ──
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setLoginError(null);
    setSubmitting(true);
    try {
      if (!supabase) {
        setLoginError("تعذر الاتصال بخدمة المصادقة حالياً، حاول لاحقاً");
        return;
      }
      const { error: signInError } = await withTimeout(
        supabase.auth.signInWithPassword({ email: identifier.trim(), password }),
        SUBMIT_TIMEOUT_MS,
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
      const displayName =
        (user.user_metadata?.display_name as string | undefined) ??
        (user.user_metadata?.name as string | undefined) ??
        user.email?.split("@")[0] ??
        "";
      setUser({ email: user.email ?? "", name: displayName });
      setLocation("/account");
    } catch (err) {
      setLoginError(translateLoginError(err));
    } finally {
      setSubmitting(false);
      setPassword("");
    }
  };

  // ── Signup: defaults role=user ──
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
      setSignupSuccess(true);
    } catch (err) {
      setSignupError(translateSignupError(err));
    } finally {
      setSignupLoading(false);
    }
  };

  // ── Forgot password ──
  const handleForgotSubmit = async (e: React.FormEvent) => {
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
      setForgotSent(true);
    } catch {
      setForgotSent(true);
    } finally {
      setForgotLoading(false);
    }
  };

  // ── Render: LOGIN ──
  if (mode === "login") {
    return (
      <PageWrapper>
        <Header subtitle="أهلاً بك في مواعيدك" />
        <CardBody>
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="login-email" className="text-[13px] font-semibold" style={{ color: "hsl(22 45% 28%)" }}>
                البريد الإلكتروني
              </Label>
              <Input
                id="login-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                dir="ltr"
                className="text-right"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="name@example.com"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="login-pwd" className="text-[13px] font-semibold" style={{ color: "hsl(22 45% 28%)" }}>
                كلمة المرور
              </Label>
              <Input
                id="login-pwd"
                type="password"
                autoComplete="current-password"
                dir="ltr"
                className="text-right"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                required
              />
            </div>

            {loginError && (
              <p className="text-[12px] text-red-600 text-center font-medium">{loginError}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full h-11 rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60"
              style={goldButtonStyle}
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
              دخول إلى حسابي
            </button>
          </form>

          <div className="mt-5 space-y-2 text-center">
            <button
              type="button"
              onClick={() => setLocation("/forgot-password")}
              className="text-[12px] font-semibold"
              style={{ color: "hsl(200 55% 42%)" }}
            >
              نسيت كلمة المرور؟
            </button>
            <div className="h-px" style={{ background: "hsl(38 45% 70% / 0.4)" }} />
            <p className="text-[12px]" style={{ color: "hsl(22 30% 45%)" }}>
              ليس لديك حساب؟{" "}
              <button
                type="button"
                onClick={() => setLocation("/register")}
                className="font-bold"
                style={{ color: "hsl(150 45% 35%)" }}
              >
                إنشاء حساب جديد
              </button>
            </p>
          </div>
        </CardBody>
      </PageWrapper>
    );
  }

  // ── Render: SIGNUP ──
  if (mode === "signup") {
    if (signupSuccess) {
      return (
        <PageWrapper>
          <Header subtitle="إنشاء حساب جديد" />
          <CardBody>
            <div className="text-center space-y-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto"
                style={{ background: "hsl(150 45% 40% / 0.12)", border: "1.5px solid hsl(150 45% 40% / 0.3)" }}
              >
                <CheckCircle2 className="w-6 h-6" style={{ color: "hsl(150 45% 35%)" }} />
              </div>
              <div>
                <h2 className="font-bold text-base" style={{ color: "hsl(22 45% 25%)" }}>
                  تم إنشاء حسابك
                </h2>
                <p className="text-[12px] mt-2 leading-relaxed" style={{ color: "hsl(22 30% 45%)" }}>
                  أرسلنا رابط تأكيد إلى بريدك الإلكتروني.
                  <br />
                  فعّل حسابك ثم سجّل الدخول.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setLocation("/login")}
                className="w-full h-11 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
                style={goldButtonStyle}
              >
                <ArrowRight className="w-4 h-4" />
                الذهاب لتسجيل الدخول
              </button>
            </div>
          </CardBody>
        </PageWrapper>
      );
    }
    return (
      <PageWrapper>
        <Header subtitle="إنشاء حساب جديد" />
        <CardBody>
          <form onSubmit={handleSignupSubmit} className="space-y-3.5">
            <div className="space-y-1.5">
              <Label htmlFor="su-name" className="text-[13px] font-semibold" style={{ color: "hsl(22 45% 28%)" }}>
                الاسم
              </Label>
              <Input
                id="su-name"
                type="text"
                className="text-right"
                value={signupName}
                onChange={(e) => setSignupName(e.target.value)}
                placeholder="اسمك الكامل"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="su-email" className="text-[13px] font-semibold" style={{ color: "hsl(22 45% 28%)" }}>
                البريد الإلكتروني
              </Label>
              <Input
                id="su-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                dir="ltr"
                className="text-right"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                placeholder="name@example.com"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="su-pwd" className="text-[13px] font-semibold" style={{ color: "hsl(22 45% 28%)" }}>
                كلمة المرور
              </Label>
              <Input
                id="su-pwd"
                type="password"
                autoComplete="new-password"
                dir="ltr"
                className="text-right"
                value={signupPwd}
                onChange={(e) => setSignupPwd(e.target.value)}
                placeholder="8 أحرف على الأقل"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="su-confirm" className="text-[13px] font-semibold" style={{ color: "hsl(22 45% 28%)" }}>
                تأكيد كلمة المرور
              </Label>
              <Input
                id="su-confirm"
                type="password"
                autoComplete="new-password"
                dir="ltr"
                className="text-right"
                value={signupConfirm}
                onChange={(e) => setSignupConfirm(e.target.value)}
                placeholder="********"
                required
              />
            </div>

            <label className="flex items-start gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={signupTerms}
                onChange={(e) => setSignupTerms(e.target.checked)}
                className="mt-0.5"
              />
              <span className="text-[11px] leading-relaxed" style={{ color: "hsl(22 30% 45%)" }}>
                أوافق على الشروط والأحكام وسياسة الخصوصية
              </span>
            </label>

            {signupError && (
              <p className="text-[12px] text-red-600 text-center font-medium">{signupError}</p>
            )}

            <button
              type="submit"
              disabled={signupLoading}
              className="w-full h-11 rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60"
              style={goldButtonStyle}
            >
              {signupLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              إنشاء الحساب
            </button>
          </form>

          <p className="text-[12px] text-center mt-5" style={{ color: "hsl(22 30% 45%)" }}>
            لديك حساب بالفعل؟{" "}
            <button
              type="button"
              onClick={() => setLocation("/login")}
              className="font-bold"
              style={{ color: "hsl(150 45% 35%)" }}
            >
              تسجيل الدخول
            </button>
          </p>
        </CardBody>
      </PageWrapper>
    );
  }

  // ── Render: FORGOT ──
  return (
    <PageWrapper>
      <Header subtitle="استعادة كلمة المرور" />
      <CardBody>
        {forgotSent ? (
          <div className="text-center space-y-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto"
              style={{ background: "hsl(150 45% 40% / 0.12)", border: "1.5px solid hsl(150 45% 40% / 0.3)" }}
            >
              <CheckCircle2 className="w-6 h-6" style={{ color: "hsl(150 45% 35%)" }} />
            </div>
            <p className="text-[12px] leading-relaxed" style={{ color: "hsl(22 30% 45%)" }}>
              إذا كان البريد مسجّلاً لدينا، فستصلك رسالة بخطوات إعادة تعيين كلمة المرور.
            </p>
            <button
              type="button"
              onClick={() => setLocation("/login")}
              className="w-full h-11 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
              style={goldButtonStyle}
            >
              <ArrowRight className="w-4 h-4" />
              العودة لتسجيل الدخول
            </button>
          </div>
        ) : (
          <form onSubmit={handleForgotSubmit} className="space-y-4">
            <p className="text-[12px] leading-relaxed text-center" style={{ color: "hsl(22 30% 45%)" }}>
              أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة تعيين كلمة المرور.
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="fp-email" className="text-[13px] font-semibold" style={{ color: "hsl(22 45% 28%)" }}>
                البريد الإلكتروني
              </Label>
              <Input
                id="fp-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                dir="ltr"
                className="text-right"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="name@example.com"
                required
              />
            </div>

            {forgotError && (
              <p className="text-[12px] text-red-600 text-center font-medium">{forgotError}</p>
            )}

            <button
              type="submit"
              disabled={forgotLoading}
              className="w-full h-11 rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60"
              style={goldButtonStyle}
            >
              {forgotLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
              إرسال رابط الاستعادة
            </button>

            <p className="text-[12px] text-center" style={{ color: "hsl(22 30% 45%)" }}>
              <button
                type="button"
                onClick={() => setLocation("/login")}
                className="font-bold"
                style={{ color: "hsl(150 45% 35%)" }}
              >
                العودة لتسجيل الدخول
              </button>
            </p>
          </form>
        )}
      </CardBody>
    </PageWrapper>
  );
}
