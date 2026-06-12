/**
 * MorePage — Saudi Premium Minimal More/Settings
 * Reference: docs/design-reference/final-2026/05-more-page.jpeg
 * 
 * Features:
 * - Title: المزيد
 * - Premium greeting card with desert hero
 * - User/guest identity display
 * - Menu rows: الملف الشخصي, الإعدادات, مشاركة التطبيق, etc.
 * - Blessing card: بارك الله في وقتك
 * - Logout navigates to / as guest with toast
 */

import { useState } from "react";
import type { ElementType } from "react";
import { useLocation } from "wouter";
import { ChevronLeft, FileText, Gift, Headphones, Lamp, LogIn, LogOut, Settings, Share2, Shield, ShieldCheck, Sparkles, User } from "lucide-react";
import desertHeroImg from "@assets/desert-hero.png";
import { AppShell } from "@/components/layout/AppShell";
import { MawaeedakLogo } from "@/components/layout/TopBar";
import { ConfirmDialog } from "@/components/layout/ConfirmDialog";
import { showTopNotification } from "@/components/layout/TopNotificationBanner";
import { useStore } from "@/hooks/useStore";

function MoreRow({
  icon: Icon,
  label,
  onClick,
  danger = false,
  description,
}: {
  icon: ElementType;
  label: string;
  onClick: () => void;
  danger?: boolean;
  description?: string;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-4 border-b px-5 py-5 text-right last:border-b-0 transition active:scale-[0.98]"
      style={{ 
        borderColor: "rgba(201,160,99,0.16)",
        color: danger ? "#B9483F" : "#2F2B25",
        background: danger ? "rgba(185,72,63,0.04)" : "transparent",
      }}
    >
      <span 
        className="grid h-10 w-10 shrink-0 place-items-center rounded-[14px] border" 
        style={{ background: "#FFF9EF", borderColor: "rgba(201,160,99,0.3)" }}
      >
        <Icon className="h-5 w-5" strokeWidth={1.8} style={{ color: danger ? "#B9483F" : "#A78042" }} />
      </span>
      <div className="flex-1 text-right">
        <span className="block text-[21px] font-extrabold">{label}</span>
        {description && (
          <span className="block text-[14px] font-bold mt-0.5" style={{ color: "#6F6557" }}>
            {description}
          </span>
        )}
      </div>
      <ChevronLeft className="h-5 w-5 shrink-0" style={{ color: "#6F6557" }} />
    </button>
  );
}

function DailyCardRow({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-[20px] border p-4 text-right transition active:scale-[0.98]"
      style={{
        borderColor: "rgba(201,160,99,0.30)",
        background: "linear-gradient(135deg, rgba(201,160,99,0.08), rgba(201,160,99,0.03))",
        boxShadow: "0 4px 12px rgba(138,107,61,0.08)"
      }}
    >
      <div className="flex items-center gap-4">
        <div
          className="flex h-14 w-14 items-center justify-center rounded-[16px]"
          style={{ background: "linear-gradient(135deg, #C9A063, #A78042)" }}
        >
          <Gift className="h-7 w-7 text-white" strokeWidth={1.6} />
        </div>
        <div className="text-right">
          <h3 className="text-[19px] font-extrabold" style={{ color: "#2F2B25" }}>
            بطاقة يومية
          </h3>
          <p className="text-[14px] font-bold mt-0.5" style={{ color: "#6F6557" }}>
            شارك يومك مع الآخرين
          </p>
        </div>
      </div>
      <ChevronLeft className="h-6 w-6" style={{ color: "#A78042" }} />
    </button>
  );
}

