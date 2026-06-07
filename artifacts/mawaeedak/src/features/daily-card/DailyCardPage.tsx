import { useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import DailyCardPreview from "./DailyCardPreview";
import { useStore } from "@/hooks/useStore";
import { formatHijriDate, formatGregorianDate, getDayName } from "@/lib/utils";
import { Copy, Share2, Download, Loader2 } from "lucide-react";

// Saudi-based daily messages pool
const DAILY_MESSAGES = [
  "يبدأ يومك بنية طيبة، وتوكّل على الله في كل خطوة.",
  "حافظ على صلاتك في وقتها، فهي نور لك في الدنيا والآخرة.",
  "ابدأ يومك بالصلاة ثم الذهاب إلى عملك بنشاط.",
  "الورد والصباح الجميل يبدأان من القلب.",
  "لا تؤجل عمل اليوم إلى الغد، فكل يوم له فرصته.",
  "أحسن الظن بالله، وافعل ما بوسعك، وتوكّل على الله.",
  "مهما كانت التحديات، ثق أن الفرج قريب.",
  "اجعل لك هدفاً كل يوم، وحققه قبل منتصف النهار.",
  "التفاؤل يغير الحياة، فابدأ يومك بابتسامة.",
  "ذكر الله نعمة، فاحمده على نعمائه.",
  "العمل عبادة، فأتقن ما بيدك.",
  "لا تستعجل النتائج، فالأجور تأتي.",
  "كن باراً بوالديك، فالدعاء مستجاب.",
  "التوازن بين العمل والعبادة مفتاح السعادة.",
  "كل يوم جديد هو فرصة جديدة للتغيير.",
  "الصلاة على النبي حياة للقلب.",
  "العمل الصالح لا يضيع أبداً.",
  "توكل على الله في كل أمر، فهو خير معين.",
  "ازرع خيراً حيثما حللت، تحصد خيراً حيثما كنت.",
  "ابدأ يومك بالصلاة، واختم يومك بالاستغفار.",
];

// Get today's message based on Saudi date
function getTodayMessage(): string {
  const saudiDate = new Date().toLocaleString("en-US", { timeZone: "Asia/Riyadh" });
  const today = new Date(saudiDate);
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  const index = dayOfYear % DAILY_MESSAGES.length;
  return DAILY_MESSAGES[index];
}

export default function DailyCardPage() {
  const { toast } = useToast();
  const { user } = useStore();

  const message = useMemo(() => getTodayMessage(), []);
  const isLoading = false;

  // Generate text for copy
  const generateText = useCallback((): string => {
    const displayName = (user?.name && user.name.length > 0) ? user.name.split(" ")[0] : null;
    const saudiHour = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Riyadh" })).getHours();
    const greeting = saudiHour < 12 ? "صباح الخير" : "مساء الخير";
    const fullGreeting = displayName ? `${greeting} يا ${displayName}` : greeting;

    const lines = [
      "✦ مواعيدك ✦",
      getDayName(),
      `${formatHijriDate()} هـ`,
      `${formatGregorianDate()} م`,
      "",
      fullGreeting,
      message,
      "",
      "واذكروا الله ذكراً كثيراً",
      "",
      "━━━━━━━━━━━━━━",
      "مواعيدك — منصة تجمع وقتك، راتبك، دعمك، وأهم مواعيدك",
    ];

    return lines.join("\n");
  }, [user, message]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generateText());
      toast({ title: "تم نسخ البطاقة بنجاح" });
    } catch {
      toast({ title: "فشل نسخ البطاقة", variant: "destructive" });
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "بطاقة يومية - مواعيدك",
          text: generateText(),
          url: window.location.origin,
        });
      } else {
        await navigator.clipboard.writeText(generateText());
        toast({ title: "تم نسخ البطاقة للمشاركة" });
      }
    } catch (e: any) {
      if (e?.name !== "AbortError") {
        toast({ title: "فشل المشاركة", variant: "destructive" });
      }
    }
  };

  const handleSaveImage = () => {
    toast({ 
      title: "حفظ الصورة", 
      description: "تحتاج تفعيل مكتبة التصدير - استخدم نسخ النص للمشاركة حالياً"
    });
  };

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg, #FDF9F3 0%, #F3E8D6 100%)" }}>
      <div className="flex flex-col items-center justify-start pt-6 pb-8 px-4">
        <DailyCardPreview message={message} />
        
        <div className="flex gap-3 mt-6 w-full max-w-[360px]">
          <Button 
            className="flex-1 h-12 rounded-xl text-sm font-bold"
            style={{ background: "#C9A063", color: "#FFFFFF" }}
            onClick={handleCopy}
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Copy className="w-4 h-4 ml-1" />}
            نسخ
          </Button>
          <Button 
            variant="outline"
            className="flex-1 h-12 rounded-xl text-sm font-bold"
            style={{ borderColor: "rgba(201,160,99,0.4)", color: "#8A6B3D" }}
            onClick={handleShare}
            disabled={isLoading}
          >
            <Share2 className="w-4 h-4 ml-1" />
            مشاركة
          </Button>
          <Button 
            variant="outline"
            className="flex-1 h-12 rounded-xl text-sm font-bold"
            style={{ borderColor: "rgba(201,160,99,0.4)", color: "#8A6B3D" }}
            onClick={handleSaveImage}
          >
            <Download className="w-4 h-4 ml-1" />
            صورة
          </Button>
        </div>
      </div>
    </div>
  );
}