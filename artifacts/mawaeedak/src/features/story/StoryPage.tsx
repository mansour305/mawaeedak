import { useState, useEffect, useMemo } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useOfficialPrayerTimes, useOfficialFinancialDates } from "@/hooks/useOfficialData";
import { useGetPrayerTimes } from "@workspace/api-client-react";
import { useGatewayFinancialCountdown } from "@/hooks/useGatewayData";
import { useStore } from "@/hooks/useStore";
import { formatHijriDate, formatGregorianDate, getDayName } from "@/lib/utils";
import { Copy, Share2, Save, CheckCircle2, Loader2 } from "lucide-react";
import { useTimeFormat } from "@/hooks/useTimeFormat";

const BG_BROWN = "#5C3D11";
const GOLD = "#D4AF37";
const CREAM = "#FFF8E7";
const DARK_GOLD = "#B8860B";

const PRAYER_KEYS: [string, string][] = [
  ["الفجر", "fajr"],
  ["الشروق", "sunrise"],
  ["الظهر", "dhuhr"],
  ["العصر", "asr"],
  ["المغرب", "maghrib"],
  ["العشاء", "isha"],
];

const EVENT_ICONS: Record<string, string> = {
  salary: "💰",
  support: "👨‍👩‍👧",
  bill: "📄",
  housing: "🏠",
  other: "📅",
};

const STORAGE_KEY_STORY = "mawaeedak_story_v1";

