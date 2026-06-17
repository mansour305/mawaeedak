import { CalendarDays, Clock3, Landmark, Moon, Sun, Sunrise, Users, Wallet, MapPin } from "lucide-react";
import { Link } from "wouter";
import { AppShell } from "@/components/layout/AppShell";
import { usePrayerEngine, PRAYER_STATUS_MESSAGES } from "@/hooks/usePrayerEngine";
import { useGatewayDailyMessages, useGatewayFinancialCountdown } from "@/hooks/useGatewayData";
import { useStore } from "@/hooks/useStore";
import { formatGregorianDate, formatHijriDate, getDayName } from "@/lib/utils";
import { useOfficialFinancialDates } from "@/hooks/useOfficialData";
import { useMemo, useEffect } from "react";
import { useTimeFormat } from "@/hooks/useTimeFormat";
import { normalizeFinancialEvents } from "@/lib/financialEngine";
import { getRiyadhDateParts, getRiyadhTodayKey } from "@/lib/riyadhTime";
import { useLocationPrefs } from "@/hooks/useLocationPrefs";
import { useState } from "react";
import { showTopNotification } from "@/components/layout/TopNotificationBanner";

const GOLD = "#C9A063";
const BROWN = "#8A6B3D";
const INK = "#2F2B25";
const PAPER = "#FAF7F2";
const DEFAULT_DAILY_MESSAGE = "ابدأ يومك بنية طيبة، وتوكل على الله في كل خطوة.";

function currentGreeting() {
  const hour = getRiyadhDateParts().hour;
  return hour < 12 ? "صباح الخير" : "مساء الخير";
}

function PrayerIcon({ keyName }: { keyName: string }) {
  if (keyName === "fajr" || keyName === "isha") return <Moon className="h-6 w-6" />;
  if (keyName === "sunrise" || keyName === "maghrib") return <Sunrise className="h-6 w-6" />;
  return <Sun className="h-6 w-6" />;
}

/**
 * HomePage — uses usePrayerEngine for prayer times
 * 
 * Prayer times flow:
 * 1. Official prayer times from Supabase (preferred)
 * 2. AlAdhan API fallback with method=4 for Saudi Arabia
 * 3. 6-hour cache
 * 4. Loading/error/empty/ready states
 */
