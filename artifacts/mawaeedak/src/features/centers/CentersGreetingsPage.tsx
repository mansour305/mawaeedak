import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Copy, Share2, Gift } from "lucide-react";

interface GreetingType {
  id: string;
  label: string;
  emoji: string;
  templates: string[];
}

const GREETING_TYPES: GreetingType[] = [
  {
    id: "eid",
    label: "عيد",
    emoji: "🌙",
    templates: [
      "كل عام وأنتم بخير، تقبل الله منا ومنكم صالح الأعمال، عيدكم مبارك وأيامكم سعيدة.",
      "أهنئكم بحلول العيد السعيد، أعاده الله علينا وعليكم باليمن والبركات، وكل عام وأنتم بألف خير.",
    ],
  },
  {
    id: "graduation",
    label: "تخرج",
    emoji: "🎓",
    templates: [
      "ألف مبروك التخرج! ومنها للأعلى يا رب، تعبت ونلت وما تستاهل غير الأحسن.",
      "مبارك التخرج، هذا أقل ما تستحقه، وفقك الله في مسيرتك وجعل أمامك الأفضل دائماً.",
    ],
  },
  {
    id: "success",
    label: "نجاح",
    emoji: "🏆",
    templates: [
      "ألف مبروك النجاح! ما شاء الله عليك، ثمرة تعبك ومجهودك الدؤوب، إلى الأمام دائماً.",
      "مبارك نجاحك المستحق، كم من ليلة سهرت وكم من تعب تحملت، اليوم حق لك الفخر والسرور.",
    ],
  },
  {
    id: "job",
    label: "وظيفة",
    emoji: "💼",
    templates: [
      "ألف مبروك الوظيفة الجديدة! نسأل الله لك التوفيق والسداد وأن تكون عوناً لك على بر والديك.",
      "مبارك لك المنصب الجديد، أنت قدها وتستاهل كل خير، ونسأل الله أن يبارك لك في عملك.",
    ],
  },
  {
    id: "wedding",
    label: "زواج",
    emoji: "💍",
    templates: [
      "بارك الله لكما وبارك عليكما وجمع بينكما في خير. ألف مبروك وعقبال العمر كله.",
      "مبارك الزواج الميمون المبارك، جمعكم الله على الخير ورزقكم السعادة والمودة والرحمة.",
    ],
  },
  {
    id: "baby",
    label: "مولود",
    emoji: "👶",
    templates: [
      "بارك الله لك في الموهوب، وشكرت الواهب، وبلغ أشده، ورزقت بره. ألف مبروك المولود الجديد.",
      "مبارك المولود، أسأل الله أن يجعله قرة عين لوالديه وأن يكون ذخراً لهم في الدنيا والآخرة.",
    ],
  },
  {
    id: "national_day",
    label: "اليوم الوطني",
    emoji: "🇸🇦",
    templates: [
      "بمناسبة اليوم الوطني للمملكة العربية السعودية، كل عام والوطن بخير ومجد، ويزداد قوة وعزة.",
      "في ذكرى اليوم الوطني العزيز، أهنئكم وأسأل الله أن يحفظ هذا الوطن الغالي ويديم أمنه وازدهاره.",
    ],
  },
];

export default function CentersGreetingsPage() {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [selectedType, setSelectedType] = useState<GreetingType>(GREETING_TYPES[0]);
  const [selectedTemplate, setSelectedTemplate] = useState(GREETING_TYPES[0].templates[0]);

  const handleTypeChange = (t: GreetingType) => {
    setSelectedType(t);
    setSelectedTemplate(t.templates[0]);
  };

  const previewText = `عزيزي/عزيزتي ${name || "[الاسم]"}\n\n${selectedTemplate}\n\nمع أطيب التمنيات.`;

  const copyText = () => {
    navigator.clipboard.writeText(previewText).then(() => {
      toast({ title: "تم النسخ", description: "تم نسخ التهنئة إلى الحافظة" });
    }).catch(() => {
      toast({ title: "تعذّر النسخ", variant: "destructive" });
    });
  };

  const shareText = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ text: previewText });
      } catch {
        copyText();
      }
    } else {
      copyText();
    }
  };

  return (
    <AppShell title="مركز التهاني" showBack>
      <div className="space-y-5 pb-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Gift className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">مولّد التهاني</h2>
            <p className="text-sm text-muted-foreground">اختر القالب وشارك الفرحة</p>
          </div>
        </div>

        {/* Recipient Name */}
        <div className="space-y-2">
          <Label>المرسل إليه</Label>
          <Input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="اسم الشخص (اختياري)"
            className="h-12 bg-card"
          />
        </div>

        {/* Greeting Type Selector */}
        <div className="space-y-2">
          <Label>نوع التهنئة</Label>
          <div className="grid grid-cols-4 gap-2">
            {GREETING_TYPES.map(t => (
              <button
                key={t.id}
                onClick={() => handleTypeChange(t)}
                className={`flex flex-col items-center justify-center py-3 rounded-xl border text-center gap-1 transition-all ${
                  selectedType.id === t.id
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border bg-card hover:border-primary/40"
                }`}
              >
                <span className="text-xl">{t.emoji}</span>
                <span className={`text-[10px] font-bold ${selectedType.id === t.id ? "text-primary" : "text-muted-foreground"}`}>
                  {t.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Template Selector */}
        <div className="space-y-2">
          <Label>اختر القالب</Label>
          <div className="space-y-2">
            {selectedType.templates.map((t, i) => (
              <Card
                key={i}
                className={`cursor-pointer transition-all border-2 ${
                  selectedTemplate === t ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                }`}
                onClick={() => setSelectedTemplate(t)}
              >
                <CardContent className="p-4 text-sm leading-relaxed text-foreground">
                  {t}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Preview */}
        <Card className="border-border bg-card shadow-inner">
          <CardContent className="p-5">
            <div className="text-xs font-bold text-muted-foreground mb-3 flex items-center gap-1">
              <span className="text-base">{selectedType.emoji}</span>
              معاينة التهنئة
            </div>
            <p className="whitespace-pre-wrap leading-loose text-sm font-medium text-foreground">
              {previewText}
            </p>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <Button className="flex-1 h-12 font-bold" onClick={shareText}>
            <Share2 className="w-4 h-4 ml-2" />
            مشاركة
          </Button>
          <Button variant="outline" className="flex-1 h-12 font-bold" onClick={copyText}>
            <Copy className="w-4 h-4 ml-2" />
            نسخ
          </Button>
        </div>
      </div>
    </AppShell>
  );
}

