import { useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import DailyCardPreview from "./DailyCardPreview";
import { useStore } from "@/hooks/useStore";
import { formatHijriDate, formatGregorianDate, getDayName } from "@/lib/utils";
import { Copy, Share2, Download } from "lucide-react";
import { showTopNotification } from "@/components/layout/TopNotificationBanner";
import { getRiyadhTodayKey } from "@/lib/riyadhTime";

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
  "الفرج قريب، فلا تيأس.",
  "ازرع优良品德，收获美好人生。",
  "ابدأ بالتوكل على الله تنجح.",
  "أحسن إلى الناس تستعبد قلوبهم.",
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
  const { user } = useStore();
  const cardRef = useRef<HTMLDivElement>(null);

  const message = useMemo(() => getTodayMessage(), []);

  // Generate text for copy
  const generateText = () => {
    const saudiHour = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Riyadh" })).getHours();
    const greeting = saudiHour < 12 ? "صباح الخير" : "مساء الخير";

    const lines = [
      "✦ مواعيدك ✦",
      getDayName(),
      `${formatHijriDate()} هـ`,
      `${formatGregorianDate()} م`,
      "",
      greeting,
      message,
      "",
      "واذكروا الله ذكراً كثيراً",
      "",
      "━━━━━━━━━━━━━━",
      "مواعيدك — منصة تجمع وقتك، راتبك، دعمك، وأهم مواعيدك",
    ];

    return lines.join("\n");
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generateText());
      showTopNotification("تم نسخ البطاقة بنجاح", "success");
    } catch {
      showTopNotification("فشل نسخ البطاقة", "error");
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
        showTopNotification("تمت المشاركة بنجاح", "success");
      } else {
        await navigator.clipboard.writeText(generateText());
        showTopNotification("تم نسخ البطاقة للمشاركة", "info");
      }
    } catch (e: any) {
      if (e?.name !== "AbortError") {
        showTopNotification("فشل المشاركة", "error");
      }
    }
  };

  const handleSaveImage = async () => {
    if (!cardRef.current) return;
    
    showTopNotification("جاري حفظ الصورة...", "info");
    
    try {
      const { default: html2canvas } = await import("html2canvas");
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: "#FDF9F3",
        useCORS: true,
      });
      
      const link = document.createElement("a");
      link.download = `mawaeedak-card-${getRiyadhTodayKey()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      
      showTopNotification("تم حفظ الصورة بنجاح", "success");
    } catch (err) {
      console.error("[DailyCard] Save image error:", err);
      showTopNotification("فشل حفظ الصورة", "error");
    }
  };

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-start pt-6 pb-8 px-4"
      style={{ background: "linear-gradient(180deg, #FDF9F3 0%, #F3E8D6 100%)" }}
    >
      {/* Card preview - ref for html2canvas */}
      <div ref={cardRef}>
        <DailyCardPreview message={message} />
      </div>
      
      {/* Action buttons only */}
      <div className="flex gap-3 mt-6 w-full max-w-[360px]">
        <Button 
          className="flex-1 h-12 rounded-xl text-sm font-bold"
          style={{ background: "#C9A063", color: "#FFFFFF" }}
          onClick={handleCopy}
        >
          <Copy className="w-4 h-4 ml-1" />
          نسخ
        </Button>
        <Button 
          variant="outline"
          className="flex-1 h-12 rounded-xl text-sm font-bold"
          style={{ borderColor: "rgba(201,160,99,0.4)", color: "#8A6B3D" }}
          onClick={handleShare}
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
  );
}

