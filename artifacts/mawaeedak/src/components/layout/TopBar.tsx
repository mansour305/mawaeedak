import { Menu, Share2, Bell } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useStore } from "@/hooks/useStore";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useGatewayUnreadCount } from "@/hooks/useGatewayData";

interface TopBarProps {
  title?: string;
}

/* ══════════════════════════════════════════════════════════════
   EMBLEM — Phase 13K-Fix: larger 54px, more visible
   ══════════════════════════════════════════════════════════════ */
const CamelPalmEmblem = () => (
  <div
    className="flex items-center justify-center shrink-0"
    style={{
      width: "50px",
      height: "50px",
      borderRadius: "50%",
      background:
        "radial-gradient(circle at 38% 36%, hsl(28 60% 26%), hsl(20 74% 11%))",
      border: "2.5px solid hsl(38 68% 50% / 0.80)",
      boxShadow:
        "0 0 0 1.5px hsl(38 60% 26% / 0.55), " +
        "0 0 18px hsl(38 90% 56% / 0.32), " +
        "inset 0 1px 0 rgba(255,228,150,0.22)",
    }}
  >
    <svg viewBox="0 0 36 36" width="32" height="32" fill="none">
      {/* Palm trunk */}
      <line x1="24" y1="14" x2="22" y2="28"
        stroke="#D4A040" strokeWidth="1.8" strokeLinecap="round" />
      {/* Palm fronds */}
      <path d="M23,14 Q31,9 33,12 Q27,14 23,15Z" fill="#B08828" />
      <path d="M23,14 Q15,9 13,12 Q19,14 23,15Z" fill="#B08828" opacity="0.90" />
      <path d="M23,14 Q24,7 23,4 Q22,8 23,15Z" fill="#B08828" />
      <path d="M23,14 Q30,12 32,16 Q26,15 23,15Z" fill="#8C6622" opacity="0.70" />
      {/* Camel body */}
      <ellipse cx="12.5" cy="24.5" rx="7.5" ry="4" fill="#D4A040" />
      {/* Hump */}
      <path d="M10,20 Q12.5,15.5 15,20Z" fill="#D4A040" />
      {/* Neck + head */}
      <path d="M7,22 Q4,17 5,14 Q7.5,13 7.5,18 Q9.5,20 7.5,23Z" fill="#D4A040" />
      {/* Ear */}
      <circle cx="5.2" cy="13.5" r="1" fill="#D4A040" />
      {/* Legs */}
      <line x1="8.5"  y1="28" x2="7.5"  y2="33" stroke="#D4A040" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="11.5" y1="28.5" x2="10.5" y2="33" stroke="#D4A040" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="15"   y1="28.5" x2="16"   y2="33" stroke="#D4A040" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="18"   y1="27.5" x2="19.5" y2="32" stroke="#D4A040" strokeWidth="1.6" strokeLinecap="round" />
      {/* Ground shadow */}
      <ellipse cx="12.5" cy="33.2" rx="8" ry="1.2" fill="#8C6622" opacity="0.28" />
    </svg>
  </div>
);

/* ══════════════════════════════════════════════════════════════
   TOPBAR — Phase 13K-Fix
   Changes:
   - w-full (no max-w constraint — fills app shell width)
   - height 72px (taller, more presence)
   - larger emblem (50px)
   - larger name (22px)
   - Reduced px gap so center group has room
   - Wider icon touch targets
   ══════════════════════════════════════════════════════════════ */
