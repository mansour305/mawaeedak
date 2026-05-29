import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default function TermsPage() {
  return (
    <AppShell title="شروط الاستخدام" hideNav showBack>
      <div className="space-y-4 pb-6">

        <div className="flex items-center gap-3 mb-2">
          <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-foreground">شروط الاستخدام</h2>
            <p className="text-xs text-muted-foreground">مسودة تشغيلية — تحتاج مراجعة قانونية قبل الإطلاق التجاري</p>
          </div>
        </div>

        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-4">
            <p className="text-xs text-amber-700 leading-relaxed font-medium">
              هذه الشروط مسودة تشغيلية أولية. لا تُعتبر عقداً قانونياً نهائياً. الإطلاق التجاري الكامل يستلزم مراجعة قانونية متخصصة وموافقة ذات اختصاص.
            </p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardContent className="p-5 space-y-5 text-sm leading-relaxed">

            <section>
              <h3 className="font-bold text-base text-foreground mb-2">1. طبيعة التطبيق</h3>
              <p className="text-muted-foreground">
                "مواعيدك" منصة مساعد يومي شخصي سعودية، تقدم خدمات تنظيم المواعيد والحاسبات المالية التقديرية ومواقيت الصلاة والأخبار والخدمات اليومية. تسعى المنصة إلى تقديم تجربة موثوقة ومستمرة لجميع المستخدمين.
              </p>
            </section>

            <div className="h-px bg-border" />

            <section>
              <h3 className="font-bold text-base text-foreground mb-2">2. حدود المسؤولية</h3>
              <p className="text-muted-foreground">
                لا تتحمل منصة "مواعيدك" أي مسؤولية قانونية أو مالية عن:
              </p>
              <ul className="mt-2 space-y-1 text-muted-foreground list-disc list-inside">
                <li>قرارات مالية تُتخذ بناءً على الحاسبات التقديرية في التطبيق</li>
                <li>الاعتماد على مواقيت الصلاة دون مراجعة المصدر الرسمي</li>
                <li>دقة بيانات الدعم الحكومي أو الرواتب المعروضة (تقديرية وليست رسمية)</li>
                <li>محتوى الأخبار والوظائف المُدار إدارياً</li>
                <li>فقدان البيانات المحلية نتيجة مسح المتصفح أو الجهاز</li>
              </ul>
            </section>

            <div className="h-px bg-border" />

            <section>
              <h3 className="font-bold text-base text-foreground mb-2">3. بيانات الاستخدام</h3>
              <p className="text-muted-foreground">
                البيانات التي تُدخلها في التطبيق هي ملكيتك الشخصية. تُحفظ محلياً على جهازك ما لم تكن بيانات تواصل أو شكاوى تُرسل للمنصة. تستخدم المنصة بيانات إدارية (رسائل اليوم، الأخبار، الوظائف، الثيمات) مُدخلة من الإدارة فقط ولا تمثل بيانات مستخدم.
              </p>
            </section>

            <div className="h-px bg-border" />

            <section>
              <h3 className="font-bold text-base text-foreground mb-2">4. الاستخدام المسموح</h3>
              <p className="text-muted-foreground">
                يُخصص هذا التطبيق للاستخدام الشخصي وغير التجاري فقط. يُمنع إعادة نشر محتوى المنصة أو استخدامها بصورة تجارية دون إذن صريح.
              </p>
            </section>

            <div className="h-px bg-border" />

            <section>
              <h3 className="font-bold text-base text-foreground mb-2">5. التغييرات</h3>
              <p className="text-muted-foreground">
                قد تتغير هذه الشروط مع تطور المنصة. الاستمرار في استخدام التطبيق يُعدّ موافقةً على الشروط المحدّثة.
              </p>
            </section>

          </CardContent>
        </Card>

      </div>
    </AppShell>
  );
}
