import { useLocation } from "wouter";
import { AppShell } from "@/components/layout/AppShell";
import {
  User,
  Clock,
  Navigation,
  Bell,
  Calendar,
  Wallet,
  Share2,
  MessageSquare,
  Shield,
  FileText,
  AlertTriangle,
  LogOut,
  ChevronLeft,
  LogIn,
  UserPlus,
  LayoutDashboard,
} from "lucide-react";
import { useStore } from "@/hooks/useStore";
import { useState } from "react";
import { ConfirmDialog } from "@/components/layout/ConfirmDialog";
import { toast } from "@/hooks/use-toast";

interface MenuRowProps {
  icon: React.ElementType;
  label: string;
  sublabel?: string;
  onClick: () => void;
  iconColor?: string;
  danger?: boolean;
}

function MenuRow({ icon: Icon, label, sublabel, onClick, iconColor, danger }: MenuRowProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3.5 text-right hover:bg-primary/5 transition-colors"
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: danger ? "hsl(10 55% 52% / 0.10)" : "hsl(38 55% 52% / 0.12)" }}
      >
        <Icon
          className="w-4 h-4"
          style={{ color: danger ? "hsl(10 50% 42%)" : (iconColor || "hsl(var(--primary))") }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold text-right ${danger ? "text-red-600" : "text-foreground"}`}>{label}</p>
        {sublabel && <p className="text-[11px] text-muted-foreground mt-0.5 text-right">{sublabel}</p>}
      </div>
      <ChevronLeft className="w-4 h-4 text-muted-foreground shrink-0" style={{ transform: "rotate(180deg)" }} />
    </button>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="px-4 pt-5 pb-1">
      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{title}</p>
    </div>
  );
}

export default function MorePage() {
  const [, setLocation] = useLocation();
  const { user, isAdmin } = useStore();
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  const isLoggedIn = !!user.email;

  const handleLogout = async () => {
    const { authSignOut } = await import("@/lib/auth");
    await authSignOut().catch(() => {});
    localStorage.removeItem("admin_authenticated");
    localStorage.removeItem("app-user");
    toast({ title: "تم تسجيل الخروج", duration: 3000 });
    setLocation("/");
  };

  const handleShare = async () => {
    const url = window.location.origin;
    if (navigator.share) {
      await navigator.share({ title: "مواعيدك", text: "تطبيق مواعيدك — مساعدك اليومي الشخصي", url });
    } else {
      await navigator.clipboard.writeText(url);
      toast({ title: "تم نسخ رابط التطبيق", duration: 3000 });
    }
  };

  return (
    <AppShell title="المزيد" hideNav={false}>
      <div className="pb-24">

        {/* ── Anonymous: welcome + login/signup ── */}
        {!isLoggedIn && (
          <>
            <div
              className="mx-4 mt-4 rounded-2xl overflow-hidden"
              style={{
                background: "linear-gradient(135deg, hsl(22 55% 18%) 0%, hsl(28 50% 25%) 100%)",
                border: "1px solid hsl(38 45% 35% / 0.4)",
              }}
            >
              <div className="p-4 text-center space-y-1">
                <p className="font-bold text-sm" style={{ color: "hsl(38 72% 82%)" }}>مرحباً بك في مواعيدك</p>
                <p className="text-[11px]" style={{ color: "hsl(38 45% 55%)" }}>
                  سجّل دخولك للوصول إلى مزاياك الشخصية
                </p>
              </div>
            </div>

            <SectionHeader title="الدخول" />
            <div
              className="mx-4 rounded-2xl overflow-hidden divide-y divide-border"
              style={{ border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }}
            >
              <MenuRow
                icon={LogIn}
                label="تسجيل الدخول"
                sublabel="ادخل بحسابك الموجود"
                onClick={() => setLocation("/login")}
                iconColor="hsl(200 60% 45%)"
              />
              <MenuRow
                icon={UserPlus}
                label="إنشاء حساب جديد"
                sublabel="أنشئ حساباً مجانياً"
                onClick={() => setLocation("/register")}
                iconColor="hsl(150 50% 40%)"
              />
            </div>
          </>
        )}

        {/* ── Logged-in: profile card ── */}
        {isLoggedIn && (
          <div
            className="mx-4 mt-4 rounded-2xl overflow-hidden"
            style={{
              background: "linear-gradient(135deg, hsl(22 55% 18%) 0%, hsl(28 50% 25%) 100%)",
              border: "1px solid hsl(38 45% 35% / 0.4)",
            }}
          >
            <div className="p-4 flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "hsl(38 72% 52% / 0.2)", border: "1.5px solid hsl(38 72% 52% / 0.4)" }}
              >
                <User className="w-6 h-6" style={{ color: "hsl(38 72% 68%)" }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm" style={{ color: "hsl(38 72% 82%)" }}>
                  {user.name || "مستخدم مواعيدك"}
                </p>
                <p className="text-[11px] mt-0.5" style={{ color: "hsl(38 45% 55%)" }}>
                  {user.city || "لم تُحدَّد المدينة"}
                </p>
              </div>
              <button
                onClick={() => setLocation("/account")}
                className="text-[11px] px-3 py-1.5 rounded-lg font-bold"
                style={{
                  background: "hsl(38 72% 52% / 0.2)",
                  color: "hsl(38 72% 70%)",
                  border: "1px solid hsl(38 72% 52% / 0.3)",
                }}
              >
                تعديل
              </button>
            </div>
          </div>
        )}

        {/* ── Logged-in: Account & Preferences ── */}
        {isLoggedIn && (
          <>
            <SectionHeader title="الحساب" />
            <div
              className="mx-4 rounded-2xl overflow-hidden divide-y divide-border"
              style={{ border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }}
            >
              <MenuRow
                icon={User}
                label="بياناتي الشخصية"
                sublabel="الاسم، المدينة، الصورة"
                onClick={() => setLocation("/account")}
              />
            </div>

            <SectionHeader title="التفضيلات" />
            <div
              className="mx-4 rounded-2xl overflow-hidden divide-y divide-border"
              style={{ border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }}
            >
              <MenuRow
                icon={Clock}
                label="صيغة الوقت"
                sublabel="12 ساعة / 24 ساعة"
                onClick={() => setLocation("/account#time-format")}
                iconColor="hsl(200 60% 45%)"
              />
              <MenuRow
                icon={Navigation}
                label="المدينة والموقع"
                sublabel="لمواقيت الصلاة والخدمات المحلية"
                onClick={() => setLocation("/account#location")}
                iconColor="hsl(150 50% 40%)"
              />
              <MenuRow
                icon={Bell}
                label="التنبيهات والإشعارات"
                sublabel="ضبط تنبيهات المواعيد والمواعيد المالية"
                onClick={() => setLocation("/account#notifications")}
                iconColor="hsl(38 72% 45%)"
              />
            </div>

            <SectionHeader title="منظمي الشخصي" />
            <div
              className="mx-4 rounded-2xl overflow-hidden divide-y divide-border"
              style={{ border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }}
            >
              <MenuRow
                icon={Calendar}
                label="مواعيدي القادمة"
                sublabel="إدارة مواعيدي الشخصية"
                onClick={() => setLocation("/calendar")}
                iconColor="hsl(240 50% 55%)"
              />
              <MenuRow
                icon={Wallet}
                label="المال والحاسبات"
                sublabel="مواعيد الرواتب والدعوم والحاسبات التقديرية"
                onClick={() => setLocation("/finance")}
                iconColor="hsl(130 45% 40%)"
              />
            </div>
          </>
        )}

        {/* ── Admin Panel (admin/super_admin only) ── */}
        {isAdmin && (
          <>
            <SectionHeader title="الإدارة" />
            <div
              className="mx-4 rounded-2xl overflow-hidden divide-y divide-border"
              style={{ border: "1px solid hsl(38 45% 35% / 0.4)", background: "hsl(var(--card))" }}
            >
              <MenuRow
                icon={LayoutDashboard}
                label="لوحة التحكم"
                sublabel="إدارة المنصة والمحتوى"
                onClick={() => setLocation("/admin/dashboard")}
                iconColor="hsl(38 72% 52%)"
              />
            </div>
          </>
        )}

        {/* ── Share ── */}
        <SectionHeader title="المشاركة" />
        <div
          className="mx-4 rounded-2xl overflow-hidden divide-y divide-border"
          style={{ border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }}
        >
          <MenuRow
            icon={Share2}
            label="مشاركة التطبيق"
            sublabel="شارك مواعيدك مع أصدقائك"
            onClick={handleShare}
            iconColor="hsl(200 55% 45%)"
          />
          <MenuRow
            icon={Share2}
            label="ستوري اليوم"
            sublabel="أنشئ وشارك ستوريك اليومي"
            onClick={() => setLocation("/story")}
            iconColor="hsl(320 50% 50%)"
          />
        </div>

        {/* ── Support ── */}
        <SectionHeader title="الدعم والتواصل" />
        <div
          className="mx-4 rounded-2xl overflow-hidden divide-y divide-border"
          style={{ border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }}
        >
          <MenuRow
            icon={MessageSquare}
            label="تواصل معنا"
            sublabel="اقتراح أو ملاحظة"
            onClick={() => setLocation("/support")}
            iconColor="hsl(38 65% 45%)"
          />
        </div>

        {/* ── Legal ── */}
        <SectionHeader title="الخصوصية والقانون" />
        <div
          className="mx-4 rounded-2xl overflow-hidden divide-y divide-border"
          style={{ border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }}
        >
          <MenuRow
            icon={Shield}
            label="سياسة الخصوصية"
            onClick={() => setLocation("/privacy")}
            iconColor="hsl(220 50% 50%)"
          />
          <MenuRow
            icon={FileText}
            label="الشروط والأحكام"
            onClick={() => setLocation("/terms")}
            iconColor="hsl(220 50% 50%)"
          />
          <MenuRow
            icon={AlertTriangle}
            label="إخلاء المسؤولية"
            onClick={() => setLocation("/disclaimer")}
            iconColor="hsl(38 65% 45%)"
          />
        </div>

        {/* ── Logout (logged-in only) ── */}
        {isLoggedIn && (
          <div
            className="mx-4 mt-4 mb-2 rounded-2xl overflow-hidden"
            style={{ border: "1px solid hsl(10 55% 52% / 0.25)", background: "hsl(var(--card))" }}
          >
            <MenuRow
              icon={LogOut}
              label="تسجيل الخروج"
              onClick={() => setIsLogoutOpen(true)}
              danger
            />
          </div>
        )}

        <p className="text-center text-[10px] text-muted-foreground mt-4 mb-2">
          مواعيدك © {new Date().getFullYear()} — جميع الحقوق محفوظة
        </p>
      </div>

      <ConfirmDialog
        open={isLogoutOpen}
        onOpenChange={setIsLogoutOpen}
        title="تسجيل الخروج"
        description="هل أنت متأكد؟ ستعود إلى شاشة البداية."
        confirmText="تسجيل الخروج"
        onConfirm={handleLogout}
      />
    </AppShell>
  );
}