export function TopBar({ title = "الرئيسية" }: TopBarProps) {
  const { data: unreadCount } = useGatewayUnreadCount();
  const count = unreadCount ?? 0;
  const { hideAds, setHideAds, isAdmin } = useStore();

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "مواعيدك",
          text: "اكتشف منصة مواعيدك لإدارة وقتك ومالك.",
          url: window.location.origin,
        });
      } catch { /* silent */ }
    } else {
      navigator.clipboard.writeText(window.location.origin);
    }
  };

  return (
    <header
      className="sticky top-0 z-40 w-full"
      style={{
        height: "72px",
        background:
          "linear-gradient(180deg, hsl(20 70% 15%) 0%, hsl(18 74% 10%) 60%, hsl(16 76% 8%) 100%)",
        backgroundImage: [
          "linear-gradient(180deg, hsl(20 70% 15%) 0%, hsl(18 74% 10%) 60%, hsl(16 76% 8%) 100%)",
          "repeating-linear-gradient(45deg,  rgba(210,162,60,0.085) 0px, rgba(210,162,60,0.085) 1px, transparent 1px, transparent 11px)",
          "repeating-linear-gradient(-45deg, rgba(210,162,60,0.085) 0px, rgba(210,162,60,0.085) 1px, transparent 1px, transparent 11px)",
        ].join(", "),
        borderBottom: "2.5px solid hsl(38 70% 44%)",
        boxShadow:
          "0 2px 0 hsl(38 80% 58% / 0.40), " +
          "0 6px 28px rgba(8,3,0,0.62), " +
          "inset 0 1.5px 0 rgba(255,228,150,0.16)",
      }}
    >
      <div className="relative flex items-center justify-between h-full px-2">

        {/* Right side: hamburger menu (RTL = physical right) */}
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="القائمة الرئيسية"
              className="w-10 h-10 rounded-xl hover:bg-white/10 shrink-0"
            >
              <Menu
                className="w-[22px] h-[22px]"
                style={{ color: "hsl(38 74% 64%)" }}
              />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[280px] rtl bg-card border-border">
            <SheetHeader className="text-right pb-4 border-b border-border">
              <SheetTitle className="text-lg font-bold text-foreground">مواعيدك</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-1 mt-5">
              <div className="flex items-center justify-between px-3 py-3 rounded-xl hover:bg-secondary/60 transition-colors">
                <Label htmlFor="hide-ads" className="text-base font-medium cursor-pointer">
                  إخفاء الإعلانات
                </Label>
                <Switch id="hide-ads" checked={hideAds} onCheckedChange={setHideAds} />
              </div>
              <div className="gold-divider my-2" />
              {[
                { href: "/privacy",    label: "سياسة الخصوصية" },
                { href: "/terms",      label: "شروط الاستخدام" },
                { href: "/disclaimer", label: "إخلاء المسؤولية" },
                { href: "/support",    label: "المساعدة والدعم" },
                ...(isAdmin ? [{ href: "/admin", label: "لوحة التحكم" }] : []),
              ].map(item => (
                <Link key={item.href} href={item.href}>
                  <span className="flex items-center gap-2 px-3 py-3 rounded-xl text-foreground hover:bg-secondary/60 hover:text-primary transition-colors text-[15px] font-medium cursor-pointer">
                    {item.label}
                  </span>
                </Link>
              ))}
            </div>
          </SheetContent>
        </Sheet>

        {/* Center: Emblem + Title — absolute center */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="flex items-center gap-2">
            <CamelPalmEmblem />
            <span
              style={{
                fontSize: "22px",
                fontWeight: 900,
                fontFamily: "'Tajawal', sans-serif",
                color: "hsl(38 86% 90%)",
                letterSpacing: "0.03em",
                textShadow:
                  "0 1px 10px rgba(0,0,0,0.65), " +
                  "0 0 30px hsl(38 90% 60% / 0.25)",
              }}
            >
              مواعيدك
            </span>
          </div>
        </div>

        {/* Left side: Share + Bell (RTL = physical left) */}
        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleShare}
            aria-label="مشاركة التطبيق"
            className="w-10 h-10 rounded-xl hover:bg-white/10"
          >
            <Share2 className="w-[18px] h-[18px]" style={{ color: "hsl(38 74% 64%)" }} />
          </Button>

          <Link href="/notifications">
            <Button
              variant="ghost"
              size="icon"
              aria-label={`الإشعارات${count > 0 ? ` - ${count} غير مقروء` : ""}`}
              className="w-10 h-10 rounded-xl relative hover:bg-white/10"
            >
              <Bell className="w-[20px] h-[20px]" style={{ color: "hsl(38 74% 64%)" }} />
              {count > 0 && (
                <span
                  className="absolute top-[4px] left-[4px] min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[10px] font-extrabold text-white px-1"
                  style={{
                    background: "hsl(var(--nav-active))",
                    boxShadow: "0 0 0 2px hsl(18 74% 10%)",
                  }}
                >
                  {count > 9 ? "9+" : count}
                </span>
              )}
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
