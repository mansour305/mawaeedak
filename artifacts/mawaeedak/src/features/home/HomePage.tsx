/**
 * HomePage — Phase 20: Exact Reference Screen Rebuild
 * Layout rebuilt from scratch to match the owner's reference image.
 * Data logic (Supabase, Gateway, Location, Prayer) unchanged.
 */
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  Menu, Share2, Bell, Eye, EyeOff, Wallet, Home,
  UserCheck, Users, ChevronLeft, CalendarDays,
} from "lucide-react";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { BottomNav } from "@/components/layout/BottomNav";
import { formatHijriDate, formatGregorianDate, getDayName, formatAppTime, ksaMidnight } from "@/lib/utils";
import { useStore } from "@/hooks/useStore";
import { useGetPrayerTimes } from "@workspace/api-client-react";
import {
  useGatewayFinancialCountdown,
  useGatewayUnreadCount,
} from "@/hooks/useGatewayData";
import { useLocationPrefs } from "@/hooks/useLocationPrefs";
import { useTimeFormat } from "@/hooks/useTimeFormat";

// ── Greeting ────────────────────────────────────────────────────────────────
function getGreeting() {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return "صباح الخير";
  return "مساء الخير";
}

// ── Days label ───────────────────────────────────────────────────────────────
function getDaysLabel(days: number): string {
  if (days <= 0) return "اليوم";
  if (days === 1) return "غداً";
  return `(${days}) أيام`;
}

// ── Icon for financial item ──────────────────────────────────────────────────
function ItemIcon({ name, small = false }: { name: string; small?: boolean }) {
  const cls = small ? "w-[14px] h-[14px]" : "w-[18px] h-[18px]";
  const color = "hsl(var(--primary-foreground))";
  if (name.includes("سكن"))   return <Home      className={cls} style={{ color }} />;
  if (name.includes("تأهيل")) return <UserCheck className={cls} style={{ color }} />;
  if (name.includes("ضمان"))  return <Users     className={cls} style={{ color }} />;
  return <Wallet className={cls} style={{ color }} />;
}

// ── Logo Emblem ──────────────────────────────────────────────────────────────
const LogoEmblem = ({ size = 40 }: { size?: number }) => (
  <div style={{
    width: size, height: size, borderRadius: "50%", flexShrink: 0,
    background: "hsl(var(--primary))",
    border: "2px solid hsl(var(--primary) / 0.18)",
    display: "flex", alignItems: "center", justifyContent: "center",
    boxShadow: "0 8px 18px hsl(var(--primary) / 0.18)",
  }}>
    <CalendarDays size={size * 0.56} color="hsl(var(--primary-foreground))" strokeWidth={2.4} />
  </div>
);

// ── Mosque Icon ──────────────────────────────────────────────────────────────
const MosqueIcon = () => (
  <svg viewBox="0 0 24 22" width="26" height="22" fill="currentColor">
    <rect x="0.5"  y="4.5" width="3"  height="12" rx="0.6" opacity="0.78" />
    <path d="M2,4.5 Q3.5,2.5 3.5,4.5Z" opacity="0.85" />
    <rect x="20.5" y="4.5" width="3"  height="12" rx="0.6" opacity="0.78" />
    <path d="M22,4.5 Q20.5,2.5 20.5,4.5Z" opacity="0.85" />
    <path d="M5,6 Q5,0 12,0 Q19,0 19,6 L19,10 L5,10Z" opacity="0.88" />
    <rect x="0"   y="16" width="24" height="3.5" rx="0.6" opacity="0.75" />
    <rect x="3.5" y="10" width="17" height="6"   opacity="0.72" />
  </svg>
);

