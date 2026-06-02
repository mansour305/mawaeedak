import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList, Palette, RotateCcw } from "lucide-react";

const removedReferences = [
  "لوحة الألوان البنية والذهبية",
  "الخلفيات الورقية والزخارف",
  "بطاقات التراث الداكنة",
  "صفحة reference clone القديمة",
  "تسميات التراث التقني الفاخر",
];

const pendingIdentityInputs = [
  "الاسم أو الوصف المختصر للهوية",
  "الألوان الأساسية والثانوية",
  "الشعار أو شكل الرمز",
  "أسلوب الصور أو الرسوم",
  "أمثلة صفحات يجب أن تقود الاتجاه الجديد",
];

export default function ReferenceClonePage() {
  return (
    <AppShell title="إعادة ضبط الهوية">
      <div className="flex flex-col gap-5 py-4">
        <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-extrabold text-foreground">تمت إزالة المرجع البصري القديم</h1>
            </div>
            <Badge variant="outline" className="font-bold">Identity reset</Badge>
          </div>
          <p className="text-sm leading-7 text-muted-foreground">
            هذه الصفحة كانت تعرض نسخة مرجعية مبنية على الهوية البنية / التراثية. تم استبدالها
            بحالة محايدة حتى لا تقود أي تنفيذ جديد قبل اعتماد الهوية القادمة.
          </p>
        </section>

        <Card className="border-card-border">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Palette className="h-4 w-4 text-primary" />
              العناصر التي لم تعد مرجعاً
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            {removedReferences.map((item) => (
              <div key={item} className="rounded-lg border border-border bg-secondary/45 px-3 py-2 text-sm text-foreground">
                {item}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-card-border">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <ClipboardList className="h-4 w-4 text-primary" />
              مدخلات الهوية الجديدة
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            {pendingIdentityInputs.map((item) => (
              <div key={item} className="rounded-lg border border-border bg-card px-3 py-2 text-sm font-semibold text-foreground">
                {item}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
