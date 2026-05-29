import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export default function DisclaimerPage() {
  return (
    <AppShell title="إخلاء المسؤولية" hideNav showBack>
      <div className="space-y-4 pb-6">

        <div className="flex items-center gap-3 mb-2">
          <div className="w-11 h-11 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-foreground">إخلاء المسؤولية</h2>
            <p className="text-xs text-muted-foreground">يُرجى قراءة هذا القسم بعناية قبل الاعتماد على أي بيانات</p>
          </div>
        </div>

        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-4">
            <p className="text-xs text-amber-700 leading-relaxed font-medium">
              جميع البيانات والحاسبات والمواعيد في هذا التطبيق هي لأغراض المساعدة والإرشاد فقط. لا تُعتمد قراراً مالياً أو قانونياً أو دينياً رسمياً.
            </p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardContent className="p-5 space-y-5 text-sm leading-relaxed">

            <section>
              <h3 className="font-bold text-base text-foreground mb-2">1. الحاسبات المالية</h3>
              <p className="text-muted-foreground">
                جميع الحاسبات في قسم "المال" — بما فيها حاسبة الراتب، مكافأة نهاية الخدمة، ضريبة القيمة المضافة، سلم الرواتب — تُقدّم نتائج <strong className="text-foreground">تقديرية ومبدئية فقط</strong>. لا تمثل إقراراً ضريبياً أو مالياً رسمياً. يجب التحقق من الأرقام مع الجهة الرسمية أو مستشار مالي مرخّص قبل اتخاذ أي قرار.
              </p>
            </section>

            <div className="h-px bg-border" />

            <section>
              <h3 className="font-bold text-base text-foreground mb-2">2. مواقيت الصلاة</h3>
              <p className="text-muted-foreground">
                مواقيت الصلاة المعروضة تعتمد على <strong className="text-foreground">حسابات تقديرية</strong> بناءً على موقع المدينة. قد تختلف بدقائق عن التوقيت الرسمي حسب المنطقة والموسم. يُنصح دائماً بمراجعة <strong className="text-foreground">التقويم الرسمي لأم القرى أو وزارة الشؤون الإسلامية</strong> للتحقق.
              </p>
            </section>

            <div className="h-px bg-border" />

            <section>
              <h3 className="font-bold text-base text-foreground mb-2">3. بيانات الدعم الحكومي</h3>
              <p className="text-muted-foreground">
                بيانات الدعم الحكومي (الضمان الاجتماعي، حساب المواطن، دعم سكني وغيره) المعروضة في التطبيق هي <strong className="text-foreground">بيانات تقديرية مُدارة إدارياً</strong> لأغراض التذكير بالمواعيد فقط. المبالغ والتواريخ الفعلية قد تختلف. يجب الرجوع إلى البوابات الرسمية للجهات الحكومية للتحقق.
              </p>
            </section>

            <div className="h-px bg-border" />

            <section>
              <h3 className="font-bold text-base text-foreground mb-2">4. الأخبار والوظائف</h3>
              <p className="text-muted-foreground">
                الأخبار والوظائف المعروضة <strong className="text-foreground">محتوى مُدار إدارياً</strong> ولا تمثل مصادقة المنصة عليها. تواريخ انتهاء التقديم والشروط يجب التحقق منها مباشرة مع الجهة المُعلنة.
              </p>
            </section>

            <div className="h-px bg-border" />

            <section>
              <h3 className="font-bold text-base text-foreground mb-2">5. حدود الاستخدام</h3>
              <p className="text-muted-foreground">
                لا تستخدم التطبيق كمصدر وحيد لمواعيدك أو التزاماتك المالية الحساسة. تحقق دائماً من المصادر الرسمية للجهات الحكومية والمالية للحصول على البيانات الدقيقة والمُحدَّثة.
              </p>
            </section>

          </CardContent>
        </Card>

      </div>
    </AppShell>
  );
}