// ── Countdown Box ─────────────────────────────────────────────────────────────
function CountdownBox({ value, label }: { value: number; label: string }) {
  const v = String(value).padStart(2, "0");
  return (
    <div className="flex flex-col items-center gap-1 flex-1">
      <div
        className="w-full flex items-center justify-center rounded-xl font-extrabold"
        style={{
          background: "linear-gradient(150deg, hsl(20 72% 12%) 0%, hsl(18 76% 8%) 100%)",
          border: "1px solid hsl(38 60% 38% / 0.55)",
          boxShadow: "inset 0 1px 0 rgba(255,220,120,0.08), 0 3px 8px rgba(0,0,0,0.30)",
          color: "hsl(38 86% 78%)",
          fontSize: "clamp(17px, 5.5vw, 22px)",
          height: "50px",
          fontVariantNumeric: "tabular-nums",
          letterSpacing: "0.02em",
        }}
      >
        {v}
      </div>
      <span
        className="text-[10px] font-bold leading-none"
        style={{ color: "hsl(var(--muted-foreground))" }}
      >
        {label}
      </span>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// HOMEPAGE — MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
export default function HomePage() {
  const { hideAds, setHideAds, user, isAdmin } = useStore();
  const { prefs: locPrefs } = useLocationPrefs();
  const { data: unreadCount } = useGatewayUnreadCount();
  const { data: countdownData, status: countdownStatus } = useGatewayFinancialCountdown();
  const { format: timeFormat } = useTimeFormat();
  // مصدر موحَّد للعدادات المالية:
  //  - بيانات المستخدم من Gateway (Supabase) لها الأولوية عند توفرها.
  //  - الجدول العام للمدفوعات الحكومية من API يُجلب مبكراً (بالتوازي) كي تظهر
  //    البطاقات فوراً بلا وميض تحميل، ويُستخدم عند غياب بيانات للمستخدم.
  const hasUserCountdown =
    countdownStatus === "success" && !!countdownData && countdownData.length > 0;
  const { data: apiPublicCountdown } = useQuery<Array<{
    id: number; name: string; type: string; next_date: string;
    days_remaining: number; amount: number | null;
  }> | null>({
    queryKey: ["financial-countdown-public"],
    queryFn: async () => {
      const res = await fetch("/api/financial-events/countdown");
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !hasUserCountdown,
    staleTime: 60_000,
  });
  const displayCountdown =
    hasUserCountdown ? (countdownData ?? null) : (apiPublicCountdown ?? null);

  const prayerCity =
    locPrefs.source !== "default" ? locPrefs.city : (user.city || "الرياض");
  const { data: prayerData, isLoading: isPrayerLoading } =
    useGetPrayerTimes({ city: prayerCity });

  const notifCount = unreadCount ?? 0;
  const greeting = getGreeting();

  // ── Live countdown for primary financial item ──────────────────────────────
  const [cd, setCd] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const primary = displayCountdown?.[0];
    if (!primary?.next_date) return;
    const target = ksaMidnight(primary.next_date);
    const compute = () => {
      const diff = target.getTime() - Date.now();
      if (diff <= 0) {
        setCd({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      setCd({
        days:    Math.floor(diff / 864e5),
        hours:   Math.floor((diff % 864e5) / 36e5),
        minutes: Math.floor((diff % 36e5)  / 6e4),
        seconds: Math.floor((diff % 6e4)   / 1e3),
      });
    };
    compute();
    const t = setInterval(compute, 1000);
    return () => clearInterval(t);
  }, [displayCountdown]);

  // ── Share ──────────────────────────────────────────────────────────────────
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "مواعيدك",
          text: "منصة مواعيدك لإدارة وقتك ومالك",
          url: window.location.origin,
        });
      } catch { /* silent */ }
    } else {
      navigator.clipboard.writeText(window.location.origin).catch(() => {});
    }
  };

  // ── Prayer times ──────────────────────────────────────────────────────────
  const prayerOrder = [
    { label: "الفجر",   key: "fajr" },
    { label: "الشروق", key: "sunrise" },
    { label: "الظهر",  key: "dhuhr" },
    { label: "العصر",  key: "asr" },
    { label: "المغرب", key: "maghrib" },
    { label: "العشاء", key: "isha" },
  ];
  const pm = (k: string): string => {
    if (!prayerData) return "—";
    const map: Record<string, string | null | undefined> = {
      fajr: prayerData.fajr, sunrise: prayerData.sunrise,
      dhuhr: prayerData.dhuhr, asr: prayerData.asr,
      maghrib: prayerData.maghrib, isha: prayerData.isha,
    };
    return map[k] ?? "—";
  };

  // ── Financial items ───────────────────────────────────────────────────────
  const primaryItem  = displayCountdown?.[0] ?? null;
  const supportItems = displayCountdown?.slice(1) ?? [];

  // ── Date strings ──────────────────────────────────────────────────────────
  const hijriStr     = formatHijriDate();
  const gregorianStr = formatGregorianDate();
  const dayStr       = getDayName();

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div
      dir="rtl"
      className="min-h-[100dvh] text-foreground mx-auto max-w-[480px] app-frame relative overflow-hidden flex flex-col"
      style={{ background: "hsl(var(--background))" }}
    >
      {/* ╔══════════════════════════════════════════════════════╗
          ║  HEADER — matches reference exactly                  ║
          ╚══════════════════════════════════════════════════════╝ */}
      <header
        className="sticky top-0 z-40 w-full shrink-0"
        style={{
          height: "60px",
          background: "hsl(var(--header-bg))",
          borderBottom: "1px solid hsl(var(--header-border))",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <div className="flex items-center h-full px-2 gap-1.5">

          {/* RIGHT (RTL start): Hamburger menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost" size="icon"
                className="w-9 h-9 rounded-xl hover:bg-white/10 shrink-0"
                aria-label="القائمة"
              >
                <Menu className="w-5 h-5" style={{ color: "hsl(var(--primary))" }} />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] rtl bg-card border-border">
              <SheetHeader className="text-right pb-4 border-b border-border">
                <SheetTitle className="text-lg font-bold">مواعيدك</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-1 mt-5">
                <div className="flex items-center justify-between px-3 py-3 rounded-xl hover:bg-secondary/60 transition-colors">
                  <Label htmlFor="hide-ads-menu" className="text-base font-medium cursor-pointer">
                    إخفاء الإعلانات
                  </Label>
                  <Switch id="hide-ads-menu" checked={hideAds} onCheckedChange={setHideAds} />
                </div>
                <div style={{ height: "1px", background: "hsl(var(--border))", margin: "6px 0" }} />
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

          {/* TITLE + إخفاء الإعلانات pill */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span
              style={{
                fontSize: "17px",
                fontWeight: 800,
                color: "hsl(var(--header-fg))",
                letterSpacing: "0.02em",
                whiteSpace: "nowrap",
              }}
            >
              الرئيسية
            </span>
            <button
              onClick={() => setHideAds(!hideAds)}
              className="flex items-center gap-1 px-2 py-1 rounded-full transition-colors hover:bg-white/10 shrink-0"
              style={{
                background: "hsl(var(--primary) / 0.08)",
                border: "1px solid hsl(var(--primary) / 0.18)",
                fontSize: "10.5px",
                color: "hsl(var(--primary))",
                fontWeight: 700,
              }}
            >
              {hideAds
                ? <Eye     className="w-2.5 h-2.5" />
                : <EyeOff  className="w-2.5 h-2.5" />
              }
              <span className="hidden xs:inline">
                {hideAds ? "إظهار" : "إخفاء الإعلانات"}
              </span>
              <span className="xs:hidden">
                {hideAds ? "إظهار" : "إخفاء"}
              </span>
            </button>
          </div>

          {/* LEFT (RTL end): Share + Bell */}
          <div className="flex items-center gap-0.5 shrink-0">
            <Button
              variant="ghost" size="icon"
              onClick={handleShare}
              className="w-9 h-9 rounded-xl hover:bg-white/10"
              aria-label="مشاركة"
            >
              <Share2 className="w-[17px] h-[17px]" style={{ color: "hsl(var(--primary))" }} />
            </Button>
            <Link href="/notifications">
              <Button
                variant="ghost" size="icon"
                className="w-9 h-9 rounded-xl hover:bg-white/10 relative"
                aria-label="الإشعارات"
              >
                <Bell className="w-[18px] h-[18px]" style={{ color: "hsl(var(--primary))" }} />
                {notifCount > 0 && (
                  <span
                    className="absolute top-[5px] left-[5px] min-w-[16px] h-4 flex items-center justify-center rounded-full text-[9px] font-extrabold text-white px-0.5"
                    style={{
                      background: "hsl(var(--nav-active))",
                      boxShadow: "0 0 0 1.5px hsl(var(--header-bg))",
                    }}
                  >
                    {notifCount > 9 ? "9+" : notifCount}
                  </span>
                )}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ╔══════════════════════════════════════════════════════╗
          ║  SCROLLABLE CONTENT                                   ║
          ╚══════════════════════════════════════════════════════╝ */}
      <main
        className="flex-1 overflow-y-auto"
        style={{
          paddingBottom: "76px",
          background: "hsl(var(--background))",
        }}
      >
        <div className="flex flex-col gap-2.5 px-3 pt-2.5 pb-2">

          {/* ── DATE CARD ────────────────────────────────────── */}
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-2xl"
            style={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <div className="flex-1 min-w-0">
              <p
                className="font-extrabold leading-snug text-right"
                style={{ fontSize: "13px", color: "hsl(var(--foreground))" }}
              >
                تاريخ اليوم {dayStr} {hijriStr}
              </p>
              <p
                className="font-semibold text-right mt-0.5"
                style={{ fontSize: "11.5px", color: "hsl(var(--muted-foreground))" }}
              >
                الموافق {gregorianStr}
              </p>
            </div>
            <LogoEmblem size={40} />
          </div>

          {/* Neutral hero area. New identity assets can replace this block later. */}
          <div
            className="relative overflow-hidden"
            style={{
              height: "196px",
              borderRadius: "18px",
              border: "1px solid hsl(var(--border))",
              boxShadow:
                "var(--shadow-md), " +
                "0 0 0 1px hsl(var(--border))",
              background:
                "linear-gradient(135deg, hsl(var(--primary) / 0.12), hsl(var(--accent) / 0.10)), hsl(var(--card))",
            }}
          >
            {/* Neutral placeholder frame */}
            <div
              style={{
                position: "absolute",
                inset: 18,
                borderRadius: 18,
                border: "1px dashed hsl(var(--primary) / 0.18)",
              }}
            />
            {/* Greeting text */}
            <div
              className="absolute inset-0 z-10 flex flex-col justify-center px-5 text-right"
            >
              <p
                className="font-extrabold leading-none mb-1.5"
                style={{
                  fontSize: "clamp(20px, 5.8vw, 26px)",
                  color: "hsl(var(--foreground))",
                }}
              >
                {greeting}
              </p>
              <p
                style={{
                  fontSize: "13px",
                  color: "hsl(var(--muted-foreground))",
                  fontWeight: 600,
                }}
              >
                ابدأ يومك بذكر الله
              </p>
              <p
                style={{
                  fontSize: "11.5px",
                  color: "hsl(var(--muted-foreground))",
                  fontWeight: 500,
                  marginTop: "2px",
                }}
              >
                وتوكل على الله وحقق أهدافك
              </p>
            </div>
          </div>

          {/* ── PRAYER STRIP ─────────────────────────────────── */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background:
                "linear-gradient(180deg, hsl(20 68% 13%) 0%, hsl(18 74% 9%) 100%)",
              border: "1.5px solid hsl(38 56% 36% / 0.55)",
              boxShadow: "0 4px 20px -3px rgba(8,3,0,0.50)",
            }}
          >
            {/* Strip header */}
            <div
              className="flex items-center justify-between px-3 py-2"
              style={{ borderBottom: "1px solid rgba(210,162,60,0.16)" }}
            >
              {/* Right (RTL start): mosque + title */}
              <div className="flex items-center gap-2 min-w-0">
                <div style={{ color: "hsl(38 68% 62%)" }}>
                  <MosqueIcon />
                </div>
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span
                    className="font-bold leading-none truncate"
                    style={{ fontSize: "11px", color: "hsl(38 68% 76%)" }}
                  >
                    مواقيت الصلاة · {hijriStr}
                  </span>
                  <span
                    className="font-semibold leading-none truncate"
                    style={{ fontSize: "9px", color: "rgba(255,218,130,0.62)" }}
                  >
                    {locPrefs.source === "gps"
                      ? "حسب موقعك"
                      : prayerCity === "الرياض"
                      ? "الرياض - افتراضي"
                      : `حسب مدينة: ${prayerCity}`}
                  </span>
                </div>
              </div>
              {/* Left: camel + غداً */}
              <div className="flex items-center gap-1">
                <span
                  style={{ fontSize: "11px", color: "rgba(255,218,130,0.55)", fontWeight: 700 }}
                >
                  غداً
                </span>
                <svg viewBox="0 0 22 18" width="24" height="18" fill="hsl(38 58% 52% / 0.60)">
                  <ellipse cx="12" cy="12" rx="7.5" ry="5" />
                  <path d="M8.5,8 Q12,2.5 15.5,8Z" />
                  <path d="M4.5,10 Q2,7 3,4.5 Q5.5,4 5.5,8 Q7.5,9.5 5.5,11Z" />
                  <line x1="8" y1="17" x2="7.5" y2="12.5" stroke="hsl(38 58% 52% / 0.60)" strokeWidth="1.2" strokeLinecap="round" />
                  <line x1="10.5" y1="17" x2="10.5" y2="12.5" stroke="hsl(38 58% 52% / 0.60)" strokeWidth="1.2" strokeLinecap="round" />
                  <line x1="13" y1="17" x2="13.5" y2="12.5" stroke="hsl(38 58% 52% / 0.60)" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
              </div>
            </div>

            {/* Prayer times row — horizontal, compact */}
            <div className="flex px-2 py-2.5 gap-0.5">
              {isPrayerLoading
                ? [...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="flex-1 h-12 rounded-lg animate-pulse"
                      style={{ background: "rgba(255,255,255,0.05)" }}
                    />
                  ))
                : prayerOrder.map(({ label, key }) => (
                    <div
                      key={key}
                      className="flex-1 flex flex-col items-center justify-center py-1.5 px-0.5 rounded-lg"
                      style={{ background: "rgba(255,255,255,0.04)" }}
                    >
                      <span
                        className="font-extrabold block leading-none text-center"
                        style={{
                          fontSize: "clamp(10px, 3vw, 13px)",
                          color: "hsl(38 76% 74%)",
                          fontVariantNumeric: "tabular-nums",
                        }}
                      >
                        {formatAppTime(pm(key), timeFormat)}
                      </span>
                      <span
                        className="font-semibold block text-center"
                        style={{
                          fontSize: "9px",
                          color: "rgba(255,218,130,0.55)",
                          marginTop: "4px",
                        }}
                      >
                        {label}
                      </span>
                    </div>
                  ))
              }
            </div>
          </div>

          {/* ── FINANCIAL SECTION ────────────────────────────── */}
          {countdownStatus === "pending" && null /* loading: silent */}

          {countdownStatus !== "pending" && !primaryItem && (
            /* Empty state — shown when no financial events exist */
            <Link href="/finance">
              <div
                className="flex items-center gap-3 px-4 py-4 rounded-2xl"
                style={{
                  background:
                    "linear-gradient(145deg, hsl(36 44% 96%) 0%, hsl(34 36% 92%) 100%)",
                  border: "1.5px dashed hsl(38 56% 50% / 0.50)",
                  boxShadow: "0 3px 12px -2px rgba(70,32,8,0.14)",
                }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    background:
                      "linear-gradient(135deg, hsl(20 68% 18%) 0%, hsl(18 76% 10%) 100%)",
                    border: "1px solid hsl(38 56% 40% / 0.45)",
                  }}
                >
                  <Wallet className="w-[18px] h-[18px]" style={{ color: "rgba(255,218,160,0.90)" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-right" style={{ fontSize: "13px", color: "hsl(20 58% 13%)" }}>
                    أضف أحداثك المالية
                  </p>
                  <p className="text-right mt-0.5" style={{ fontSize: "11px", color: "hsl(var(--muted-foreground))" }}>
                    رواتب ودعوم وفواتير مع عداد تنازلي
                  </p>
                </div>
                <ChevronLeft className="w-4 h-4 shrink-0" style={{ color: "hsl(var(--primary))" }} />
              </div>
            </Link>
          )}

          {primaryItem ? (
            <>
              {/* Primary card: راتب مايو with live countdown */}
              <div
                className="rounded-2xl overflow-hidden"
                style={{
                  background:
                    "linear-gradient(145deg, hsl(36 44% 96%) 0%, hsl(34 36% 92%) 100%)",
                  border: "1.5px solid hsl(38 56% 50% / 0.68)",
                  boxShadow:
                    "0 6px 24px -4px rgba(70,32,8,0.24), " +
                    "inset 0 1px 0 rgba(255,242,200,0.22)",
                }}
              >
                {/* Gold accent strip */}
                <div
                  style={{
                    height: "3px",
                    background:
                      "linear-gradient(to right, transparent 10%, hsl(38 72% 52%) 40%, hsl(38 72% 52%) 60%, transparent 90%)",
                  }}
                />
                <div className="px-4 py-3">
                  <div className="flex items-start gap-3">
                    {/* Content (flex-1) */}
                    <div className="flex-1 min-w-0">
                      <p
                        className="font-extrabold text-right"
                        style={{ fontSize: "14px", color: "hsl(20 60% 14%)" }}
                      >
                        {primaryItem.name}
                      </p>
                      {primaryItem.next_date && (
                        <p
                          className="text-right mt-0.5"
                          style={{
                            fontSize: "11px",
                            color: "hsl(var(--muted-foreground))",
                            direction: "ltr",
                            textAlign: "right",
                          }}
                        >
                          {primaryItem.next_date}
                        </p>
                      )}
                      {/* Live countdown */}
                      <div className="flex gap-1.5 mt-3">
                        <CountdownBox value={cd.days}    label="يوم"   />
                        <CountdownBox value={cd.hours}   label="ساعة"  />
                        <CountdownBox value={cd.minutes} label="دقيقة" />
                        <CountdownBox value={cd.seconds} label="ثانية" />
                      </div>
                    </div>

                    {/* Icon circle */}
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                      style={{
                        background:
                          "linear-gradient(135deg, hsl(20 68% 18%) 0%, hsl(18 76% 10%) 100%)",
                        border: "1.5px solid hsl(38 56% 40% / 0.55)",
                        boxShadow: "0 3px 14px rgba(0,0,0,0.40)",
                      }}
                    >
                      <ItemIcon name={primaryItem.name} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Support cards — compact rows */}
              {supportItems.length > 0 && (
                <div className="flex flex-col gap-2">
                  {supportItems.slice(0, 4).map(item => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                      style={{
                        background:
                          "linear-gradient(145deg, hsl(36 44% 96%) 0%, hsl(34 36% 93%) 100%)",
                        border: "1.5px solid hsl(38 50% 54% / 0.52)",
                        boxShadow: "0 3px 12px -2px rgba(70,32,8,0.16)",
                      }}
                    >
                      {/* Icon circle (RTL start = right) */}
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                        style={{
                          background:
                            "linear-gradient(135deg, hsl(20 68% 18%) 0%, hsl(18 76% 10%) 100%)",
                          border: "1px solid hsl(38 56% 40% / 0.45)",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.30)",
                        }}
                      >
                        <ItemIcon name={item.name} small />
                      </div>

                      {/* Name */}
                      <p
                        className="flex-1 font-bold text-right truncate"
                        style={{ fontSize: "13px", color: "hsl(20 58% 13%)" }}
                      >
                        {item.name}
                      </p>

                      {/* Days badge (RTL end = left) */}
                      <span
                        className="shrink-0 font-extrabold rounded-lg px-2 py-0.5"
                        style={{
                          fontSize: "12px",
                          color:
                            item.days_remaining <= 1
                              ? "hsl(38 80% 38%)"
                              : "hsl(var(--muted-foreground))",
                          background:
                            item.days_remaining <= 1
                              ? "hsl(38 72% 52% / 0.14)"
                              : "transparent",
                        }}
                      >
                        {getDaysLabel(item.days_remaining)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* عرض التفاصيل link */}
              <Link href="/finance">
                <div
                  className="flex items-center gap-0.5 py-0.5"
                  style={{
                    color: "hsl(var(--primary))",
                    fontSize: "13px",
                    fontWeight: 700,
                    justifyContent: "flex-start",
                  }}
                >
                  <span>عرض التفاصيل</span>
                  <ChevronLeft className="w-4 h-4 shrink-0" />
                </div>
              </Link>
            </>
          ) : null}

        </div>
      </main>

      {/* ── BOTTOM NAV ──────────────────────────────────────────── */}
      <BottomNav />
    </div>
  );
}

