import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Shield } from "lucide-react";

export default function PrivacyPage() {
  return (
    <AppShell title="سياسة الخصوصية" hideNav showBack>
      <div className="space-y-4 pb-6">

        <div className="flex items-center gap-3 mb-2">
          <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-foreground">سياسة الخصوصية</h2>
            <p className="text-xs text-muted-foreground">مسودة تشغيلية — تحتاج مراجعة قانونية قبل الإطلاق التجاري</p>
          </div>
        </div>

        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-4">
            <p className="text-xs text-amber-700 leading-relaxed font-medium">
              هذه السياسة مسودة تشغيلية أولية. لا تُعتبر وثيقة قانونية نهائية. يتطلب الإطلاق التجاري الكامل مراجعة قانونية متخصصة.
            </p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardContent className="p-5 space-y-5 text-sm leading-relaxed">

            <section>
              <h3 className="font-bold text-base text-foreground mb-2">1. طبيعة التطبيق وحماية البيانات</h3>
              <p className="text-muted-foreground">
                منصة "مواعيدك" منصة مساعد يومي شخصي تستخدم نظام مصادقة آمن. بيانات التفضيلات والإعدادات الشخصية تُحفظ محلياً على جهازك، بينما تُحفظ المواعيد والبيانات المالية والشكاوى في قاعدة بيانات المنصة المحمية.
              </p>
            </section>

            <div className="h-px bg-border" />

            <section>
              <h3 className="font-bold text-base text-foreground mb-2">2. البيانات المجمعة</h3>
              <p className="text-muted-foreground">
                يجمع التطبيق المعلومات التالية بصورة محلية:
              </p>
              <ul className="mt-2 space-y-1 text-muted-foreground list-disc list-inside">
                <li>الاسم والمدينة التي تُدخلها عند الإعداد</li>
                <li>المواعيد والمهام التي تُضيفها في التقويم ومركز الأعمال</li>
                <li>الأحداث المالية التي تُسجّلها في قسم المال</li>
                <li>بيانات الرحلات في مركز السفر</li>
                <li>تفضيلات الإشعارات والثيمات والصلاة والتقويم</li>
              </ul>
            </section>

            <div className="h-px bg-border" />

            <section>
              <h3 className="font-bold text-base text-foreground mb-2">3. المحتوى المُدار من الإدارة</h3>
              <p className="text-muted-foreground">
                بعض البيانات المعروضة في التطبيق هي <strong className="text-foreground">محتوى مُدار إدارياً (Admin-Managed)</strong> ولا تمثل بيانات شخصية للمستخدم، مثل: الأخبار، الوظائف، رسائل اليوم، قوالب الستوري، والبيانات المالية الحكومية التقديرية. هذه البيانات مُدخلة من قِبل إدارة المنصة فقط.
              </p>
            </section>

            <div className="h-px bg-border" />

            <section>
              <h3 className="font-bold text-base text-foreground mb-2">4. الشكاوى والتواصل</h3>
              <p className="text-muted-foreground">
                عند إرسالك شكوى أو اقتراح أو رسالة تواصل، يتم حفظ هذه البيانات في قاعدة بيانات المنصة. لا تُشارك مع أطراف خارجية.
              </p>
            </section>

            <div className="h-px bg-border" />

            <section>
              <h3 className="font-bold text-base text-foreground mb-2">5. حقوقك</h3>
              <p className="text-muted-foreground">
                يمكنك في أي وقت مسح بياناتك المحلية من خلال خيار "مسح البيانات المحلية" في صفحة حسابي. للاستفسار أو طلب حذف بيانات من قاعدة البيانات، تواصل معنا عبر نموذج "اتصل بنا".
              </p>
            </section>

          </CardContent>
        </Card>

      </div>
    </AppShell>
  );
}
