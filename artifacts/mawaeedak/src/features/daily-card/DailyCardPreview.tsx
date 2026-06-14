import { useMemo, type ReactNode } from "react";
import { useStore } from "@/hooks/useStore";
import { useOfficialPrayerTimes, useOfficialFinancialDates } from "@/hooks/useOfficialData";
import { useGetPrayerTimes } from "@api-client";
import { useGatewayFinancialCountdown } from "@/hooks/useGatewayData";
import { formatHijriDate, formatGregorianDate, getDayName } from "@/lib/utils";
import { useTimeFormat } from "@/hooks/useTimeFormat";
import dailyCardBg from "@assets/daily-card.png";
import { getRiyadhDateParts, getRiyadhTodayKey } from "@/lib/riyadhTime";
import { getCityName, normalizeCityKey } from "@/lib/prayerTimesService";

const GOLD = "#C9A063";
const BROWN = "#8A6B3D";
const INK = "#2F2B25";
const CREAM = "#FAF7F2";
const LIGHT_GOLD = "rgba(201,160,99,0.12)";

// SVG Icons with consistent gold styling
const CalIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.5">
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const QuoteIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill={GOLD}>
    <path d="M6 17h3l2-4V7H5v6h3l-2 4zm8 0h3l2-4V7h-6v6h3l-2 4z"/>
  </svg>
);

const PrayerIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill={GOLD}>
    <path d="M12 2C10.5 2 9 3 9 4.5V6H15V4.5C15 3 13.5 2 12 2ZM12 7V9M12 9C8 9 5 11 5 14V20H19V14C19 11 16 9 12 9ZM7 20V22H17V20"/>
  </svg>
);

const ClockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.5">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12,6 12,12 16,14"/>
  </svg>
);

const MoneyIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.5">
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 6V18M9 9C9 7.5 10.5 7 12 7C13.5 7 15 7.5 15 9C15 10.5 13.5 11 12 11C10.5 11 9 11.5 9 13C9 14.5 10.5 15 12 15C13.5 15 15 14.5 15 13"/>
  </svg>
);

const PersonIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.5">
    <circle cx="12" cy="8" r="4"/>
    <path d="M4 20C4 16 7.6 13 12 13C16.4 13 20 16 20 20"/>
  </svg>
);

const HomeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.5">
    <path d="M3 12L12 3L21 12V21H3V12Z"/>
    <rect x="10" y="15" width="4" height="6"/>
  </svg>
);

const CardIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.5">
    <rect x="2" y="5" width="20" height="14" rx="2"/>
    <line x1="2" y1="10" x2="22" y2="10"/>
  </svg>
);

const PRAYER_ORDER = [
  { key: "fajr", label: "الفجر" },
  { key: "sunrise", label: "الشروق" },
  { key: "dhuhr", label: "الظهر" },
  { key: "asr", label: "العصر" },
  { key: "maghrib", label: "المغرب" },
  { key: "isha", label: "العشاء" },
];

const EVENT_NAMES: Record<string, string> = {
  salary: "الراتب",
  citizen_account: "حساب المواطن",
  housing_support: "الدعم السكني",
};

interface DailyCardPreviewProps {
  message: string;
}

function getCountdownIcon(type: string): ReactNode {
  switch (type) {
    case "salary": return <MoneyIcon />;
    case "citizen_account": return <PersonIcon />;
    case "housing_support": return <HomeIcon />;
    default: return <MoneyIcon />;
  }
}

// Find next prayer
function getNextPrayer(prayers: Record<string, string>, formatTime: (t: string) => string) {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  
  for (const { key } of PRAYER_ORDER) {
    const time = prayers[key];
    if (!time) continue;
    const [h, m] = time.split(":").map(Number);
    const prayerMinutes = h * 60 + m;
    if (prayerMinutes > currentMinutes) {
      return { key, label: PRAYER_ORDER.find(p => p.key === key)?.label || key, time: formatTime(time) };
    }
  }
  // All passed, return first prayer (Fajr tomorrow)
  return { key: "fajr", label: "الفجر", time: formatTime(prayers.fajr) };
}