export default function HomePage() {
  const { user } = useStore();
  const { formatTime } = useTimeFormat();
  const { prefs, requestGPS } = useLocationPrefs();
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  
  // Check if we should show location prompt
  const hasLocationCoords = typeof prefs.lat === "number" && typeof prefs.lng === "number";
  
  // Use prayer engine hook - handles official, AlAdhan, cache, location
  const { 
    status: prayerStatus, 
    error: prayerError,
    timings, 
    cityName, 
    nextPrayer, 
    countdown 
  } = usePrayerEngine();
  
  // Show location prompt on mount if no coordinates and hasn't been prompted
  useEffect(() => {
    const prompted = sessionStorage.getItem("mawaeedak_location_prompted");
    if (!hasLocationCoords && !prompted) {
      // Delay to let the page render first
      const timer = setTimeout(() => setShowLocationPrompt(true), 500);
      return () => clearTimeout(timer);
    }
  }, [hasLocationCoords]);
  
  const handleUseMyLocation = async () => {
    sessionStorage.setItem("mawaeedak_location_prompted", "1");
    setShowLocationPrompt(false);
    try {
      await requestGPS();
      showTopNotification("تم تحديد موقعك بنجاح", "success");
    } catch {
      showTopNotification("تم استخدام الرياض كافتراضي، ويمكنك تغيير الموقع من حسابك", "info");
    }
  };
  
  const handleUseRiyadh = () => {
    sessionStorage.setItem("mawaeedak_location_prompted", "1");
    setShowLocationPrompt(false);
    showTopNotification("تم استخدام الرياض كافتراضي، ويمكنك تغيير الموقع من حسابك", "info");
  };
  
  const dismissLocationPrompt = () => {
    sessionStorage.setItem("mawaeedak_location_prompted", "1");
    setShowLocationPrompt(false);
  };
  
  const todayIso = getRiyadhTodayKey();
  
  // Fetch daily messages and financial events
  const { data: dailyMessages } = useGatewayDailyMessages();
  const { data: officialFinancial } = useOfficialFinancialDates();
  const { data: gatewayFinancial, isLoading: isFinancialLoading } = useGatewayFinancialCountdown();

  const todayMessage = useMemo(() => {
    if (!Array.isArray(dailyMessages)) return DEFAULT_DAILY_MESSAGE;

    const activeMessages = dailyMessages
      .filter((message: any) => message?.is_active !== false)
      .filter((message: any) => typeof message?.message === "string" && message.message.trim().length > 0);

    const datedMessage = activeMessages.find((message: any) => message.display_date === todayIso);
    const selectedMessage = datedMessage ?? activeMessages[0];

    return selectedMessage?.message?.trim() || DEFAULT_DAILY_MESSAGE;
  }, [dailyMessages, todayIso]);

  // Map prayer timings to display array
  const prayers = useMemo(() => {
    if (!timings) return null;
    return [
      { key: "fajr", label: "الفجر", time: timings.fajr },
      { key: "sunrise", label: "الشروق", time: timings.sunrise },
      { key: "dhuhr", label: "الظهر", time: timings.dhuhr },
      { key: "asr", label: "العصر", time: timings.asr },
      { key: "maghrib", label: "المغرب", time: timings.maghrib },
      { key: "isha", label: "العشاء", time: timings.isha },
    ];
  }, [timings]);

  // Compute financial items: prefer official records
  const finance = useMemo(() => {
    return normalizeFinancialEvents({
      official: officialFinancial,
      gateway: gatewayFinancial,
      limit: 4,
    });
  }, [officialFinancial, gatewayFinancial]);

  // Get user's display name or empty if not logged in - no hardcoded names
  const displayName = (user?.name && user.name.length > 0) ? user.name.split(" ")[0] : null;

  return (
    <AppShell>
      <section className="space-y-5">
        {/* Location Permission Prompt */}
        {showLocationPrompt && (
          <div 
            className="relative overflow-hidden rounded-[24px] border p-5"
            style={{ 
              borderColor: "rgba(201,160,99,0.30)",
              background: "linear-gradient(145deg, #FFFCF7 0%, #FFF8EE 100%)",
              boxShadow: "0 12px 36px rgba(138,107,61,0.15)",
            }}
          >
            <button
              onClick={dismissLocationPrompt}
              className="absolute left-4 top-4 text-sm font-bold"
              style={{ color: "#8A8175" }}
            >
              ✕
            </button>
            <div className="text-center">
              <div 
                className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full"
                style={{ background: "linear-gradient(135deg, #C9A063, #A78042)" }}
              >
                <MapPin className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-[22px] font-extrabold" style={{ color: "#2F2B25" }}>
                تفعيل الموقع
              </h3>
              <p className="mt-2 text-[15px] font-semibold leading-7" style={{ color: "#6F6557" }}>
                نستخدم موقعك لحساب مواقيت الصلاة بدقة حسب مدينتك.
              </p>
              <div className="mt-5 flex flex-col gap-3">
                <button
                  onClick={handleUseMyLocation}
                  className="w-full rounded-[18px] border py-4 text-[17px] font-bold transition active:scale-[0.98]"
                  style={{ 
                    background: "linear-gradient(135deg, #C9A063, #A78042)",
                    color: "white",
                    borderColor: "#A78042",
                    boxShadow: "0 6px 20px rgba(167,128,66,0.30)",
                  }}
                >
                  استخدام موقعي
                </button>
                <button
                  onClick={handleUseRiyadh}
                  className="w-full rounded-[18px] border py-4 text-[17px] font-bold transition active:scale-[0.98]"
                  style={{ 
                    background: "white",
                    color: "#8A6B3D",
                    borderColor: "rgba(201,160,99,0.30)",
                  }}
                >
                  الرياض كافتراضي
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="text-center">
          <h2 className="text-[30px] font-extrabold leading-tight" style={{ color: INK }}>
            {getDayName()}
          </h2>
          <div className="mx-auto mt-3 grid grid-cols-2 gap-3">
            <div className="flex items-center justify-center gap-2 rounded-full border bg-white/70 px-3 py-2 text-sm font-bold" style={{ borderColor: "rgba(201,160,99,0.22)" }}>
              <CalendarDays className="h-5 w-5" style={{ color: GOLD }} />
              {formatGregorianDate()}
            </div>
            <div className="flex items-center justify-center gap-2 rounded-full border bg-white/70 px-3 py-2 text-sm font-bold" style={{ borderColor: "rgba(201,160,99,0.22)" }}>
              <Landmark className="h-5 w-5" style={{ color: GOLD }} />
              {formatHijriDate()}
            </div>
          </div>
        </div>

        <div className="relative h-[250px] overflow-hidden rounded-[28px] border" style={{ borderColor: "rgba(201,160,99,0.28)", boxShadow: "0 18px 45px rgba(138,107,61,0.18)" }}>
          <div aria-hidden="true" />
          <div className="absolute inset-0 bg-gradient-to-l from-[#FAF7F2]/95 via-[#FAF7F2]/72 to-transparent" />
          <div className="absolute inset-y-0 right-0 flex w-[62%] flex-col justify-center px-5 text-right">
            <h3 className="text-[30px] font-extrabold leading-tight" style={{ color: INK }}>
              {currentGreeting()}{displayName ? ` يا ${displayName}` : ""}
            </h3>
            <p className="mt-4 text-[16px] font-semibold leading-8" style={{ color: "#5D554A" }}>
              {todayMessage}
            </p>
            <span className="mt-4 text-2xl" style={{ color: GOLD }}>♥</span>
          </div>
        </div>

        <section className="rounded-[26px] border bg-white/72 p-3" style={{ borderColor: "rgba(201,160,99,0.24)", boxShadow: "0 12px 30px rgba(138,107,61,0.10)" }}>
          <div className="mb-3 flex items-center justify-center gap-3">
            <span className="h-px flex-1 bg-gradient-to-l from-transparent via-[#C9A063] to-transparent" />
            <h3 className="text-[22px] font-extrabold" style={{ color: BROWN }}>مواقيت الصلاة</h3>
            <Landmark className="h-6 w-6" style={{ color: GOLD }} />
          </div>
          
          {/* Prayer states: loading, error, empty, ready */}
          {prayerStatus === "loading" && (
            <div className="rounded-[18px] border bg-[#FFFCF7] p-5 text-center" style={{ borderColor: "rgba(201,160,99,0.18)" }}>
              <Landmark className="mx-auto h-8 w-8 animate-pulse" style={{ color: GOLD }} />
              <p className="mt-3 text-sm font-semibold" style={{ color: BROWN }}>
                {PRAYER_STATUS_MESSAGES.loading}
              </p>
            </div>
          )}
          
          {prayerStatus === "error" && (
            <div className="rounded-[18px] border bg-[#FFFCF7] p-5 text-center" style={{ borderColor: "rgba(201,160,99,0.18)" }}>
              <p className="text-sm font-semibold" style={{ color: BROWN }}>
                {prayerError || PRAYER_STATUS_MESSAGES.error}
              </p>
            </div>
          )}
          
          {prayerStatus === "empty" && (
            <div className="rounded-[18px] border bg-[#FFFCF7] p-5 text-center" style={{ borderColor: "rgba(201,160,99,0.18)" }}>
              <Landmark className="mx-auto h-8 w-8" style={{ color: GOLD }} />
              <p className="mt-3 text-sm font-semibold" style={{ color: BROWN }}>
                {prayerError || PRAYER_STATUS_MESSAGES.empty}
              </p>
            </div>
          )}
          
          {prayerStatus === "ready" && prayers && (
            <>
              <div className="grid grid-cols-6 overflow-hidden rounded-[18px] border" style={{ borderColor: "rgba(201,160,99,0.18)" }}>
                {prayers.map((prayer) => {
                  const active = nextPrayer && prayer.key === nextPrayer.key;
                  return (
                    <div
                      key={prayer.key}
                      className="flex min-h-[92px] flex-col items-center justify-center gap-2 border-l px-1 text-center last:border-l-0"
                      style={{
                        borderColor: "rgba(201,160,99,0.16)",
                        background: active ? "#F3E8D6" : "rgba(255,255,255,0.62)",
                        color: active ? BROWN : INK,
                      }}
                    >
                      <span style={{ color: GOLD }}><PrayerIcon keyName={prayer.key} /></span>
                      <span className="text-[13px] font-extrabold">{prayer.label}</span>
                      <span className="text-[14px] font-bold" dir="ltr">{formatTime(prayer.time)}</span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 flex items-center gap-3 rounded-[20px] border bg-[#FAF7F2] px-4 py-3" style={{ borderColor: "rgba(201,160,99,0.18)" }}>
                <Landmark className="h-10 w-10 shrink-0" style={{ color: GOLD }} />
                <p className="flex-1 text-center text-[18px] font-bold leading-8" style={{ color: BROWN }}>
                  الصلاة نور وراحة للقلب، فحافظ عليها في وقتها
                </p>
              </div>
              <div className="mx-auto mt-3 flex w-fit items-center gap-2 rounded-full border bg-white px-4 py-2 text-sm font-bold" style={{ borderColor: "rgba(201,160,99,0.20)", color: INK }}>
                <Clock3 className="h-4 w-4" style={{ color: GOLD }} />
                الصلاة القادمة: {nextPrayer?.label ?? "—"} • متبقي {countdown || "--:--:--"}
              </div>
            </>
          )}
        </section>

        <section className="rounded-[26px] border bg-white/72 p-4" style={{ borderColor: "rgba(201,160,99,0.24)", boxShadow: "0 12px 30px rgba(138,107,61,0.10)" }}>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-[20px] font-extrabold" style={{ color: INK }}>
              <CalendarDays className="h-6 w-6" style={{ color: GOLD }} />
              مواعيد مهمة قريبة
            </h3>
            <Link href="/salaries" className="text-sm font-bold" style={{ color: BROWN }}>عرض الكل</Link>
          </div>

          {isFinancialLoading && (!officialFinancial || officialFinancial.length === 0) ? (
            <div className="rounded-[22px] border bg-[#FFFCF7] p-5 text-center text-sm font-bold" style={{ borderColor: "rgba(201,160,99,0.24)", color: BROWN }}>
              جاري تحميل المواعيد المالية...
            </div>
          ) : finance.length === 0 ? (
            <div className="rounded-[22px] border bg-[#FFFCF7] p-5 text-center" style={{ borderColor: "rgba(201,160,99,0.24)" }}>
              <Wallet className="mx-auto h-7 w-7" style={{ color: GOLD }} />
              <h4 className="mt-3 text-[16px] font-extrabold" style={{ color: INK }}>لا توجد مواعيد مالية مؤكدة</h4>
              <p className="mt-2 text-sm font-semibold leading-7" style={{ color: "#6F6557" }}>
                أضف مواعيدك المالية من لوحة المالك.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {finance.map((item: any) => {
                const itemName = String(item.name);
                const isHousing = itemName.includes("سكن");
                const Icon = item.type === "salary" ? Wallet : isHousing ? Users : CalendarDays;
                const bgColor = item.type === "salary" ? "rgba(201,160,99,0.10)" : isHousing ? "rgba(138,107,61,0.10)" : "rgba(201,160,99,0.08)";
                return (
                  <div key={item.id} className="flex items-center gap-3 rounded-[20px] border p-4" style={{ borderColor: "rgba(201,160,99,0.18)", background: bgColor }}>
                    <Icon className="h-7 w-7 shrink-0" style={{ color: GOLD }} />
                    <div className="min-w-0 flex-1 text-right">
                      <p className="truncate text-[15px] font-extrabold leading-tight" style={{ color: INK }}>{item.name}</p>
                      <p className="mt-1 text-[13px] font-bold" style={{ color: BROWN }}>{item.days_remaining} يوم</p>
                      <p className="mt-1 text-[11px] font-bold" style={{ color: "#6F6557" }}>{item.statusLabel}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </section>
    </AppShell>
  );
}