export default function StoryPage() {
  const { toast } = useToast();
  const { user } = useStore();
  const { formatTime } = useTimeFormat();
  const todayIso = new Date().toISOString().split("T")[0];
  const cityName = user.city || "الرياض";
  const cityKey = cityName.trim().toLowerCase().replace(/\s+/g, "_");

  const { data: officialPrayer } = useOfficialPrayerTimes(cityKey, todayIso);
  const { data: officialFinancial } = useOfficialFinancialDates();
  const { data: fallbackPrayer } = useGetPrayerTimes({ city: cityName });
  const { data: fallbackCountdowns } = useGatewayFinancialCountdown();

  const [customMessage, setCustomMessage] = useState("");
  const [showDate, setShowDate] = useState(true);
  const [showMessage, setShowMessage] = useState(true);
  const [showCountdowns, setShowCountdowns] = useState(true);
  const [showPrayer, setShowPrayer] = useState(true);
  const [savedOk, setSavedOk] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Prayer times - prefer official
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

  // Financial countdown - prefer official
  const countdowns = useMemo(() => {
    const computeDays = (dateStr: string): number => {
      const today = new Date();
      const target = new Date(`${dateStr}T12:00:00`);
      return Math.max(0, Math.floor((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
    };
    if (Array.isArray(officialFinancial) && officialFinancial.length > 0) {
      return officialFinancial.map((r: any) => ({
        name: r.event_name_ar ?? r.event_key,
        days: computeDays(r.occurrence_date_gregorian),
        type: r.event_key ?? "other",
      })).slice(0, 5);
    }
    return Array.isArray(fallbackCountdowns) ? fallbackCountdowns.slice(0, 5) : [];
  }, [officialFinancial, fallbackCountdowns]);

  // Load saved preferences
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_STORY);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.showDate !== undefined) setShowDate(data.showDate);
        if (data.showMessage !== undefined) setShowMessage(data.showMessage);
        if (data.showCountdowns !== undefined) setShowCountdowns(data.showCountdowns);
        if (data.showPrayer !== undefined) setShowPrayer(data.showPrayer);
        if (data.customMessage) setCustomMessage(data.customMessage);
      }
    } catch {}
  }, []);

  const handleSave = () => {
    const data = { showDate, showMessage, showCountdowns, showPrayer, customMessage };
    localStorage.setItem(STORAGE_KEY_STORY, JSON.stringify(data));
    setSavedOk(true);
    toast({ title: "تم حفظ إعدادات الستوري" });
    setTimeout(() => setSavedOk(false), 2000);
  };

  const handleCopy = async () => {
    setIsLoading(true);
    try {
      const lines = [
        "✨ مواعيدك ✨",
        getDayName(),
        `📅 هجري: ${formatHijriDate()}`,
        `📆 ميلادي: ${formatGregorianDate()}`,
      ];
      if (showMessage && customMessage.trim()) {
        lines.push(`💡 ${customMessage.trim()}`);
      }
      if (showCountdowns && countdowns.length > 0) {
        lines.push("");
        lines.push("⏳ كم باقي على:");
        countdowns.forEach((c: any) => {
          lines.push(`${EVENT_ICONS[c.type] ?? "📅"} ${c.name} 🔻 ${c.days} يوم`);
        });
      }
      if (showPrayer) {
        lines.push("");
        lines.push("🕌 مواقيت الصلاة:");
        PRAYER_KEYS.forEach(([label, key]) => {
          lines.push(`${label}: ${formatTime(prayers[key as keyof typeof prayers])}`);
        });
      }
      lines.push("");
      lines.push("مواعيدك - جميع الحقوق محفوظة ©");
      await navigator.clipboard.writeText(lines.join("\n"));
      toast({ title: "تم نسخ الستوري" });
    } catch {
      toast({ title: "فشل النسخ", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    setIsLoading(true);
    try {
      if (navigator.share) {
        await navigator.share({
          title: "ستوري مواعيدك",
          text: `✨ مواعيدك - ${getDayName()}`,
          url: window.location.origin,
        });
      } else {
        await handleCopy();
      }
    } catch {}
    setIsLoading(false);
  };

  return (
    <AppShell title="ستوري اليوم">
      <div className="space-y-5">
        {/* الستوري المرئي */}
        <Card
          className="overflow-hidden"
          style={{
            background: BG_BROWN,
            border: `2px solid ${GOLD}`,
            borderRadius: "20px",
            boxShadow: `0 20px 50px rgba(92,61,17,0.35), 0 0 30px rgba(212,175,55,0.15) inset`,
          }}
        >
          <CardContent className="p-5 space-y-4" style={{ color: CREAM }}>
            {/* الشعار */}
            <div className="text-center">
              <div className="text-3xl mb-1" style={{ color: GOLD }}>✦</div>
              <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: CREAM }}>
                مواعيدك
              </h1>
              <div className="h-[2px] w-24 mx-auto mt-2" style={{ background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)` }} />
            </div>

            {/* التاريخ */}
            {showDate && (
              <div className="text-center space-y-1">
                <div className="text-lg font-extrabold" style={{ color: GOLD }}>
                  {getDayName()}
                </div>
                <div className="flex justify-center gap-4 text-sm font-bold">
                  <span>📅 {formatHijriDate()}</span>
                  <span>📆 {formatGregorianDate()}</span>
                </div>
              </div>
            )}

            {/* رسالة اليوم */}
            {showMessage && customMessage.trim() && (
              <div
                className="rounded-xl border p-3 text-center"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  borderColor: "rgba(212,175,55,0.25)",
                }}
              >
                <p className="text-sm font-medium leading-relaxed" style={{ color: CREAM }}>
                  {customMessage}
                </p>
              </div>
            )}

            {/* العدادات المالية */}
            {showCountdowns && countdowns.length > 0 && (
              <div
                className="rounded-xl border p-3"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  borderColor: "rgba(212,175,55,0.18)",
                }}
              >
                <div className="text-center text-xs font-bold mb-2" style={{ color: GOLD }}>
                  ⏳ كم باقي على:
                </div>
                <div className="space-y-1.5">
                  {countdowns.map((c: any, i: number) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-xs font-medium" style={{ color: CREAM }}>
                        {EVENT_ICONS[c.type] ?? "📅"} {c.name}
                      </span>
                      <span className="shrink-0 text-xs font-extrabold" style={{ color: GOLD }}>
                        {c.days} يوم
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {showCountdowns && countdowns.length === 0 && (
              <div className="rounded-xl border p-3 text-center" style={{ borderColor: "rgba(212,175,55,0.15)" }}>
                <p className="text-xs opacity-60">لا توجد مواعيد مالية حالياً</p>
              </div>
            )}

            {/* مواقيت الصلاة */}
            {showPrayer && (
              <div
                className="rounded-xl border p-3"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  borderColor: "rgba(212,175,55,0.18)",
                }}
              >
                <div className="text-center text-xs font-bold mb-2" style={{ color: GOLD }}>
                  🕌 مواقيت الصلاة
                </div>
                <div className="grid grid-cols-3 gap-x-2 gap-y-1">
                  {PRAYER_KEYS.map(([label, key]) => (
                    <div key={key} className="flex flex-col items-center">
                      <span className="text-[10px] opacity-60">{label}</span>
                      <span className="text-[11px] font-bold" style={{ color: CREAM }}>
                        {formatTime(prayers[key as keyof typeof prayers])}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* الفوتر */}
            <div className="mt-auto pt-1">
              <div className="h-[1px] w-32 mx-auto mb-2" style={{ background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)` }} />
              <div className="text-center text-[10px] font-extrabold tracking-wider" style={{ color: GOLD }}>
                مواعيدك
              </div>
              <div className="text-center text-[8px] opacity-50 mt-0.5">
                جميع الحقوق محفوظة © {new Date().getFullYear()}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* رسالة اليوم */}
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold text-foreground">رسالة اليوم</Label>
          <Textarea
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            rows={2}
            className="resize-none rounded-xl text-sm font-medium"
            placeholder="اكتب رسالة الستوري..."
            dir="rtl"
          />
        </div>

        {/* عناصر الستوري */}
        <div
          className="rounded-2xl border p-4 space-y-3"
          style={{
            background: "linear-gradient(145deg, #FFFBF4, #F3E8D6)",
            borderColor: "rgba(201,160,99,0.22)",
          }}
        >
          <p className="text-sm font-bold text-foreground">عناصر الستوري</p>
          <div className="flex items-center justify-between">
            <Label htmlFor="sw-date" className="cursor-pointer text-sm">التاريخ</Label>
            <Switch id="sw-date" checked={showDate} onCheckedChange={setShowDate} />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="sw-msg" className="cursor-pointer text-sm">الرسالة</Label>
            <Switch id="sw-msg" checked={showMessage} onCheckedChange={setShowMessage} />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="sw-cd" className="cursor-pointer text-sm">العدادات المالية</Label>
            <Switch id="sw-cd" checked={showCountdowns} onCheckedChange={setShowCountdowns} />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="sw-pr" className="cursor-pointer text-sm">مواقيت الصلاة</Label>
            <Switch id="sw-pr" checked={showPrayer} onCheckedChange={setShowPrayer} />
          </div>
        </div>

        {/* أزرار التحكم */}
        <div className="grid grid-cols-3 gap-2">
          <Button className="h-12 rounded-xl text-sm font-bold" onClick={handleCopy} disabled={isLoading}>
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Copy className="w-4 h-4 ml-1" />}
            نسخ
          </Button>
          <Button variant="outline" className="h-12 rounded-xl text-sm font-bold" onClick={handleShare} disabled={isLoading}>
            <Share2 className="w-4 h-4 ml-1" />
            مشاركة
          </Button>
          <Button
            variant="outline"
            className={`h-12 rounded-xl text-sm font-bold ${savedOk ? "border-emerald-500 bg-emerald-50 text-emerald-600" : ""}`}
            onClick={handleSave}
          >
            {savedOk ? <CheckCircle2 className="w-4 h-4 ml-1" /> : <Save className="w-4 h-4 ml-1" />}
            {savedOk ? "محفوظ" : "حفظ"}
          </Button>
        </div>
      </div>
    </AppShell>
  );
}

