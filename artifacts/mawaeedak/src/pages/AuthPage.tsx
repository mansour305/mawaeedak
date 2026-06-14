import { type FormEvent, type ReactNode, useState } from "react";
import { useLocation } from "wouter";
import { CheckCircle2, Eye, EyeOff, Loader2, Lock, Mail, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { MawaeedakLogo } from "@/components/layout/TopBar";
import { supabase, isSupabaseEnabled } from "@/lib/supabase";
import { useStore } from "@/hooks/useStore";
import { authSignIn } from "@/lib/auth";

export type AuthMode = "login" | "signup" | "forgot";

const SUBMIT_TIMEOUT_MS = 8000;
const BROWN = "#8A6B3D";
const INK = "#2F2B25";

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`TIMEOUT:${label}`)), ms)),
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
  if (/already registered|already exists|already in use/i.test(msg)) return "البريد الإلكتروني مسجل مسبقاً";
  if (/weak.*password|Password.*short|at least/i.test(msg)) return "كلمة المرور ضعيفة، استخدم 8 أحرف على الأقل";
  if (/invalid.*email/i.test(msg)) return "صيغة البريد الإلكتروني غير صحيحة";
  if (/fetch|network|ERR_/i.test(msg)) return "تعذر الاتصال حالياً، حاول مرة أخرى";
  return "تعذر إنشاء الحساب، حاول مرة أخرى";
}

function AuthFrame({ children }: { children: ReactNode }) {
  return (
    <main
      dir="rtl"
      className="relative mx-auto flex min-h-[100dvh] max-w-[480px] flex-col overflow-hidden px-6 py-8 font-sans"
      style={{
        color: INK,
        background:
          "radial-gradient(circle at 12% 7%, rgba(201,160,99,0.20), transparent 28%), linear-gradient(180deg, #FFFFFF 0%, #FAF7F2 42%, #F3E8D6 100%)",
      }}
    >
      <div aria-hidden="true" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/25 via-[#FAF7F2]/85 to-[#FAF7F2]" />
      <section className="relative z-10 flex min-h-[calc(100dvh-4rem)] flex-col justify-center">{children}</section>
    </main>
  );
}

function BrandHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <header className="mb-8 text-center">
      <div className="mb-4 flex justify-center">
        <MawaeedakLogo compact={false} />
      </div>
      <h1 className="text-[28px] font-black leading-tight" style={{ color: INK }}>{title}</h1>
      <p className="mt-2 text-sm font-semibold" style={{ color: "#6B6258" }}>{subtitle}</p>
      <div className="mx-auto mt-5 flex w-32 items-center gap-3">
        <span className="h-px flex-1 bg-[#C9A063]/35" />
        <span className="h-2 w-2 rotate-45 bg-[#C9A063]" />
        <span className="h-px flex-1 bg-[#C9A063]/35" />
      </div>
    </header>
  );
}

