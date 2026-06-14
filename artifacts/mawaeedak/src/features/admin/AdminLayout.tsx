import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import {
  Bell,
  BookOpen,
  Calendar,
  Database,
  FileText,
  Headphones,
  Image as ImageIcon,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  MessageSquare,
  Newspaper,
  Paintbrush,
  Settings,
  Shield,
  Users,
  Wallet,
  Zap,
} from "lucide-react";
import desertHeroImg from "@assets/desert-hero.png";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { type AuthSession } from "@/lib/auth";
import { isSupabaseEnabled, supabase } from "@/lib/supabase";

const ALLOWED_ROLES = ["admin", "super_admin", "owner"] as const;
const LOGIN_SUBMIT_TIMEOUT_MS = 8000;

type AdminRole = (typeof ALLOWED_ROLES)[number];
type AdminAuthPhase = "checking" | "login" | "ready" | "access_denied";

type SupabaseUserLike = {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
  app_metadata?: Record<string, unknown>;
};

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
};

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      window.setTimeout(() => reject(new Error(`TIMEOUT:${label}`)), ms);
    }),
  ]);
}

function normalizeRole(value: unknown): string {
  return typeof value === "string" && value.trim() ? value.trim() : "user";
}

function isAllowedRole(role: string): role is AdminRole {
  return ALLOWED_ROLES.includes(role as AdminRole);
}

function hasAdminAccess(session: AuthSession | null): boolean {
  if (!session) return false;
  return isAllowedRole(normalizeRole(session.user.role));
}

function buildAuthSession(user: SupabaseUserLike): AuthSession {
  const role = normalizeRole(user.app_metadata?.role) as AuthSession["user"]["role"];
  const displayName =
    (typeof user.user_metadata?.display_name === "string" && user.user_metadata.display_name) ||
    (typeof user.user_metadata?.name === "string" && user.user_metadata.name) ||
    user.email?.split("@")[0] ||
    "مدير";

  return {
    user: {
      id: user.id,
      email: user.email,
      role,
      displayName,
    },
    isDemo: false,
  };
}

function translateLoginError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  if (msg.startsWith("TIMEOUT:")) return "انتهت مهلة تسجيل الدخول، تحقق من الاتصال وحاول مرة أخرى";
  if (/invalid.*credentials|wrong.*password|Invalid login/i.test(msg)) return "بيانات الدخول غير صحيحة";
  if (/email.*confirm|not confirmed/i.test(msg)) return "يرجى تأكيد بريدك الإلكتروني أولاً";
  if (/fetch|network|Failed to fetch|ERR_/i.test(msg)) return "تعذر الاتصال حالياً، حاول مرة أخرى";
  return "حدث خطأ في تسجيل الدخول، حاول مرة أخرى";
}