export default function DailyCardPreview({ message }: DailyCardPreviewProps) {
  const { user } = useStore();
  const { formatTime } = useTimeFormat();
  const todayIso = getRiyadhTodayKey();
  const cityKey = normalizeCityKey(user.city) ?? "riyadh";
  const cityName = getCityName(cityKey);

  const { data: officialPrayer } = useOfficialPrayerTimes(cityKey, todayIso);
  const { data: officialFinancial } = useOfficialFinancialDates();
  const { data: fallbackPrayer } = useGetPrayerTimes({ city: cityName });
  const { data: fallbackCountdowns } = useGatewayFinancialCountdown();

  // Greeting based on time
  const greeting = useMemo(() => {
    const saudiHour = getRiyadhDateParts().hour;
    return saudiHour < 12 ? "صباح الخير" : "مساء الخير";
  }, []);

  const prayers = useMemo(() => {
    if (officialPrayer) {
      return {
        fajr: officialPrayer.fajr_time,
        sunrise: officialPrayer.sunrise_time,
        dhuhr: officialPrayer.dhuhr_time,
        asr: officialPrayer.asr_time,
        maghrib: officialPrayer.maghrib_time,
        isha: officialPrayer.isha_time,
      };
    }
    return {
      fajr: fallbackPrayer?.fajr ?? "04:03",
      sunrise: fallbackPrayer?.sunrise ?? "05:29",
      dhuhr: fallbackPrayer?.dhuhr ?? "12:18",
      asr: fallbackPrayer?.asr ?? "15:48",
      maghrib: fallbackPrayer?.maghrib ?? "18:49",
      isha: fallbackPrayer?.isha ?? "20:19",
    };
  }, [officialPrayer, fallbackPrayer]);

  const nextPrayer = useMemo(() => getNextPrayer(prayers, formatTime), [prayers, formatTime]);

  const countdowns = useMemo(() => {
    const computeDays = (dateStr: string): number => {
      const today = new Date();
      const target = new Date(`${dateStr}T12:00:00`);
      return Math.max(0, Math.floor((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
    };

    const result: { key: string; name: string; days: number; icon: ReactNode }[] = [];

    if (Array.isArray(officialFinancial) && officialFinancial.length > 0) {
      officialFinancial.forEach((r: any) => {
        const key = r.event_key ?? "other";
        result.push({
          key,
          name: EVENT_NAMES[key] ?? r.event_name_ar ?? key,
          days: computeDays(r.occurrence_date_gregorian),
          icon: getCountdownIcon(key),
        });
      });
    } else if (Array.isArray(fallbackCountdowns)) {
      fallbackCountdowns.forEach((r: any) => {
        const key = r.type ?? "other";
        result.push({
          key,
          name: EVENT_NAMES[key] ?? r.name ?? key,
          days: r.days_remaining ?? r.days ?? 0,
          icon: getCountdownIcon(key),
        });
      });
    }

    return result.slice(0, 3);
  }, [officialFinancial, fallbackCountdowns]);

  return (
    <div 
      className="relative overflow-hidden rounded-[32px]"
      style={{
        background: "linear-gradient(180deg, #FFFDF9 0%, #FAF3E8 50%, #F5EBD8 100%)",
        border: "1px solid rgba(201,160,99,0.35)",
        boxShadow: "0 25px 70px rgba(138,107,61,0.18), 0 0 50px rgba(201,160,99,0.08) inset",
        width: "100%",
        maxWidth: "380px",
        margin: "0 auto",
      }}
    >
      {/* ===== Decorative Background Layer ===== */}
      {/* Main background pattern */}
      <div 
        className="absolute inset-0 opacity-[0.08] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(135deg, rgba(201,160,99,0.55), rgba(255,255,255,0) 62%), repeating-linear-gradient(45deg, rgba(138,107,61,0.45) 0 1px, transparent 1px 18px)",
          backgroundSize: "auto",
          backgroundPosition: "center",
        }}
      />
      
      {/* Golden corner decorations */}
      <div className="absolute top-0 left-0 w-40 h-40 opacity-10 pointer-events-none" style={{
        background: "radial-gradient(ellipse at 0% 0%, rgba(201,160,99,0.6) 0%, transparent 70%)",
      }} />
      <div className="absolute bottom-0 right-0 w-40 h-40 opacity-10 pointer-events-none" style={{
        background: "radial-gradient(ellipse at 100% 100%, rgba(201,160,99,0.6) 0%, transparent 70%)",
      }} />
      
      {/* Subtle gold lines */}
      <div className="absolute top-0 left-0 right-0 h-[1px] opacity-20" style={{ background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)` }} />
      <div className="absolute bottom-0 left-0 right-0 h-[1px] opacity-20" style={{ background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)` }} />

      {/* ===== Lantern decoration top-left ===== */}
      <div className="absolute top-4 left-4 z-10 opacity-70" style={{ color: GOLD }}>
        <svg width="28" height="36" viewBox="0 0 28 36" fill="currentColor">
          <path d="M14 0L17 5H11L14 0Z" fill="currentColor"/>
          <rect x="10" y="5" width="8" height="2" rx="0.5" fill="currentColor"/>
          <path d="M9 7H19V26C19 28 17 30 14 30C11 30 9 28 9 26V7Z" fill="currentColor" opacity="0.85"/>
          <rect x="11" y="9" width="6" height="18" rx="1.5" fill="#FFFDF9" opacity="0.3"/>
          <rect x="8" y="26" width="12" height="2" rx="0.5" fill="currentColor"/>
          <rect x="7" y="28" width="14" height="3" rx="1" fill="currentColor"/>
          <rect x="12" y="31" width="4" height="3" rx="0.5" fill="currentColor"/>
        </svg>
      </div>

      {/* ===== Main Content ===== */}
      <div className="relative z-10 p-5">
        
        {/* 1. Badge: بطاقة يومية */}
        <div className="text-center mb-4">
          <span 
            className="inline-block px-5 py-2 rounded-full text-xs font-bold tracking-wider"
            style={{
              background: `linear-gradient(135deg, rgba(201,160,99,0.15), rgba(201,160,99,0.25))`,
              color: BROWN,
              border: "1px solid rgba(201,160,99,0.4)",
              boxShadow: "0 2px 8px rgba(201,160,99,0.15)",
            }}
          >
            ✦ بطاقة يومية ✦
          </span>
        </div>

        {/* 2. Logo: مواعيدك */}
        <div className="text-center mb-4">
          <div className="text-3xl mb-1" style={{ color: GOLD }}>✦</div>
          <h1 className="text-[32px] font-extrabold leading-tight tracking-tight" style={{ color: INK }}>
            مواعيدك
          </h1>
          <p className="text-[13px] font-medium mt-1" style={{ color: BROWN }}>
            كل مواعيدك.. في مكان واحد
          </p>
          <div className="h-[1.5px] w-32 mx-auto mt-3" style={{ background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)` }} />
        </div>

        {/* 3. Message Banner with Background Image */}
        <div 
          className="relative rounded-2xl overflow-hidden mb-4 p-4"
          style={{
            border: "1px solid rgba(201,160,99,0.3)",
            boxShadow: "0 4px 15px rgba(138,107,61,0.1)",
          }}
        >
          {/* Background pattern overlay */}
          <div 
            className="absolute inset-0 opacity-[0.15] pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(135deg, rgba(201,160,99,0.55), rgba(255,255,255,0) 62%), repeating-linear-gradient(45deg, rgba(138,107,61,0.45) 0 1px, transparent 1px 18px)",
              backgroundSize: "auto",
              backgroundPosition: "center",
            }}
          />
          {/* Gradient overlay for readability */}
          <div className="absolute inset-0" style={{
            background: "linear-gradient(135deg, rgba(255,253,249,0.95), rgba(250,243,232,0.9))",
          }} />
          
          <div className="relative z-10 text-center">
            <div className="flex justify-center mb-2"><QuoteIcon /></div>
            <div className="text-[15px] font-bold mb-1" style={{ color: BROWN }}>
              {greeting}
            </div>
            <div className="text-[13px] leading-relaxed mb-2" style={{ color: INK }}>
              {message}
            </div>
            <div className="text-[11px] font-medium" style={{ color: GOLD }}>
              واذكروا الله ذكراً كثيراً
            </div>
          </div>
        </div>

        {/* 4. Date Card */}
        <div 
          className="rounded-2xl p-4 mb-4 text-center"
          style={{
            background: "linear-gradient(145deg, #FFFFFF, #FAF7F2)",
            border: "1px solid rgba(201,160,99,0.25)",
            boxShadow: "0 4px 15px rgba(138,107,61,0.08)",
          }}
        >
          <div className="flex justify-center mb-2"><CalIcon /></div>
          <div className="text-[18px] font-extrabold" style={{ color: BROWN }}>
            {getDayName()}
          </div>
          <div className="text-[13px] font-medium mt-1" style={{ color: INK }}>
            {formatHijriDate()} هـ
          </div>
          <div className="text-[13px] font-medium" style={{ color: INK }}>
            {formatGregorianDate()} م
          </div>
        </div>

        {/* 5. Prayer Times Card */}
        <div 
          className="rounded-2xl p-4 mb-4"
          style={{
            background: "linear-gradient(145deg, #FFFFFF, #FAF7F2)",
            border: "1px solid rgba(201,160,99,0.25)",
            boxShadow: "0 4px 15px rgba(138,107,61,0.08)",
          }}
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <PrayerIcon />
            <span className="text-[14px] font-bold" style={{ color: BROWN }}>مواقيت الصلاة</span>
          </div>
          
          <div className="grid grid-cols-6 gap-1">
            {PRAYER_ORDER.map(({ key, label }) => {
              const isNext = nextPrayer.key === key;
              return (
                <div 
                  key={key}
                  className="flex flex-col items-center text-center rounded-xl p-2"
                  style={isNext ? {
                    background: `linear-gradient(135deg, rgba(201,160,99,0.2), rgba(201,160,99,0.1))`,
                    border: "1px solid rgba(201,160,99,0.4)",
                    boxShadow: "0 2px 8px rgba(201,160,99,0.15)",
                  } : {
                    background: "transparent",
                  }}
                >
                  <div 
                    className="w-5 h-5 rounded-full flex items-center justify-center mb-1"
                    style={{ background: isNext ? GOLD : LIGHT_GOLD }}
                  >
                    <span className="text-[8px]" style={{ color: isNext ? "#FFF" : GOLD }}>✦</span>
                  </div>
                  <span className="text-[9px] font-medium" style={{ color: isNext ? BROWN : INK, opacity: isNext ? 1 : 0.7 }}>{label}</span>
                  <span className="text-[10px] font-bold mt-0.5" style={{ color: isNext ? GOLD : BROWN }}>
                    {formatTime(prayers[key as keyof typeof prayers])}
                  </span>
                </div>
              );
            })}
          </div>
          
          {/* Next prayer highlight */}
          {nextPrayer && (
            <div className="mt-3 text-center">
              <span className="text-[11px] font-bold" style={{ color: GOLD }}>
                الصلاة القادمة: {nextPrayer.label} — {nextPrayer.time}
              </span>
            </div>
          )}
        </div>

        {/* 6. Countdown Strip */}
        {countdowns.length > 0 && (
          <div 
            className="rounded-2xl p-4 mb-4"
            style={{
              background: `linear-gradient(135deg, rgba(201,160,99,0.08), rgba(201,160,99,0.15))`,
              border: "1px solid rgba(201,160,99,0.25)",
            }}
          >
            <div className="flex items-center justify-center gap-2 mb-3">
              <ClockIcon />
              <span className="text-[13px] font-bold" style={{ color: BROWN }}>كم باقي على</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {countdowns.map((item, i) => (
                <div 
                  key={i}
                  className="rounded-xl p-3 text-center"
                  style={{
                    background: "linear-gradient(145deg, #FFFFFF, #FAF7F2)",
                    border: "1px solid rgba(201,160,99,0.2)",
                    boxShadow: "0 3px 10px rgba(138,107,61,0.08)",
                  }}
                >
                  <div className="flex justify-center mb-1.5">{item.icon}</div>
                  <div className="text-[10px] font-medium truncate" style={{ color: INK }}>{item.name}</div>
                  <div className="text-[22px] font-extrabold leading-none mt-1" style={{ color: GOLD }}>{item.days}</div>
                  <div className="text-[9px] opacity-60 mt-0.5" style={{ color: INK }}>يوم</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7. Footer Signature */}
        <div className="text-center pt-2 pb-1">
          <div className="h-[1.5px] w-full mb-4" style={{ background: `linear-gradient(90deg, transparent, rgba(201,160,99,0.4), transparent)` }} />
          <div className="text-[16px] font-extrabold tracking-wider" style={{ color: GOLD }}>
            ✦ مواعيدك ✦
          </div>
          <div className="text-[10px] opacity-60 mt-1.5" style={{ color: INK }}>
            منصة تجمع وقتك، راتبك، دعمك، وأهم مواعيدك
          </div>
        </div>
      </div>
    </div>
  );
}