function FieldShell({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <div className="flex h-14 items-center gap-3 rounded-2xl border border-[#E4D4BB] bg-white/85 px-4 shadow-[0_12px_34px_rgba(138,107,61,0.08)]">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F3E8D6] text-[#8A6B3D]">{icon}</span>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

const inputClass =
  "h-10 border-0 bg-transparent p-0 text-right text-[13px] font-semibold text-[#2F2B25] placeholder:text-[#8A8177] focus-visible:ring-0 focus-visible:ring-offset-0";

function PrimaryButton({ children, loading }: { children: ReactNode; loading?: boolean }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl text-base font-extrabold text-white shadow-[0_18px_34px_rgba(201,160,99,0.28)] transition active:scale-[0.99] disabled:opacity-60"
      style={{ background: "linear-gradient(135deg, #C9A063 0%, #B78536 100%)" }}
    >
      {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
      {children}
    </button>
  );
}

function SecondaryButton({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-14 w-full rounded-2xl border border-[#C9A063]/65 bg-white/70 text-base font-extrabold transition active:scale-[0.99]"
      style={{ color: INK }}
    >
      {children}
    </button>
  );
}

export default function AuthPage({ mode }: { mode: AuthMode }) {
  const [, setLocation] = useLocation();
  const { setUser } = useStore();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPwd, setSignupPwd] = useState("");
  const [signupConfirm, setSignupConfirm] = useState("");
  const [signupTerms, setSignupTerms] = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);

  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  const handleLoginSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (submitting) return;
    setLoginError(null);
    setSubmitting(true);

    try {
      const result = await authSignIn(identifier.trim(), password);
      
      if (!result.success) {
        setLoginError(result.error || "خطأ في تسجيل الدخول");
        setSubmitting(false);
        return;
      }

      // Auth succeeded — update useStore immediately
      setUser({
        id: "demo-admin",
        name: "مدير النظام",
        email: "demo@mawaeedak.local",
        city: "الرياض",
        cityKey: "riyadh",
        timezone: "Asia/Riyadh",
        role: "admin",
        onboardingComplete: true,
        interests: [],
      });
      
      setLocation("/");
    } catch (err) {
      setLoginError(translateLoginError(err));
    } finally {
      setSubmitting(false);
      setPassword("");
    }
  };

  const handleSignupSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (signupLoading) return;
    setSignupError(null);

    if (!signupName.trim()) {
      setSignupError("يرجى إدخال الاسم");
      return;
    }
    if (signupPwd !== signupConfirm) {
      setSignupError("كلمة المرور وتأكيدها غير متطابقتين");
      return;
    }
    if (signupPwd.length < 8) {
      setSignupError("كلمة المرور يجب أن تكون 8 أحرف على الأقل");
      return;
    }
    if (!signupTerms) {
      setSignupError("يجب الموافقة على الشروط وسياسة الخصوصية");
      return;
    }

    if (!isSupabaseEnabled) {
      setSignupError("إنشاء الحساب يتطلب إعداد Supabase في بيئة الإنتاج.\nيُرجى التواصل مع مدير النظام.");
      setSignupLoading(false);
      return;
    }

    setSignupLoading(true);
    try {
      const emailRedirectTo = typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : "/auth/callback";
      const { error } = await supabase!.auth.signUp({
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

  const handleForgotSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (forgotLoading) return;
    setForgotLoading(true);
    try {
      if (supabase) {
        const redirectTo = typeof window !== "undefined" ? `${window.location.origin}/reset-password` : "/reset-password";
        await supabase.auth.resetPasswordForEmail(forgotEmail.trim(), { redirectTo });
      }
      setForgotSent(true);
    } finally {
      setForgotLoading(false);
    }
  };

  if (mode === "signup") {
    return (
      <AuthFrame>
        <BrandHeader title="إنشاء حساب جديد" subtitle="ابدأ تنظيم مواعيدك بهوية واحدة" />
        <div className="rounded-[28px] border border-[#E4D4BB] bg-white/70 p-5 shadow-[0_24px_60px_rgba(138,107,61,0.14)] backdrop-blur">
          {signupSuccess ? (
            <div className="space-y-5 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-[#F3E8D6] text-[#8A6B3D]">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <p className="text-sm font-semibold leading-7 text-[#5F574E]">
                تم إنشاء حسابك. فعّل بريدك الإلكتروني ثم سجل الدخول للمتابعة.
              </p>
              <SecondaryButton onClick={() => setLocation("/login")}>العودة لتسجيل الدخول</SecondaryButton>
            </div>
          ) : (
            <form onSubmit={handleSignupSubmit} className="space-y-4">
              <FieldShell icon={<User className="h-5 w-5" />}>
                <Input className={inputClass} value={signupName} onChange={(e) => setSignupName(e.target.value)} placeholder="الاسم الكامل" required />
              </FieldShell>
              <FieldShell icon={<Mail className="h-5 w-5" />}>
                <Input className={inputClass} dir="ltr" type="email" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} placeholder="name@example.com" required />
              </FieldShell>
              <FieldShell icon={<Lock className="h-5 w-5" />}>
                <Input className={inputClass} dir="ltr" type="password" value={signupPwd} onChange={(e) => setSignupPwd(e.target.value)} placeholder="كلمة المرور" required />
              </FieldShell>
              <FieldShell icon={<Lock className="h-5 w-5" />}>
                <Input className={inputClass} dir="ltr" type="password" value={signupConfirm} onChange={(e) => setSignupConfirm(e.target.value)} placeholder="تأكيد كلمة المرور" required />
              </FieldShell>
              <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-[#FAF7F2] p-3 text-xs font-semibold leading-6 text-[#6B6258]">
                <input type="checkbox" checked={signupTerms} onChange={(e) => setSignupTerms(e.target.checked)} className="mt-1" />
                <span>أوافق على الشروط والأحكام وسياسة الخصوصية</span>
              </label>
              {signupError ? <p className="text-center text-xs font-bold text-red-600">{signupError}</p> : null}
              <PrimaryButton loading={signupLoading}>إنشاء الحساب</PrimaryButton>
              <SecondaryButton onClick={() => setLocation("/login")}>لدي حساب بالفعل</SecondaryButton>
            </form>
          )}
        </div>
      </AuthFrame>
    );
  }

  if (mode === "forgot") {
    return (
      <AuthFrame>
        <BrandHeader title="استعادة كلمة المرور" subtitle="سنرسل لك رابطاً آمناً لإعادة التعيين" />
        <div className="rounded-[28px] border border-[#E4D4BB] bg-white/70 p-5 shadow-[0_24px_60px_rgba(138,107,61,0.14)] backdrop-blur">
          {forgotSent ? (
            <div className="space-y-5 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-[#F3E8D6] text-[#8A6B3D]">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <p className="text-sm font-semibold leading-7 text-[#5F574E]">
                إذا كان البريد مسجلاً لدينا فستصلك رسالة بخطوات إعادة تعيين كلمة المرور.
              </p>
              <SecondaryButton onClick={() => setLocation("/login")}>العودة لتسجيل الدخول</SecondaryButton>
            </div>
          ) : (
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <FieldShell icon={<Mail className="h-5 w-5" />}>
                <Input className={inputClass} dir="ltr" type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} placeholder="name@example.com" required />
              </FieldShell>
              <PrimaryButton loading={forgotLoading}>إرسال رابط الاستعادة</PrimaryButton>
              <SecondaryButton onClick={() => setLocation("/login")}>العودة لتسجيل الدخول</SecondaryButton>
            </form>
          )}
        </div>
      </AuthFrame>
    );
  }

  return (
    <AuthFrame>
      <BrandHeader title="مرحباً بك في مواعيدك" subtitle="سجل دخولك للمتابعة" />
      <form onSubmit={handleLoginSubmit} className="rounded-[28px] border border-[#E4D4BB] bg-white/70 p-5 shadow-[0_24px_60px_rgba(138,107,61,0.14)] backdrop-blur">
        <div className="space-y-4">
          <FieldShell icon={<User className="h-5 w-5" />}>
            <Input
              className={inputClass}
              autoComplete="username"
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              placeholder="اسم المستخدم أو البريد الإلكتروني / رقم الجوال أو البريد الإلكتروني"
              required
            />
          </FieldShell>

          <FieldShell icon={<Lock className="h-5 w-5" />}>
            <div className="flex items-center gap-2">
              <Input
                className={inputClass}
                dir="ltr"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="كلمة المرور"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#8A8177]"
                aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </FieldShell>

          <div className="flex items-center justify-between text-xs font-bold">
            <button type="button" onClick={() => setLocation("/forgot-password")} style={{ color: BROWN }}>
              نسيت كلمة المرور؟
            </button>
            <label className="flex cursor-pointer items-center gap-2 text-[#5F574E]">
              <span>تذكرني</span>
              <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
            </label>
          </div>

          {loginError ? <p className="text-center text-xs font-bold text-red-600">{loginError}</p> : null}

          <PrimaryButton loading={submitting}>تسجيل الدخول</PrimaryButton>
          <SecondaryButton onClick={() => setLocation("/register")}>إنشاء حساب جديد</SecondaryButton>
        </div>
      </form>

      <footer className="relative mt-8 rounded-[28px] border border-[#E4D4BB] bg-[#FAF7F2]/80 p-4 text-center shadow-[0_14px_36px_rgba(138,107,61,0.08)]">
        <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#8A6B3D]">
          <CheckCircle2 className="h-5 w-5" />
        </div>
        <p className="text-[11px] font-semibold leading-6 text-[#6B6258]">
          بياناتك محمية بالكامل وفق أعلى معايير الأمان
        </p>
      </footer>
    </AuthFrame>
  );
}

