import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList, Palette, RotateCcw } from "lucide-react";

const resetItems = [
  "تم تعطيل الهوية البنية / التراثية كمصدر قرار بصري.",
  "تم تحويل الثيم الحالي إلى baseline محايد مؤقت.",
  "لا توجد لوحة ألوان رسمية جديدة بعد.",
  "لا توجد صور أو زخارف مرجعية معتمدة للهوية القادمة بعد.",
];

const nextSteps = [
  "اسم الهوية الجديدة",
  "لوحة الألوان الرسمية",
  "نظام الشعار والأيقونات",
  "اتجاه الصور أو الرسوم",
  "قواعد التطبيق على صفحات المستخدم ولوحة المالك",
];

export default function AdminVisualGuide() {
  return (
    <div className="space-y-5 pb-8 rtl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="mb-1 text-2xl font-extrabold text-foreground">حالة الهوية البصرية</h1>
          <p className="text-sm leading-6 text-muted-foreground">
            هذا القسم لم يعد يعرض الهوية البنية / التراثية القديمة. سيتم استخدامه لاحقاً كمصدر
            حقيقة للهوية الجديدة بعد اعتماد اتجاهها.
          </p>
        </div>
        <Badge variant="outline" className="shrink-0 font-bold">Reset</Badge>
      </div>

      <Card className="border-card-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <RotateCcw className="h-4 w-4 text-primary" />
            ما الذي تغير؟
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {resetItems.map((item) => (
            <div key={item} className="flex items-start gap-2 rounded-lg border border-border bg-secondary/45 p-3 text-sm">
              <Palette className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span className="leading-6 text-foreground">{item}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-card-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <ClipboardList className="h-4 w-4 text-primary" />
            المطلوب قبل بناء الهوية الجديدة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2">
            {nextSteps.map((item) => (
              <div key={item} className="rounded-lg border border-border bg-card px-3 py-2 text-sm font-semibold text-foreground">
                {item}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