export default function MorePage() {
  const [, setLocation] = useLocation();
  const { user, isAdmin, setUser, setAdmin } = useStore();
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const isLoggedIn = Boolean(user?.email);
  const displayName = (user?.name && user.name.length > 0) ? user.name : null;

  const shareApp = async () => {
    const url = window.location.origin;

    if (navigator.share) {
      try {
        await navigator.share({ title: "مواعيدك", text: "كل مواعيدك في مكان واحد", url });
        showTopNotification("تمت المشاركة بنجاح", "success");
      } catch {
        showTopNotification("فشل مشاركة التطبيق", "error");
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        showTopNotification("تم نسخ رابط التطبيق", "info");
      } catch {
        showTopNotification("فشل نسخ الرابط", "error");
      }
    }
  };

  const handleLogout = async () => {
    // Clear auth/session only, keep theme/location/preferences
    localStorage.removeItem("app-user");
    sessionStorage.removeItem("mawaeedak_demo_session");
    sessionStorage.setItem("mawaeedak_splash_shown", "true");
    
    // Reset user to guest
    setUser({
      id: "",
      name: "",
      email: "",
      city: "الرياض",
      cityKey: "riyadh",
      timezone: "Asia/Riyadh",
      role: "user",
      onboardingComplete: true,
      interests: [],
    });
    setAdmin(false);
    
    showTopNotification("تم تسجيل الخروج والعودة للرئيسية", "success");
    setLocation("/");
    window.history.replaceState(null, "", "/");
  };

  return (
    <AppShell title="المزيد">
      <div className="space-y-5">
        {/* Premium greeting card */}
        <section className="relative overflow-hidden rounded-[26px] border bg-white/72 p-5" style={{ borderColor: "rgba(201,160,99,0.22)", boxShadow: "0 16px 40px rgba(138,107,61,0.12)" }}>
          <img src={desertHeroImg} alt="" className="absolute inset-y-0 right-0 h-full w-[48%] object-cover opacity-75" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#FAF7F2] via-[#FAF7F2]/86 to-transparent" />
          <div className="relative z-10 flex min-h-[160px] items-center justify-between gap-4">
            <div className="text-right">
              <p className="text-[25px] font-extrabold flex items-center gap-2" style={{ color: "#2F2B25" }}>
                مرحباً بك <Sparkles className="h-5 w-5" style={{ color: "#C9A063" }} />
              </p>
              <p className="mt-2 text-[26px] font-extrabold leading-tight" style={{ color: "#2F2B25" }}>
                {displayName ? `يا ${displayName}` : "زائر مواعيدك"}
              </p>
              <p className="mt-4 flex items-center gap-2 text-[15px] font-bold" style={{ color: "#8A6B3D" }}>
                نسعد بخدمتك كل يوم
              </p>
            </div>
            <MawaeedakLogo compact />
          </div>
        </section>

        <section className="px-1">
          <DailyCardRow onClick={() => setLocation("/story")} />
        </section>

        {/* Settings list */}
        <section className="overflow-hidden rounded-[24px] border bg-white/82" style={{ borderColor: "rgba(201,160,99,0.22)", boxShadow: "0 14px 34px rgba(138,107,61,0.10)" }}>
          {isLoggedIn && <MoreRow icon={User} label="الملف الشخصي" onClick={() => setLocation("/account")} />}
          {isLoggedIn && <MoreRow icon={Settings} label="الإعدادات" onClick={() => setLocation("/account#settings")} />}
          <MoreRow icon={Share2} label="مشاركة التطبيق" onClick={shareApp} />
          <MoreRow icon={ShieldCheck} label="سياسة الخصوصية" onClick={() => setLocation("/privacy")} />
          <MoreRow icon={FileText} label="الشروط والأحكام" onClick={() => setLocation("/terms")} />
          <MoreRow icon={Headphones} label="المساعدة والدعم" onClick={() => setLocation("/support")} />
          {isAdmin && (
            <MoreRow icon={Shield} label="لوحة المالك" onClick={() => setLocation("/admin")} />
          )}
          {isLoggedIn ? (
            <MoreRow icon={LogOut} label="تسجيل الخروج" danger onClick={() => setIsLogoutOpen(true)} />
          ) : (
            <MoreRow icon={LogIn} label="تسجيل الدخول / إنشاء حساب" onClick={() => setLocation("/login")} />
          )}
        </section>

        {/* Blessing card */}
        <section className="relative overflow-hidden rounded-[24px] border p-5" style={{ borderColor: "rgba(201,160,99,0.20)", background: "linear-gradient(90deg, #F3E8D6, #FAF7F2)" }}>
          <Lamp className="absolute bottom-4 right-4 h-16 w-16 opacity-35" style={{ color: "#C9A063" }} />
          {/* Ornamental gold divider */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-10 flex-1" style={{ background: "linear-gradient(90deg, transparent, #C9A063)" }} />
            <span className="text-lg" style={{ color: "#C9A063" }}>✦</span>
            <div className="h-px w-10 flex-1" style={{ background: "linear-gradient(90deg, #C9A063, transparent)" }} />
          </div>
          <p className="relative text-[22px] font-extrabold" style={{ color: "#8A6B3D" }}>بارك الله في وقتك</p>
          <p className="relative mt-2 text-[15px] font-bold" style={{ color: "#2F2B25" }}>جعلنا الله وإياكم من الموفقين في كل أوقاتنا</p>
        </section>
      </div>

      <ConfirmDialog
        open={isLogoutOpen}
        onOpenChange={setIsLogoutOpen}
        title="تسجيل الخروج"
        description="هل تريد تسجيل الخروج من حسابك؟ سيتم إعادتك إلى الصفحة الرئيسية."
        confirmText="تسجيل الخروج"
        onConfirm={handleLogout}
      />
    </AppShell>
  );
}
