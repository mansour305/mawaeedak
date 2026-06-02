import { CalendarDays, Clock3, Home, Landmark, Moon, Sun, Sunrise, Users, Wallet } from "lucide-react";
import { Link } from "wouter";
import desertHeroImg from "@assets/desert-hero.png";
import { AppShell } from "@/components/layout/AppShell";
import { useGetPrayerTimes } from "@workspace/api-client-react";
import { useGatewayFinancialCountdown } from "@/hooks/useGatewayData";
import { useStore } from "@/hooks/useStore";
import { formatGregorianDate, formatHijriDate, getDayName } from "@/lib/utils";
import { useOfficialPrayerTimes, useOfficialFinancialDates } from "@/hooks/useOfficialData";
import { useMemo, useState, useEffect } from "react";

const GOLD = "#C9A063";
const BROWN = "#8A6B3D";
const INK = "#2F2B25";

function currentGreeting() {
  const hour = new Date().getHours();
  return hour < 12 ? "صباح الخير" : "مساء الخير";
}

function PrayerIcon({ keyName }: { keyName: string }) {
  if (keyName === "fajr" || keyName === "isha") return <Moon className="h-6 w-6" />;
  if (keyName === "sunrise" || keyName === "maghrib") return <Sunrise className="h-6 w-6" />;
  return <Sun className="h-6 w-6" />;
}

/**
 * HomePage shows today's prayer times, a greeting hero section, and a list of
 * upcoming financial events. It prefers official prayer and financial data
 * fetched via Supabase. When official data is unavailable, it falls back
 * to the existing gateway services. This ensures accurate and reliable
 * information for users while maintaining backward compatibility.
 */
