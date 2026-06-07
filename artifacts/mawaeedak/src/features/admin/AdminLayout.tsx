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

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { type AuthSession } from "@/lib/auth";
import { isSupabaseEnabled, supabase } from "@/lib/supabase";

const ALLOWED_ROLES = ["admin", "super_admin"] as const;
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
      <div className="w-full max-w-sm relative z-10 rounded-3xl overflow-hidden shadow-xl border border-[hsl(38_55%_72%_/_0.55)]">
        <div
          className="px-6 py-7 text-center"
          style={{
            background: "linear-gradient(160deg, hsl(22 72% 16%) 0%, hsl(16 72% 12%) 60%, hsl(22 62% 14%) 100%)",
          }}
        >
          <div className="text-3xl font-extrabold tracking-wider mb-2" style={{ color: "hsl(38 85% 82%)" }}>
            مواعيدك
          </div>
          <p className="text-[12px] font-semibold" style={{ color: "hsl(38 55% 58%)" }}>
            لوحة المالك والإدارة
          </p>
        </div>
        <div className="px-6 py-6" style={{ background: "linear-gradient(145deg, #FFFBF4 0%, hsl(36 28% 93%) 100%)" }}>
          {children}
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
  { href: "/admin/events", label: "المواعيد", icon: Calendar },
  { href: "/admin/financial", label: "الرواتب والدعم", icon: Wallet },
  { href: "/admin/official-financial", label: "الدعم الرسمي", icon: Wallet },
  { href: "/admin/official-prayer", label: "الصلاة الرسمية", icon: Calendar },
  { href: "/admin/messages", label: "رسائل اليوم", icon: MessageSquare },
  { href: "/admin/story", label: "ستوري اليوم", icon: ImageIcon },
  { href: "/admin/themes", label: "الثيمات", icon: Paintbrush },
  { href: "/admin/notifications", label: "الإشعارات", icon: Bell },
  { href: "/admin/news-jobs", label: "الأخبار والوظائف", icon: Newspaper },
  { href: "/admin/complaints", label: "الشكاوى", icon: MessageSquare },
  { href: "/admin/social", label: "التواصل والأتمتة", icon: Zap },
  { href: "/admin/reports", label: "التقارير", icon: FileText },
  { href: "/admin/permissions", label: "الصلاحيات", icon: Shield },
  { href: "/admin/settings", label: "الإعدادات", icon: Settings },
  { href: "/admin/support", label: "الدعم والمساعدة", icon: Headphones },
  { href: "/admin/data-layer", label: "طبقة البيانات", icon: Database },
  { href: "/admin/automation", label: "الأتمتة", icon: Zap },
];

function AdminSidebar({ currentPath, onNavigate }: { currentPath: string; onNavigate?: () => void }) {
  return (
    <aside className="h-full flex flex-col gap-4 p-4" style={{ background: "hsl(36 35% 96%)" }}>
      <div className="px-3 py-4 rounded-2xl border" style={{ background: "#fff", borderColor: "hsl(38 45% 78%)" }}>
        <div className="font-extrabold text-xl" style={{ color: "hsl(35 45% 38%)" }}>مواعيدك</div>
        <div className="text-xs mt-1" style={{ color: "hsl(32 22% 42%)" }}>لوحة المالك</div>
      </div>

      <nav className="flex-1 overflow-y-auto space-y-1 pr-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = currentPath === item.href || (item.href !== "/admin" && currentPath.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href} onClick={onNavigate}>
              <div
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-colors cursor-pointer"
                style={{
                  background: active ? "linear-gradient(135deg, hsl(38 62% 52%), hsl(32 55% 42%))" : "transparent",
                  color: active ? "#fff" : "hsl(24 22% 24%)",
                }}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [phase, setPhase] = useState<AdminAuthPhase>("checking");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const mountedRef = useRef(true);
  const [location] = useLocation();

  const userLabel = useMemo(() => {
    return session?.user.displayName || session?.user.email || "مدير النظام";
  }, [session]);

  useEffect(() => {
    mountedRef.current = true;

    if (!isSupabaseEnabled || !supabase) {
      setSession(null);
      setPhase("login");
      return () => {
        mountedRef.current = false;
      };
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
      if (!isSupabaseEnabled || !supabase) {
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
    if (supabase) await supabase.auth.signOut({ scope: "local" });
    setSession(null);
    setPassword("");
    setPhase("login");
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
          <div className="text-center space-y-1 mb-4">
            <h2 className="text-xl font-extrabold" style={{ color: "hsl(24 22% 24%)" }}>تسجيل دخول المالك</h2>
            <p className="text-xs" style={{ color: "hsl(32 18% 38%)" }}>
              الدخول محمي عبر Supabase Auth وصلاحيات admin / super_admin فقط
            </p>
          </div>

          {loginError && <ErrorBox message={loginError} />}

          <div className="space-y-2">
            <Label htmlFor="admin-email">البريد الإلكتروني</Label>
            <Input
              id="admin-email"
              dir="ltr"
              type="email"
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="admin-password">كلمة المرور</Label>
            <Input
              id="admin-password"
              dir="ltr"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          <Button type="submit" disabled={submitting} className="w-full h-11 font-bold">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "تسجيل الدخول"}
          </Button>
        </form>
      </AuthShell>
    );
  }

  return (
    <div className="min-h-screen rtl" style={{ background: "hsl(36 34% 95%)", color: "hsl(24 22% 20%)" }}>
      <div className="hidden lg:fixed lg:inset-y-0 lg:right-0 lg:z-40 lg:block lg:w-72 lg:border-l" style={{ borderColor: "hsl(38 32% 82%)" }}>
        <AdminSidebar currentPath={location} />
      </div>

      <header
        className="sticky top-0 z-30 flex h-16 items-center justify-between border-b px-4 lg:pr-80"
        style={{ background: "rgba(255, 251, 244, 0.92)", borderColor: "hsl(38 32% 82%)", backdropFilter: "blur(12px)" }}
      >
        <div className="flex items-center gap-2 lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" aria-label="فتح القائمة">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="p-0 w-72">
              <AdminSidebar currentPath={location} />
            </SheetContent>
          </Sheet>
        </div>

        <div>
          <div className="font-extrabold" style={{ color: "hsl(35 45% 34%)" }}>لوحة المالك</div>
          <div className="text-xs" style={{ color: "hsl(32 18% 38%)" }}>مرحباً، {userLabel}</div>
        </div>

        <Button type="button" variant="outline" onClick={handleLogout} className="gap-2">
          <LogOut className="h-4 w-4" />
          تسجيل الخروج
        </Button>
      </header>

      <main className="lg:pr-72">
        <div className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
