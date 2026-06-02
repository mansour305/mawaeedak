import { useState, useEffect, useCallback, useMemo } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useGetTodayMessage, useGetPrayerTimes } from "@workspace/api-client-react";
import { useGatewayStoryTemplates, useGatewayFinancialCountdown } from "@/hooks/useGatewayData";
import { useLocationPrefs } from "@/hooks/useLocationPrefs";
import { useStore } from "@/hooks/useStore";
import { formatHijriDate, formatGregorianDate, getDayName } from "@/lib/utils";
import {
  Copy,
  Share2,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Zap,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
// New: import official data hooks to prefer confirmed records
import { useOfficialPrayerTimes, useOfficialFinancialDates } from "@/hooks/useOfficialData";

const EVENT_EMOJI: Record<string, string> = {
  salary: "\uD83D\uDCBC",
  support: "\uD83D\uDC68\u200D\uD83D\uDC69\u200D\uD83D\uDC67",
  bill: "\uD83D\uDCC4",
  other: "\uD83C\uDFC0",
};

const NAME_HASHTAG: Record<string, string> = {
  "الراتب الشهري": "#الراتب",
  "الراتب": "#الراتب",
  "الضمان الاجتماعي": "#الضمان",
  "حساب المواطن": "#حساب_المواطن",
  "التقاعد": "#التقاعد",
  "حافز": "#حافز",
  "الدعم السكني": "#الدعم_السكني",
  "ساند": "#ساند",
  "التأمينات": "#التأمينات",
  "الدعم الزراعي": "#الدعم_الزراعي",
  "التأهيل": "#التأهيل",
};

function resolveHashtag(name: string): string {
  for (const key of Object.keys(NAME_HASHTAG)) {
    if (name.includes(key)) return NAME_HASHTAG[key];
  }
  return `#${name.replace(/\s+/g, "_")}`;
}

const STORAGE_KEY = "mawaeedak_story_v1";

interface StorySave {
  customMessage: string;
  showDate: boolean;
  showMessage: boolean;
  showCountdowns: boolean;
  showPrayer: boolean;
  templateId: number;
}

const PRAYER_LABELS: Record<string, string> = {
  fajr: "الفجر",
  sunrise: "الشروق",
  dhuhr: "الظهر",
  asr: "العصر",
  maghrib: "المغرب",
  isha: "العشاء",
};

/**
 * StoryPage shows a shareable daily story. This implementation prefers
 * official data sources (financial dates and prayer times) when available,
 * and falls back to existing gateway services otherwise. Users can toggle
 * various elements of the story and save their preferences locally.
 */
export default function StoryPage() {
  const { toast } = useToast();
  const { user } = useStore();
  const { prefs: locPrefs } = useLocationPrefs();
  const currentYear = new Date().getFullYear();

  const prayerCity = locPrefs.source !== "default" ? locPrefs.city : user.city || "الرياض";

  const {
    data: messageData,
    isLoading: msgLoading,
    isError: msgError,
  } = useGetTodayMessage();

  // Fallback countdowns from gateway
  const {
    data: countdowns,
    isLoading: cdLoading,
    isError: cdError,
  } = useGatewayFinancialCountdown();

  // Fallback prayer times from gateway
  const { data: fallbackPrayerData } = useGetPrayerTimes({ city: prayerCity });

  // Determine city key and date for official data queries
  const cityKey = prayerCity.trim().toLowerCase().replace(/\s+/g, "_");
  const todayIso = new Date().toISOString().split("T")[0];

  // Fetch official prayer times and financial events
  const { data: officialPrayer } = useOfficialPrayerTimes(cityKey, todayIso);
  const { data: officialFinancial } = useOfficialFinancialDates();

  const { data: templates, isLoading: tplLoading } = useGatewayStoryTemplates();

  const [customMessage, setCustomMessage] = useState("");
  const [messageSet, setMessageSet] = useState(false);
  const [showDate, setShowDate] = useState(true);
  const [showMessage, setShowMessage] = useState(true);
  const [showCountdowns, setShowCountdowns] = useState(true);
  const [showPrayer, setShowPrayer] = useState(true);
  const [templateId, setTemplateId] = useState(1);
  const [savedOk, setSavedOk] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;

      const saved: Partial<StorySave> = JSON.parse(raw);

      if (saved.showDate !== undefined) setShowDate(saved.showDate);
      if (saved.showMessage !== undefined) setShowMessage(saved.showMessage);
      if (saved.showCountdowns !== undefined) setShowCountdowns(saved.showCountdowns);
      if (saved.showPrayer !== undefined) setShowPrayer(saved.showPrayer);
      if (saved.templateId) setTemplateId(saved.templateId);

      if (saved.customMessage) {
        setCustomMessage(saved.customMessage);
        setMessageSet(true);
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    if (!messageSet && messageData?.message) {
      setCustomMessage(messageData.message);
      setMessageSet(true);
    }
  }, [messageData, messageSet]);

  const activeTemplates = templates?.filter((template) => template.is_active) ?? [];
  const activeTemplate = activeTemplates.find((template) => template.id === templateId) ?? activeTemplates[0];

  const bgColor = activeTemplate?.background_color ?? "#5C3D11";
  const textColor = activeTemplate?.text_color ?? "#FFF8E7";

  // Compute safe countdowns: prefer official confirmed records with days_remaining
  const safeCountdowns = useMemo(() => {
    // helper to compute days remaining from today to a target date (YYYY-MM-DD)
    const computeDaysRemaining = (dateStr: string): number => {
      const today = new Date();
      const target = new Date(`${dateStr}T12:00:00`);
      const diffMs = target.getTime() - today.getTime();
      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      return days >= 0 ? days : 0;
    };
    if (Array.isArray(officialFinancial) && officialFinancial.length > 0) {
      return officialFinancial.map((record: any) => ({
        id: record.id ?? record.event_key,
        name: record.event_name_ar ?? record.event_key,
        type: record.event_key ?? "",
        days_remaining: computeDaysRemaining(record.occurrence_date_gregorian as string),
      }));
    }
    return Array.isArray(countdowns) ? countdowns : [];
  }, [officialFinancial, countdowns]);

  // Determine prayer data: prefer official if available, else fallback
  const prayerData = useMemo(() => {
    if (officialPrayer) {
      return {
        city: officialPrayer.city_name_ar ?? prayerCity,
        fajr: officialPrayer.fajr_time,
        sunrise: officialPrayer.sunrise_time,
        dhuhr: officialPrayer.dhuhr_time,
        asr: officialPrayer.asr_time,
        maghrib: officialPrayer.maghrib_time,
        isha: officialPrayer.isha_time,
      };
    }
    return fallbackPrayerData;
  }, [officialPrayer, fallbackPrayerData, prayerCity]);

  const generateStoryText = useCallback((): string => {
    const parts: string[] = [];

    if (showDate) {
      parts.push(
        `\uD83D\uDCCD تاريخ اليوم\n\uD83D\uDCC5 ${getDayName()}\n\uD83C\uDF19 هجري: ${formatHijriDate()}\n\uD83D\uDCCB ميلادي: ${formatGregorianDate()}`
      );
    }

    if (showMessage && customMessage.trim()) {
      parts.push(`\uD83D\uDCA1 ${customMessage.trim()}`);
    }

    if (showCountdowns && safeCountdowns.length > 0) {
      const lines = ["⏳ كم باقي على:"];
      safeCountdowns.forEach((item: any) => {
        const emoji = EVENT_EMOJI[item.type] ?? "\uD83D\uDCCD";
        const hashtag = resolveHashtag(item.name);
        lines.push(`${emoji} ${hashtag} 🔻 ${item.days_remaining} يوم`);
      });
      parts.push(lines.join("\n"));
    }

    if (showPrayer && prayerData) {
      parts.push(
        `\uD83C\uDFE0 مواقيت الصلاة — ${prayerData.city ?? prayerCity}\n` +
          `الفجر: ${prayerData.fajr}  الشروق: ${prayerData.sunrise}  الظهر: ${prayerData.dhuhr}\n` +
          `العصر: ${prayerData.asr}  المغرب: ${prayerData.maghrib}  العشاء: ${prayerData.isha}`
      );
    }

    parts.push("━━━━━━━━━━━━━━\nمواعيدك\nمنصة تجمع وقتك، راتبك، دعمك، وأهم مواعيدك.");

    return parts.join("\n\n━━━━━━━━━━━━━━\n\n");
  }, [showDate, showMessage, showCountdowns, showPrayer, customMessage, safeCountdowns, prayerData, prayerCity]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generateStoryText());
      toast({ title: "تم النسخ", description: "نُسخ محتوى الستوري بنجاح" });
    } catch {
      toast({ title: "خطأ", description: "تعذّر النسخ، حاول مجدداً", variant: "destructive" });
    }
  };

  const handleShare = async () => {
    const text = generateStoryText();

    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: "ستوري اليوم — مواعيدك", text });
        toast({ title: "تمت المشاركة" });
        return;
      } catch {
        return;
      }
    }

    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "تم النسخ",
        description: "المشاركة المباشرة غير متاحة في هذا المتصفح — تم نسخ النص بدلاً",
      });
    } catch {
      toast({ title: "خطأ", description: "تعذّرت المشاركة والنسخ", variant: "destructive" });
    }
  };

  const handleSave = () => {
    const save: StorySave = {
      customMessage,
      showDate,
      showMessage,
      showCountdowns,
      showPrayer,
      templateId,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(save));
    setSavedOk(true);
    setTimeout(() => setSavedOk(false), 2500);
    toast({ title: "تم الحفظ", description: "ستُستعاد إعداداتك عند العودة للصفحة" });
  };

  const isLoading = msgLoading || cdLoading || tplLoading;
  const hasError = msgError || cdError;

  return (
    <AppShell title="ستوري اليوم">
      <div className="space-y-5 pb-4">
        <div className="px-2 text-center">
          <h2 className="mb-1 text-xl font-bold text-foreground">شارك يومك</h2>
          <p className="text-sm text-muted-foreground">
            محتوى جاهز للمشاركة في حالات الواتساب والسناب شات.
          </p>
        </div>

        {!tplLoading && activeTemplates.length > 1 && (
          <div className="flex flex-wrap justify-center gap-2">
            {activeTemplates.map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => setTemplateId(template.id)}
                className={`rounded-xl border px-4 py-1.5 text-sm font-semibold transition-all ${
                  templateId === template.id
                    ? "border-[hsl(var(--gold))] bg-[hsl(var(--gold)/0.08)] text-[hsl(var(--gold))]"
                    : "border-border text-muted-foreground hover:border-[hsl(var(--gold)/0.4)]"
                }`}
              >
                {template.name}
              </button>
            ))}
          </div>
        )}

        <div className="flex justify-center">
          <Badge
            variant="outline"
            className="gap-1.5 border-[hsl(var(--gold)/0.4)] bg-[hsl(var(--gold)/0.06)] text-[11px] text-[hsl(var(--gold-muted))]"
          >
            <Zap className="h-3 w-3" />
            مُنشأ تلقائياً · {getDayName()} {new Date().toLocaleDateString("ar-SA-u-ca-gregory", { day: "numeric", month: "short" })}
          </Badge>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-14">
            <Loader2 className="h-7 w-7 animate-spin" style={{ color: "hsl(var(--gold))" }} />
          </div>
        ) : hasError ? (
          <div className="flex flex-col items-center gap-2 py-10 text-muted-foreground">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <p className="text-sm">تعذّر تحميل بيانات الستوري. حاول تحديث الصفحة.</p>
          </div>
        ) : (
          <Card
            className="relative mx-auto flex aspect-[9/16] max-w-[280px] flex-col overflow-hidden border-card-border shadow-xl"
            style={{
              background: `linear-gradient(165deg, ${bgColor} 0%, color-mix(in srgb, ${bgColor} 60%, #1a0e05) 100%)`,
            }}
          >
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background: "radial-gradient(ellipse 70% 40% at 50% 20%, rgba(212,175,55,0.20) 0%, transparent 65%)",
              }}
            />
            <CardContent className="relative z-10 flex flex-1 flex-col justify-center gap-3 p-5">
              {showDate && (
                <div className="space-y-0.5 text-center">
                  <div className="text-lg font-extrabold" style={{ color: "hsl(var(--nav-active))" }}>
                    {getDayName()}
                  </div>
                  <div className="text-[12px] font-semibold" style={{ color: textColor }}>
                    {formatHijriDate()}
                  </div>
                    <div className="text-[11px] opacity-70" style={{ color: textColor }}>
                      {formatGregorianDate()}
                    </div>
                  </div>
                )}

              {showDate && <div className="gold-divider" />}

              {showMessage && customMessage.trim() && (
                <div
                  className="rounded-xl border p-3 text-center"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    borderColor: "rgba(212,175,55,0.22)",
                  }}
                >
                  <p className="text-[11px] font-semibold leading-relaxed" style={{ color: textColor }}>
                    {customMessage}
                  </p>
                </div>
              )}

              {showCountdowns && safeCountdowns.length > 0 && (
                <div
                  className="rounded-xl border p-3"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    borderColor: "rgba(212,175,55,0.15)",
                  }}
                >
                  <div className="mb-2 text-center text-[10px] font-bold" style={{ color: "hsl(var(--nav-active))" }}>
                    ⏳ كم باقي على:
                  </div>
                  <div className="space-y-1.5">
                    {safeCountdowns.map((item: any) => (
                      <div key={item.id} className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-medium" style={{ color: textColor }}>
                          {EVENT_EMOJI[item.type] ?? "\uD83D\uDCCD"} {item.name}
                        </span>
                        <span className="shrink-0 text-[11px] font-extrabold" style={{ color: "hsl(var(--nav-active))" }}>
                          {item.days_remaining} يوم
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {showCountdowns && safeCountdowns.length === 0 && (
                <div
                  className="rounded-xl border p-3 text-center"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    borderColor: "rgba(212,175,55,0.15)",
                    color: textColor,
                  }}
                >
                  <p className="text-[10px] font-semibold opacity-75">
                    لا توجد مواعيد مالية مؤكدة حالياً.
                  </p>
                </div>
              )}

              {showPrayer && prayerData && (
                <div
                  className="rounded-xl border p-2"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    borderColor: "rgba(212,175,55,0.15)",
                  }}
                >
                  <div className="mb-1.5 text-center text-[9px] font-bold" style={{ color: "hsl(var(--nav-active))" }}>
                    🕌 مواقيت الصلاة
                  </div>
                  <div className="grid grid-cols-3 gap-x-2 gap-y-0.5">
                    {([
                      ["fajr", prayerData.fajr],
                      ["sunrise", prayerData.sunrise],
                      ["dhuhr", prayerData.dhuhr],
                      ["asr", prayerData.asr],
                      ["maghrib", prayerData.maghrib],
                      ["isha", prayerData.isha],
                    ] as [string, string][]).map(([key, value]) => (
                      <div key={key} className="flex flex-col items-center">
                        <span className="text-[7px] opacity-60" style={{ color: textColor }}>
                          {PRAYER_LABELS[key]}
                        </span>
                        <span className="text-[9px] font-bold" style={{ color: textColor }}>
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!showDate && !showMessage && !showCountdowns && !showPrayer && (
                <div className="py-4 text-center opacity-50" style={{ color: textColor }}>
                  <p className="text-xs">اختر عناصر الستوري من الأسفل</p>
                </div>
              )}

              <div className="mt-auto pt-1">
                <div className="gold-divider mb-2" />
                <div className="text-center text-[9px] font-extrabold leading-relaxed tracking-wider" style={{ color: textColor, opacity: 0.8 }}>
                  مواعيدك
                </div>
                <div className="mt-0.5 text-center text-[8px]" style={{ color: textColor, opacity: 0.5 }}>
                  جميع الحقوق محفوظة © {currentYear}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-1.5">
          <Label className="text-sm font-semibold text-foreground">رسالة الستوري</Label>
          <Textarea
            value={customMessage}
            onChange={(event) => setCustomMessage(event.target.value)}
            rows={3}
            className="resize-none rounded-xl text-sm font-medium"
            placeholder="اكتب رسالتك اليومية..."
            dir="rtl"
          />
          <p className="text-[11px] text-muted-foreground">
            الرسالة مسبقة التعبئة من مصدر البيانات — يمكنك تعديلها لهذه الجلسة.
          </p>
        </div>

        <div className="heritage-card space-y-3 rounded-2xl p-4">
          <p className="text-sm font-bold text-foreground">عناصر الستوري</p>

          <div className="flex items-center justify-between">
            <Label htmlFor="sw-date" className="cursor-pointer text-sm text-foreground">
              التاريخ الهجري والميلادي
            </Label>
            <Switch id="sw-date" checked={showDate} onCheckedChange={setShowDate} />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="sw-msg" className="cursor-pointer text-sm text-foreground">
              رسالة اليوم
            </Label>
            <Switch id="sw-msg" checked={showMessage} onCheckedChange={setShowMessage} />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="sw-cd" className="cursor-pointer text-sm text-foreground">
              العدادات المالية ({safeCountdowns.length} حدث)
            </Label>
            <Switch id="sw-cd" checked={showCountdowns} onCheckedChange={setShowCountdowns} />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="sw-pr" className="cursor-pointer text-sm text-foreground">
              مواقيت الصلاة
            </Label>
            <Switch id="sw-pr" checked={showPrayer} onCheckedChange={setShowPrayer} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Button className="h-12 rounded-xl text-sm font-bold" onClick={handleCopy} disabled={isLoading}>
            <Copy className="ml-1.5 h-4 w-4" />
            نسخ
          </Button>

          <Button variant="outline" className="h-12 rounded-xl text-sm font-bold" onClick={handleShare} disabled={isLoading}>
            <Share2 className="ml-1.5 h-4 w-4" />
            مشاركة
          </Button>

          <Button
            variant="outline"
            className={`h-12 rounded-xl text-sm font-bold transition-colors ${
              savedOk ? "border-green-500 bg-green-50 text-green-600" : ""
            }`}
            onClick={handleSave}
          >
            {savedOk ? <CheckCircle2 className="ml-1.5 h-4 w-4" /> : <Save className="ml-1.5 h-4 w-4" />}
            {savedOk ? "محفوظ" : "حفظ"}
          </Button>
        </div>
      </div>
    </AppShell>
  );
}