function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div
      className="min-h-[100dvh] flex items-center justify-center p-4 rtl relative overflow-hidden"
      style={{ background: "linear-gradient(180deg, #FDF9F3 0%, #F3E8D6 50%, #EDE3D0 100%)" }}
    >
      {/* Saudi architecture pattern - left background */}
      <div 
        className="absolute left-0 top-0 w-3/5 h-full opacity-[0.07] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(135deg, rgba(201,160,99,0.55), rgba(255,255,255,0) 62%), repeating-linear-gradient(45deg, rgba(138,107,61,0.45) 0 1px, transparent 1px 18px)",
          backgroundSize: "auto",
          backgroundPosition: "center left",
        }}
      />
      
      {/* Palm decorations - right edge */}
      <div className="absolute top-0 right-0 w-32 h-40 opacity-[0.06] pointer-events-none" style={{
        background: "radial-gradient(ellipse at 90% 10%, #C9A063 0%, transparent 60%)",
      }} />
      <div className="absolute bottom-0 right-0 w-40 h-48 opacity-[0.05] pointer-events-none" style={{
        background: "radial-gradient(ellipse at 85% 90%, #C9A063 0%, transparent 55%)",
      }} />
      
      {/* Palm decorations - left edge */}
      <div className="absolute top-0 left-0 w-32 h-32 opacity-[0.05] pointer-events-none" style={{
        background: "radial-gradient(ellipse at 10% 5%, #C9A063 0%, transparent 60%)",
      }} />
      
      {/* Golden lantern - bottom left */}
      <div className="absolute bottom-8 left-8 text-4xl opacity-30 pointer-events-none" style={{ color: "#C9A063" }}>
        <svg width="48" height="64" viewBox="0 0 48 64" fill="currentColor">
          <path d="M24 0L28 8H20L24 0Z" fill="currentColor"/>
          <rect x="18" y="8" width="12" height="4" rx="1" fill="currentColor"/>
          <path d="M16 12H32V48C32 52 28 56 24 56C20 56 16 52 16 48V12Z" fill="currentColor" opacity="0.9"/>
          <rect x="20" y="16" width="8" height="28" rx="2" fill="#FDF9F3" opacity="0.3"/>
          <rect x="14" y="48" width="20" height="4" rx="1" fill="currentColor"/>
          <rect x="12" y="52" width="24" height="6" rx="2" fill="currentColor"/>
          <rect x="20" y="58" width="8" height="4" rx="1" fill="currentColor"/>
        </svg>
      </div>

      {/* Central card */}
      <div 
        className="w-full max-w-[380px] relative z-10 rounded-[28px] overflow-hidden"
        style={{
          background: "linear-gradient(180deg, #FFFFFF 0%, #FFFBF4 100%)",
          boxShadow: "0 25px 80px rgba(138,107,61,0.18), 0 8px 30px rgba(138,107,61,0.08)",
          border: "1px solid rgba(201,160,99,0.3)",
        }}
      >
        {/* Card header with logo */}
        <div className="px-8 py-10 text-center" style={{ background: "linear-gradient(180deg, #FFFFFF 0%, #FAF5EE 100%)" }}>
          <div className="text-5xl mb-3" style={{ color: "#C9A063" }}>✦</div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-2" style={{ color: "#2F2B25" }}>
            مواعيدك
          </h1>
          <p className="text-sm font-medium mb-1" style={{ color: "#8A6B3D" }}>
            لوحة المالك والإدارة
          </p>
          <div className="h-[1px] w-32 mx-auto mt-4" style={{ background: "linear-gradient(90deg, transparent, #C9A063, transparent)" }} />
        </div>
        
        {/* Card content */}
        <div className="px-8 py-8" style={{ background: "#FFFBF4" }}>
          {children}
        </div>
        
        {/* Card footer */}
        <div className="px-8 py-4 text-center" style={{ background: "#F3E8D6" }}>
          <p className="text-xs opacity-60" style={{ color: "#6F6557" }}>
            © 2025 مواعيدك جميع الحقوق محفوظة
          </p>
        </div>
      </div>
    </div>
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

const navItems: NavItem[] = [
  { href: "/admin", label: "الرئيسية", icon: LayoutDashboard },
  { href: "/admin/members", label: "المستخدمون", icon: Users },
  { href: "/admin/financial", label: "الرواتب والدعم", icon: Wallet },
  { href: "/admin/official-prayer", label: "مواقيت الصلاة الرسمية", icon: Calendar },
  { href: "/admin/official-financial", label: "المواعيد المالية الرسمية", icon: Calendar },
  { href: "/admin/messages", label: "الرسائل اليومية", icon: MessageSquare },
  { href: "/admin/story", label: "بطاقة اليوم / ستوري اليوم", icon: ImageIcon },
  { href: "/admin/themes", label: "الثيمات", icon: Paintbrush },
  { href: "/admin/notifications", label: "الإشعارات", icon: Bell },
  { href: "/admin/complaints", label: "الشكاوى والاقتراحات", icon: MessageSquare },
  { href: "/admin/news-jobs", label: "الأخبار والوظائف", icon: Newspaper },
  { href: "/admin/reports", label: "التقارير", icon: FileText },
  { href: "/admin/permissions", label: "الصلاحيات", icon: Shield },
  { href: "/admin/settings", label: "الإعدادات", icon: Settings },
  { href: "/admin/social", label: "ربط التواصل الاجتماعي والأتمتة", icon: Zap },
  { href: "/admin/support", label: "الدعم والمساعدة", icon: Headphones },
];