export default function HomePage() {
  const { user } = useStore();
  // Determine city: if user.city is not set or contains placeholder, default to Riyadh
  const cityName = user.city && !user.city.includes("ط") ? user.city : "الرياض";
  const { data: fallbackPrayerData } = useGetPrayerTimes({ city: cityName });
  // Determine city key for official data. Use Arabic city name simplified by replacing spaces
  const cityKey = cityName.trim().toLowerCase().replace(/\s+/g, "_");
  const todayIso = new Date().toISOString().split("T")[0];
  // Fetch official prayer times
  const { data: officialPrayer } = useOfficialPrayerTimes(cityKey, todayIso);
  // Fetch financial events: official and fallback
  const { data: officialFinancial } = useOfficialFinancialDates();
  const { data: gatewayFinancial, isLoading: isFinancialLoading } = useGatewayFinancialCountdown();

  // Map prayer times: prefer official if available
  const prayers = useMemo(() => {
    const times: Record<string, string> = {};
    if (officialPrayer) {
      times.fajr = officialPrayer.fajr_time;
      times.sunrise = officialPrayer.sunrise_time;
      times.dhuhr = officialPrayer.dhuhr_time;
      times.asr = officialPrayer.asr_time;
      times.maghrib = officialPrayer.maghrib_time;
      times.isha = officialPrayer.isha_time;
    } else {
      // fallback values from gateway
      times.fajr = fallbackPrayerData?.fajr ?? "04:03";
      times.sunrise = fallbackPrayerData?.sunrise ?? "05:29";
      times.dhuhr = fallbackPrayerData?.dhuhr ?? "12:18";
      times.asr = fallbackPrayerData?.asr ?? "15:48";
      times.maghrib = fallbackPrayerData?.maghrib ?? "18:49";
      times.isha = fallbackPrayerData?.isha ?? "20:19";
    }
    return [
      { key: "fajr", label: "الفجر", time: times.fajr },
      { key: "sunrise", label: "الشروق", time: times.sunrise },
      { key: "dhuhr", label: "الظهر", time: times.dhuhr },
      { key: "asr", label: "العصر", time: times.asr },
      { key: "maghrib", label: "المغرب", time: times.maghrib },
      { key: "isha", label: "العشاء", time: times.isha },
    ];
  }, [officialPrayer, fallbackPrayerData]);

  // Compute financial items: prefer official records
  const finance = useMemo(() => {
    // helper to compute days remaining
    const computeDays = (dateStr: string) => {
      const today = new Date();
      const target = new Date(`${dateStr}T12:00:00`);
      const diffMs = target.getTime() - today.getTime();
      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      return days >= 0 ? days : 0;
    };
    if (Array.isArray(officialFinancial) && officialFinancial.length > 0) {
      return officialFinancial.map((record: any) => {
        const nextDate = record.occurrence_date_gregorian as string;
        return {
          id: record.id ?? record.event_key,
          name: record.event_name_ar ?? record.event_key,
          type: record.event_key ?? "",
          next_date: nextDate,
          days_remaining: computeDays(nextDate),
        };
      }).slice(0, 4);
    }
    return Array.isArray(gatewayFinancial) ? gatewayFinancial.slice(0, 4) : [];
  }, [officialFinancial, gatewayFinancial]);

  // State to keep track of the next prayer and the countdown to it.  We update
  // these values every second in a side effect below.  The next prayer is
  // determined by scanning today's prayer times for the first one that is
  // still upcoming; if all prayers today have passed, the next prayer is
  // tomorrow's fajr.
  const [nextPrayer, setNextPrayer] = useState<{
    key: string;
    label: string;
    time: string;
  } | null>(null);
  const [countdown, setCountdown] = useState<string>("");

  useEffect(() => {
    function computeNext() {
      const now = new Date();
      // Build an array of Date objects representing each prayer time today.
      const upcoming = prayers.map((p) => {
        // Parse HH:MM into a Date object.  Assume times are for the current day
        const [h, m] = p.time.split(":");
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate(), Number(h), Number(m), 0);
        return { prayer: p, date: d };
      });
      // Find the first prayer time that is still in the future.
      let next = upcoming.find((item) => item.date.getTime() > now.getTime());
      // If none are remaining today, schedule the next day’s fajr.
      if (!next) {
        const fajr = prayers.find((p) => p.key === "fajr")!;
        const [h, m] = fajr.time.split(":");
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, Number(h), Number(m), 0);
        next = { prayer: fajr, date: d };
      }
      setNextPrayer(next!.prayer);
      // Compute countdown string (hh:mm:ss) for the difference between target and now.
      const diff = next!.date.getTime() - now.getTime();
      const totalSeconds = Math.max(0, Math.floor(diff / 1000));
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      // Pad with leading zeros and assemble string.
      const pad = (n: number) => String(n).padStart(2, "0");
      setCountdown(`${pad(hours)}:${pad(minutes)}:${pad(seconds)}`);
    }
    // Compute immediately and then every second.
    computeNext();
    const id = setInterval(computeNext, 1000);
    return () => clearInterval(id);
  }, [prayers]);

  const name = user.name && !user.name.includes("ط") ? user.name.split(" ")[0] : "أحمد";

  return (
    <AppShell>
      <section className="space-y-5">
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
          <img src={desertHeroImg} alt="هوية مواعيدك المعمارية" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-l from-[#FAF7F2]/95 via-[#FAF7F2]/72 to-transparent" />
          <div className="absolute inset-y-0 right-0 flex w-[62%] flex-col justify-center px-5 text-right">
            <h3 className="text-[30px] font-extrabold leading-tight" style={{ color: INK }}>
              {currentGreeting()} يا {name}
            </h3>
            <p className="mt-4 text-[16px] font-semibold leading-8" style={{ color: "#5D554A" }}>
              ابدأ يومك بنية طيبة، وتوكل على الله في كل خطوة.
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
          <div className="grid grid-cols-6 overflow-hidden rounded-[18px] border" style={{ borderColor: "rgba(201,160,99,0.18)" }}>
            {prayers.map((prayer) => {
              // Highlight the next upcoming prayer cell.
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
                  <span className="text-[14px] font-bold" dir="ltr">{prayer.time}</span>
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
            {/* Display upcoming prayer label and live countdown; falls back to placeholders if unavailable. */}
            الصلاة القادمة: {nextPrayer?.label ?? "—"} • متبقي {countdown || "--:--:--"}
          </div>
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
                اربط قاعدة البيانات أو أضف المواعيد من لوحة المالك لعرضها هنا.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {finance.map((item: any) => {
                const itemName = String(item.name);
                const isHousing = itemName.includes("سكن");
                const Icon = item.type === "salary" ? Wallet : isHousing ? Home : Users;
                return (
                  <Link key={item.id} href="/salaries">
                    <article className="min-h-[148px] rounded-[22px] border bg-[#FFFCF7] p-4 text-center" style={{ borderColor: "rgba(201,160,99,0.24)" }}>
                      <Icon className="mx-auto h-6 w-6" style={{ color: GOLD }} />
                      <h4 className="mt-2 text-[15px] font-extrabold" style={{ color: INK }}>{itemName}</h4>
                      <p className="mt-1 text-xs font-semibold" style={{ color: "#6F6557" }}>{item.next_date}</p>
                      <p className="mt-2 text-[38px] font-extrabold leading-none" style={{ color: BROWN }}>{item.days_remaining}</p>
                      <p className="mt-1 text-sm font-bold" style={{ color: "#6F6557" }}>يوماً متبقياً</p>
                    </article>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </section>
    </AppShell>
  );
}