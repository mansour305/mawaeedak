import { useState, useEffect, useCallback } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  useGetTodayMessage,
  useGetPrayerTimes,
} from "@workspace/api-client-react";
import { useGatewayStoryTemplates, useGatewayFinancialCountdown } from "@/hooks/useGatewayData";
import { useLocationPrefs } from "@/hooks/useLocationPrefs";
import { useStore } from "@/hooks/useStore";
import { formatHijriDate, formatGregorianDate, getDayName } from "@/lib/utils";
import { Copy, Share2, Save, Loader2, CheckCircle2, AlertCircle, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const EVENT_EMOJI: Record<string, string> = {
  salary: "💼",
  support: "👨‍👩‍👧",
  bill: "📄",
  other: "🎯",
};

const NAME_HASHTAG: Record<string, string> = {
  "الراتب الشهري": "#الراتب",
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
  return "#" + name.replace(/\s+/g, "_");
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
  fajr: "الفجر", sunrise: "الشروق", dhuhr: "الظهر",
  asr: "العصر", maghrib: "المغرب", isha: "العشاء",
};

export default function StoryPage() {
  const { toast } = useToast();
  const { user } = useStore();
  const { prefs: locPrefs } = useLocationPrefs();
  const prayerCity = locPrefs.source !== "default" ? locPrefs.city : (user.city || "الرياض");
  const {
    data: messageData,
    isLoading: msgLoading,
    isError: msgError,
  } = useGetTodayMessage();
  const {
    data: countdowns,
    isLoading: cdLoading,
    isError: cdError,
  } = useGatewayFinancialCountdown();
  const { data: prayerData } = useGetPrayerTimes({ city: prayerCity });
  // Phase 12H: يقرأ من Supabase عند mode=supabase، fallback إلى API
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
      const s: Partial<StorySave> = JSON.parse(raw);
      if (s.showDate !== undefined) setShowDate(s.showDate);
      if (s.showMessage !== undefined) setShowMessage(s.showMessage);
      if (s.showCountdowns !== undefined) setShowCountdowns(s.showCountdowns);
      if (s.showPrayer !== undefined) setShowPrayer(s.showPrayer);
      if (s.templateId) setTemplateId(s.templateId);
      if (s.customMessage) {
        setCustomMessage(s.customMessage);
        setMessageSet(true);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (!messageSet && messageData?.message) {
      setCustomMessage(messageData.message);
      setMessageSet(true);
    }
  }, [messageData, messageSet]);

  const activeTemplates = templates?.filter((t) => t.is_active) ?? [];
  const activeTemplate = activeTemplates.find((t) => t.id === templateId) ?? activeTemplates[0];
  const bgColor = activeTemplate?.background_color ?? "#5C3D11";
  const textColor = activeTemplate?.text_color ?? "#FFF8E7";

  const generateStoryText = useCallback((): string => {
    const parts: string[] = [];

    if (showDate) {
      parts.push(
        `📌 تاريخ اليوم\n📅 ${getDayName()}\n🌙 هجري: ${formatHijriDate()}\n🗓️ ميلادي: ${formatGregorianDate()}`
      );
    }

    if (showMessage && customMessage.trim()) {
      parts.push(`💡 ${customMessage.trim()}`);
    }

    if (showCountdowns && countdowns && countdowns.length > 0) {
      const lines = [`⏳ كم باقي على:\n`];
      countdowns.forEach((c) => {
        const emoji = EVENT_EMOJI[c.type] ?? "📌";
        const hashtag = resolveHashtag(c.name);
        lines.push(`${emoji} ${hashtag} 🔻 ${c.days_remaining} يوم`);
      });
      parts.push(lines.join("\n"));
    }

    if (showPrayer && prayerData) {
      parts.push(
        `🕌 مواقيت الصلاة — ${prayerData.city ?? ""}\n` +
        `الفجر: ${prayerData.fajr}  الشروق: ${prayerData.sunrise}  الظهر: ${prayerData.dhuhr}\n` +
        `العصر: ${prayerData.asr}  المغرب: ${prayerData.maghrib}  العشاء: ${prayerData.isha}`
      );
    }

    parts.push(`━━━━━━━━━━━━━━\nمواعيدك\nمنصة تجمع وقتك، راتبك، دعمك، وأهم مواعيدك.`);

    return parts.join("\n\n━━━━━━━━━━━━━━\n\n");
  }, [showDate, showMessage, showCountdowns, showPrayer, customMessage, countdowns, prayerData]);

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
        /* المستخدم أغلق نافذة المشاركة */
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
        {/* Header */}
        <div className="text-center px-2">
          <h2 className="text-xl font-bold text-foreground mb-1">شارك يومك</h2>
          <p className="text-muted-foreground text-sm">
            محتوى جاهز للمشاركة في حالات الواتساب والسناب شات.
          </p>
        </div>

        {/* Template tabs */}
        {!tplLoading && activeTemplates.length > 1 && (
          <div className="flex gap-2 justify-center flex-wrap">
            {activeTemplates.map((t) => (
              <button
                key={t.id}
                onClick={() => setTemplateId(t.id)}
                className={`px-4 py-1.5 rounded-xl text-sm font-semibold border transition-all ${
                  templateId === t.id
                    ? "border-[hsl(var(--gold))] text-[hsl(var(--gold))] bg-[hsl(var(--gold)/0.08)]"
                    : "border-border text-muted-foreground hover:border-[hsl(var(--gold)/0.4)]"
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>
        )}

        {/* Auto-generation badge — Phase 13B */}
        <div className="flex justify-center">
          <Badge variant="outline" className="gap-1.5 text-[11px] border-[hsl(var(--gold)/0.4)] text-[hsl(var(--gold-muted))] bg-[hsl(var(--gold)/0.06)]">
            <Zap className="w-3 h-3" />
            مُنشأ تلقائياً · {getDayName()} {new Date().toLocaleDateString("ar-SA-u-ca-gregory", { day: "numeric", month: "short" })}
          </Badge>
        </div>

        {/* Story card preview */}
        {isLoading ? (
          <div className="flex justify-center py-14">
            <Loader2 className="w-7 h-7 animate-spin" style={{ color: "hsl(var(--gold))" }} />
          </div>
        ) : hasError ? (
          <div className="flex flex-col items-center gap-2 py-10 text-muted-foreground">
            <AlertCircle className="w-8 h-8 text-destructive" />
            <p className="text-sm">تعذّر تحميل بيانات الستوري. حاول تحديث الصفحة.</p>
          </div>
        ) : (
          <Card
            className="overflow-hidden mx-auto max-w-[280px] aspect-[9/16] relative flex flex-col border-card-border shadow-xl"
            style={{ background: `linear-gradient(165deg, ${bgColor} 0%, color-mix(in srgb, ${bgColor} 60%, #1a0e05) 100%)` }}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse 70% 40% at 50% 20%, rgba(212,175,55,0.20) 0%, transparent 65%)",
              }}
            />
            <CardContent className="p-5 relative z-10 flex-1 flex flex-col justify-center gap-3">
              {showDate && (
                <div className="text-center space-y-0.5">
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
                  className="p-3 rounded-xl border text-center"
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

              {showCountdowns && countdowns && countdowns.length > 0 && (
                <div
                  className="p-3 rounded-xl border"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    borderColor: "rgba(212,175,55,0.15)",
                  }}
                >
                  <div
                    className="text-[10px] font-bold text-center mb-2"
                    style={{ color: "hsl(var(--nav-active))" }}
                  >
                    ⏳ كم باقي على:
                  </div>
                  <div className="space-y-1.5">
                    {countdowns.map((c) => (
                      <div key={c.id} className="flex justify-between items-center gap-1">
                        <span className="text-[10px] font-medium" style={{ color: textColor }}>
                          {EVENT_EMOJI[c.type] ?? "📌"} {c.name}
                        </span>
                        <span
                          className="text-[11px] font-extrabold shrink-0"
                          style={{ color: "hsl(var(--nav-active))" }}
                        >
                          {c.days_remaining} يوم
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {showPrayer && prayerData && (
                <div
                  className="p-2 rounded-xl border"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    borderColor: "rgba(212,175,55,0.15)",
                  }}
                >
                  <div className="text-[9px] font-bold text-center mb-1.5" style={{ color: "hsl(var(--nav-active))" }}>
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
                    ] as [string, string][]).map(([k, val]) => (
                      <div key={k} className="flex flex-col items-center">
                        <span className="text-[7px] opacity-60" style={{ color: textColor }}>{PRAYER_LABELS[k]}</span>
                        <span className="text-[9px] font-bold" style={{ color: textColor }}>{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!showDate && !showMessage && !showCountdowns && !showPrayer && (
                <div className="text-center py-4 opacity-50" style={{ color: textColor }}>
                  <p className="text-xs">اختر عناصر الستوري من الأسفل</p>
                </div>
              )}

              <div className="mt-auto pt-1">
                <div className="gold-divider mb-2" />
                <div
                  className="text-[9px] font-extrabold tracking-wider text-center leading-relaxed"
                  style={{ color: textColor, opacity: 0.8 }}
                >
                  مواعيدك
                </div>
                <div
                  className="text-[8px] text-center mt-0.5"
                  style={{ color: textColor, opacity: 0.5 }}
                >
                  جميع الحقوق محفوظة © ٢٠٢٥
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Editable message */}
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold text-foreground">رسالة الستوري</Label>
          <Textarea
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            rows={3}
            className="resize-none text-sm font-medium rounded-xl"
            placeholder="أكتب رسالتك اليومية..."
            dir="rtl"
          />
          <p className="text-[11px] text-muted-foreground">
            الرسالة مسبقة التعبئة من مصدر البيانات — يمكنك تعديلها لهذه الجلسة.
          </p>
        </div>

        {/* Element toggles */}
        <div className="heritage-card rounded-2xl p-4 space-y-3">
          <p className="text-sm font-bold text-foreground">عناصر الستوري</p>
          <div className="flex items-center justify-between">
            <Label htmlFor="sw-date" className="text-sm text-foreground cursor-pointer">
              التاريخ الهجري والميلادي
            </Label>
            <Switch id="sw-date" checked={showDate} onCheckedChange={setShowDate} />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="sw-msg" className="text-sm text-foreground cursor-pointer">
              رسالة اليوم
            </Label>
            <Switch id="sw-msg" checked={showMessage} onCheckedChange={setShowMessage} />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="sw-cd" className="text-sm text-foreground cursor-pointer">
              العدادات المالية ({countdowns?.length ?? 0} حدث)
            </Label>
            <Switch id="sw-cd" checked={showCountdowns} onCheckedChange={setShowCountdowns} />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="sw-pr" className="text-sm text-foreground cursor-pointer">
              مواقيت الصلاة
            </Label>
            <Switch id="sw-pr" checked={showPrayer} onCheckedChange={setShowPrayer} />
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-3 gap-2">
          <Button
            className="h-12 text-sm font-bold rounded-xl"
            onClick={handleCopy}
            disabled={isLoading}
          >
            <Copy className="w-4 h-4 ml-1.5" />
            نسخ
          </Button>
          <Button
            variant="outline"
            className="h-12 text-sm font-bold rounded-xl"
            onClick={handleShare}
            disabled={isLoading}
          >
            <Share2 className="w-4 h-4 ml-1.5" />
            مشاركة
          </Button>
          <Button
            variant="outline"
            className={`h-12 text-sm font-bold rounded-xl transition-colors ${
              savedOk ? "border-green-500 text-green-600 bg-green-50" : ""
            }`}
            onClick={handleSave}
          >
            {savedOk ? (
              <CheckCircle2 className="w-4 h-4 ml-1.5" />
            ) : (
              <Save className="w-4 h-4 ml-1.5" />
            )}
            {savedOk ? "محفوظ" : "حفظ"}
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