function AdminSidebar({ currentPath, onNavigate }: { currentPath: string; onNavigate?: () => void }) {
  return (
    <aside 
      className="h-full flex flex-col relative overflow-hidden"
      style={{ 
        background: "linear-gradient(180deg, #FFFFFF 0%, #FAF5EE 50%, #F5EDDE 100%)",
        borderRight: "1px solid rgba(201,160,99,0.3)",
      }}
    >
      {/* Background decorative pattern */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-48 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(135deg, rgba(201,160,99,0.5), rgba(255,255,255,0) 65%), repeating-linear-gradient(45deg, rgba(138,107,61,0.45) 0 1px, transparent 1px 18px)",
          backgroundSize: "auto",
          backgroundPosition: "bottom left",
        }}
      />
      
      {/* Golden lantern decorations */}
      <div className="absolute top-20 left-4 text-xl opacity-20" style={{ color: "#C9A063" }}>✦</div>
      <div className="absolute top-40 right-4 text-lg opacity-15" style={{ color: "#C9A063" }}>✦</div>
      
      {/* Logo Header */}
      <div 
        className="p-5 border-b relative z-10"
        style={{ 
          background: "linear-gradient(135deg, hsl(22 62% 18%) 0%, hsl(18 68% 14%) 100%)",
          borderColor: "hsl(38 60% 40% / 0.4)",
        }}
      >
        {/* Decorative top accent */}
        <div className="absolute top-0 left-0 right-0 h-1" style={{
          background: "linear-gradient(90deg, hsl(38 62% 52%), hsl(32 55% 42%), hsl(38 62% 52%))",
        }} />
        
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center font-extrabold text-xl relative"
            style={{ 
              background: "linear-gradient(145deg, hsl(38 62% 52%), hsl(32 55% 42%))",
              color: "#fff",
              boxShadow: "0 4px 12px rgba(138,107,61,0.35), inset 0 1px 0 rgba(255,255,255,0.2)",
            }}
          >
            <span style={{ textShadow: "0 1px 2px rgba(0,0,0,0.2)" }}>م</span>
            {/* Inner glow */}
            <div className="absolute inset-0 rounded-xl" style={{
              boxShadow: "inset 0 0 12px rgba(255,255,255,0.15)",
            }} />
          </div>
          <div>
            <div className="font-extrabold text-lg tracking-wide" style={{ color: "#F5EDDE" }}>مواعيدك</div>
            <div className="text-xs font-medium" style={{ color: "hsl(38 55% 60%)" }}>لوحة المالك</div>
          </div>
        </div>
        
        {/* Date display */}
        <div className="mt-3 pt-3 border-t border-white/10">
          <div className="text-[10px]" style={{ color: "hsl(38 55% 55%)" }}>
            {new Date().toLocaleDateString('ar-SA', { weekday: 'long' })}
          </div>
          <div className="text-xs font-bold mt-0.5" style={{ color: "hsl(38 75% 70%)" }}>
            {new Date().toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 relative z-10">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = currentPath === item.href || (item.href !== "/admin" && currentPath.startsWith(item.href));
          
          return (
            <Link key={item.href} href={item.href} onClick={() => onNavigate?.()}>
              <div
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 mb-1 text-sm font-bold transition-all duration-200 cursor-pointer`}
                style={{
                  background: active 
                    ? "linear-gradient(135deg, hsl(38 62% 52%), hsl(32 55% 42%))" 
                    : "transparent",
                  color: active ? "#fff" : "hsl(24 22% 24%)",
                  boxShadow: active ? "0 4px 12px rgba(138,107,61,0.3)" : "none",
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = "rgba(201,160,99,0.12)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = "transparent";
                  }
                }}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
                {active && (
                  <div className="mr-auto w-1.5 h-1.5 rounded-full bg-white/80" />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div 
        className="p-4 border-t relative z-10"
        style={{ 
          background: "rgba(201,160,99,0.08)",
          borderColor: "rgba(201,160,99,0.2)",
        }}
      >
        <div className="h-[1px] w-12 mx-auto mb-3" style={{
          background: "linear-gradient(90deg, transparent, hsl(38 60% 50%), transparent)",
        }} />
        <p className="text-[10px] font-medium" style={{ color: "hsl(32 18% 42%)" }}>
          © 2025 مواعيدك — لوحة المالك
        </p>
        <p className="text-[9px] mt-1" style={{ color: "hsl(32 18% 52%)" }}>
          جميع الحقوق محفوظة
        </p>
      </div>
    </aside>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [session, setSession] = useState<AuthSession | null>(null);
  const [phase, setPhase] = useState<AdminAuthPhase>("checking");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const mountedRef = useRef(true);
  const [location] = useLocation();

  const userLabel = useMemo(() => {
    return session?.user.displayName || session?.user.email || "مدير النظام";
  }, [session]);

  useEffect(() => {
    mountedRef.current = true;

    // Demo mode in development: check for existing demo session
    if (!isSupabaseEnabled || !supabase) {
      if (import.meta.env.DEV) {
        try {
          const demoSession = sessionStorage.getItem("mawaeedak_demo_session");
          if (demoSession) {
            const parsed = JSON.parse(demoSession);
            if (parsed?.user && hasAdminAccess(parsed)) {
              setSession(parsed);
              setPhase("ready");
              return () => { mountedRef.current = false; };
            }
          }
        } catch {}
      }
      setSession(null);
      setPhase("login");
      return () => { mountedRef.current = false; };
    }

    const timeoutId = window.setTimeout(() => {
      if (mountedRef.current && phase === "checking") setPhase("login");
    }, 10000);

    void supabase.auth.getUser().then(({ data, error }) => {
      if (!mountedRef.current) return;
      window.clearTimeout(timeoutId);

      if (error || !data.user) {
        setSession(null);
        setPhase("login");
        return;
      }

      const nextSession = buildAuthSession(data.user);
      if (hasAdminAccess(nextSession)) {
        setSession(nextSession);
        setPhase("ready");
      } else {
        setSession(null);
        setPhase("access_denied");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, sbSession) => {
      if (!mountedRef.current) return;

      const user = sbSession?.user;
      if (!user) {
        setSession(null);
        setPhase("login");
        return;
      }

      const nextSession = buildAuthSession(user);
      if (hasAdminAccess(nextSession)) {
        setSession(nextSession);
        setPhase("ready");
      } else {
        setSession(null);
        setPhase("access_denied");
      }
    });

    return () => {
      mountedRef.current = false;
      window.clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, [phase]);

  async function handleLoginSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setLoginError(null);

    try {
      // Demo mode in development: admin/admin123
      if (!isSupabaseEnabled || !supabase) {
        // Only allow demo login in development
        if (import.meta.env.DEV) {
          const DEMO_ADMIN_USERNAME = "admin";
          const DEMO_ADMIN_PASSWORD = import.meta.env.VITE_DEMO_ADMIN_PASSWORD || "admin123";
          
          if (identifier.trim() === DEMO_ADMIN_USERNAME && password === DEMO_ADMIN_PASSWORD) {
            // Demo login success
            const demoSession: AuthSession = {
              user: { id: "demo-admin", role: "owner", displayName: "مدير النظام" },
              isDemo: true,
            };
            sessionStorage.setItem("mawaeedak_demo_session", JSON.stringify(demoSession));
            setSession(demoSession);
            setPhase("ready");
            setPassword("");
            return;
          } else {
            setLoginError("اسم المستخدم أو كلمة المرور غير صحيحة");
            return;
          }
        }
        
        setLoginError("لوحة المالك تتطلب تفعيل Supabase Auth في بيئة الإنتاج");
        return;
      }

      const { error } = await withTimeout(
        supabase.auth.signInWithPassword({ email: identifier.trim(), password }),
        LOGIN_SUBMIT_TIMEOUT_MS,
        "signIn"
      );

      if (error) {
        setLoginError(translateLoginError(error));
        return;
      }

      const { data, error: userError } = await withTimeout(supabase.auth.getUser(), 5000, "getUser");
      if (userError || !data.user) {
        setLoginError("تعذر قراءة بيانات الحساب، حاول مرة أخرى");
        await supabase.auth.signOut({ scope: "local" });
        return;
      }

      const nextSession = buildAuthSession(data.user);
      if (!hasAdminAccess(nextSession)) {
        await supabase.auth.signOut({ scope: "local" });
        setSession(null);
        setPhase("access_denied");
        return;
      }

      setSession(nextSession);
      setPhase("ready");
      setPassword("");
    } catch (err) {
      setLoginError(translateLoginError(err));
    } finally {
      if (mountedRef.current) setSubmitting(false);
    }
  }

  async function handleLogout() {
    sessionStorage.removeItem("mawaeedak_demo_session");
    if (supabase) await supabase.auth.signOut({ scope: "local" });
    setSession(null);
    setPassword("");
    setPhase("login");
    // Redirect to home page after logout
    window.location.href = "/";
  }

  if (phase === "checking") {
    return (
      <AuthShell>
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <Loader2 className="h-7 w-7 animate-spin" style={{ color: "hsl(38 62% 46%)" }} />
          <p className="text-sm font-bold" style={{ color: "hsl(24 22% 24%)" }}>يتم التحقق من صلاحيات لوحة المالك...</p>
        </div>
      </AuthShell>
    );
  }

  if (phase === "access_denied") {
    return (
      <AuthShell>
        <div className="space-y-4 text-center">
          <Shield className="h-10 w-10 mx-auto" style={{ color: "hsl(10 55% 48%)" }} />
          <h2 className="text-xl font-extrabold" style={{ color: "hsl(24 22% 24%)" }}>غير مصرح</h2>
          <p className="text-sm leading-7" style={{ color: "hsl(32 18% 38%)" }}>
            هذا الحساب لا يملك صلاحيات الدخول إلى لوحة المالك.
          </p>
          <Button type="button" onClick={handleLogout} className="w-full">
            العودة لتسجيل الدخول
          </Button>
        </div>
      </AuthShell>
    );
  }

  if (phase !== "ready") {
    return (
      <AuthShell>
        <form className="space-y-4" onSubmit={handleLoginSubmit}>
          <div className="text-center space-y-1 mb-3">
            <h2 className="text-lg font-extrabold" style={{ color: "#2F2B25" }}>تسجيل دخول المالك</h2>
            <p className="text-[11px]" style={{ color: "#8A6B3D" }}>
              الدخول مخصص لإدارة لوحة مواعيدك فقط
            </p>
          </div>

          {!isSupabaseEnabled && import.meta.env.PROD && (
            <div 
              className="px-4 py-3 rounded-xl text-xs font-semibold text-center"
              style={{
                background: "rgba(201,160,99,0.15)",
                border: "1px solid rgba(201,160,99,0.3)",
                color: "#8A6B3D",
              }}
            >
              لوحة المالك تتطلب تفعيل Supabase Auth في بيئة الإنتاج
            </div>
          )}

          {!isSupabaseEnabled && import.meta.env.DEV && (
            <div 
              className="px-4 py-3 rounded-xl text-xs font-semibold text-center"
              style={{
                background: "rgba(139,195,74,0.15)",
                border: "1px solid rgba(139,195,74,0.3)",
                color: "#558B2F",
              }}
            >
              وضع التطوير: استخدم admin / admin123 للدخول
            </div>
          )}

          {loginError && <ErrorBox message={loginError} />}

          <Input
            id="admin-email"
            dir="ltr"
            type="email"
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
            autoComplete="email"
            placeholder="أدخل البريد الإلكتروني"
            required
            className="h-12 rounded-xl bg-white/80 border-0"
            style={{ border: "1px solid rgba(201,160,99,0.25)" }}
          />

          <Input
            id="admin-password"
            dir="ltr"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            placeholder="أدخل كلمة المرور"
            required
            className="h-12 rounded-xl bg-white/80 border-0"
            style={{ border: "1px solid rgba(201,160,99,0.25)" }}
          />

          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 cursor-pointer" style={{ color: "#8A6B3D" }}>
              <input type="checkbox" className="w-4 h-4 rounded" style={{ accentColor: "#C9A063" }} />
              تذكرني
            </label>
            <a href="#" className="hover:underline" style={{ color: "#C9A063" }}>نسيت كلمة المرور؟</a>
          </div>

          <Button 
            type="submit" 
            disabled={submitting && isSupabaseEnabled} 
            className="w-full h-12 font-bold rounded-xl"
            style={{ background: "#C9A063", color: "#FFFFFF" }}
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "تسجيل الدخول"}
          </Button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: "rgba(201,160,99,0.3)" }} />
            <span className="text-[10px] font-medium" style={{ color: "#8A6B3D" }}>أو سجل الدخول باستخدام</span>
            <div className="flex-1 h-px" style={{ background: "rgba(201,160,99,0.3)" }} />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Button 
              type="button"
              variant="outline"
              className="h-10 rounded-xl text-xs font-medium"
              style={{ borderColor: "rgba(201,160,99,0.3)", color: "#2F2B25" }}
              onClick={() => toast({ title: "تسجيل الدخول بـ Apple يحتاج إعداداً إضافياً" })}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="ml-1">
                <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.09997 22C7.78997 22.05 6.79997 20.68 5.95997 19.47C4.24997 17 2.93997 12.45 4.69997 9.39C5.56997 7.87 7.12997 6.91 8.81997 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.67 19.67 18.12 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z"/>
              </svg>
              Apple
            </Button>
            <Button 
              type="button"
              variant="outline"
              className="h-10 rounded-xl text-xs font-medium"
              style={{ borderColor: "rgba(201,160,99,0.3)", color: "#2F2B25" }}
              onClick={() => toast({ title: "تسجيل الدخول بـ Google يحتاج إعداداً إضافياً" })}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" className="ml-1">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </Button>
            <Button 
              type="button"
              variant="outline"
              className="h-10 rounded-xl text-xs font-medium"
              style={{ borderColor: "rgba(201,160,99,0.3)", color: "#2F2B25" }}
              onClick={() => toast({ title: "تسجيل الدخول برقم الجوال يحتاج إعداداً إضافياً" })}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#C9A063" className="ml-1">
                <path d="M17 4h-3V2h-4v2H7v18h10V4zm-5 16c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-7.1l-1.4-1.4L12 13.4l-1.7-1.7-1.4 1.4L12 16.2l4.1-4.3z"/>
              </svg>
              الجوال
            </Button>
          </div>
        </form>
      </AuthShell>
    );
  }

  return (
    <div 
      className="min-h-screen rtl" 
      style={{ 
        background: "linear-gradient(180deg, #FBF5EA 0%, #F5EDDE 50%, #EDE3D0 100%)",
        color: "hsl(24 22% 20%)" 
      }}
    >
      {/* Desktop Sidebar */}
      <div 
        className="hidden lg:fixed lg:inset-y-0 lg:right-0 lg:z-40 lg:block lg:w-72" 
        style={{ 
          boxShadow: "-4px 0 24px rgba(80,40,10,0.08)"
        }}
      >
        <AdminSidebar currentPath={location} />
      </div>

      {/* Main Content Area */}
      <div className="lg:pr-72">
        {/* Header */}
        <header
          className="sticky top-0 z-30 border-b px-4 lg:px-8"
          style={{ 
            background: "rgba(255, 251, 244, 0.95)", 
            borderColor: "rgba(201,160,99,0.25)", 
            backdropFilter: "blur(16px)",
            boxShadow: "0 2px 12px rgba(80,40,10,0.06)",
          }}
        >
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="rounded-xl"
                    style={{ 
                      borderColor: "rgba(201,160,99,0.3)",
                      background: "linear-gradient(145deg, #FFFBF4, #F5EDDE)",
                    }}
                    aria-label="فتح القائمة"
                  >
                    <Menu className="h-5 w-5" style={{ color: "#A78042" }} />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="p-0 w-80">
                  <AdminSidebar currentPath={location} onNavigate={() => setMenuOpen(false)} />
                </SheetContent>
              </Sheet>
            </div>

            {/* Date & Greeting */}
            <div className="flex-1">
              <div className="font-extrabold text-lg" style={{ color: "hsl(22 62% 22%)" }}>
                لوحة المالك
              </div>
              <div className="text-xs" style={{ color: "hsl(32 18% 42%)" }}>
                مرحباً، {userLabel} · {new Date().toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleLogout} 
                className="gap-2 rounded-xl"
                style={{ 
                  borderColor: "rgba(201,160,99,0.3)",
                  background: "linear-gradient(145deg, #FFFBF4, #F5EDDE)",
                  color: "hsl(10 55% 48%)",
                }}
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">تسجيل الخروج</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main>
          <div className="mx-auto w-full p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t px-8 py-6 text-center" style={{ borderColor: "rgba(201,160,99,0.2)", background: "rgba(201,160,99,0.05)" }}>
          <p className="text-xs" style={{ color: "hsl(32 18% 48%)" }}>
            © 2025 مواعيدك — جميع الحقوق محفوظة
          </p>
        </footer>
      </div>
    </div>
  );
}

