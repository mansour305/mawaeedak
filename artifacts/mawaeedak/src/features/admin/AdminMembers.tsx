import { Card, CardContent } from "@/components/ui/card";

export default function AdminMembers() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">إدارة الأعضاء</h2>
      </div>

      <Card className="border-border shadow-sm bg-primary/5 border-primary/20">
        <CardContent className="p-6 text-center text-primary font-medium leading-relaxed">
          إدارة الأعضاء تعرض المستخدمين المسجلين عبر نظام المصادقة. للتحكم الكامل في الأعضاء، استخدم لوحة Supabase مباشرة أو من خلال إعدادات المنصة.
        </CardContent>
      </Card>

      <Card className="border-border shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-right rtl">
              <thead className="bg-muted/50 text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-4 py-3 font-medium">الاسم</th>
                  <th className="px-4 py-3 font-medium">المدينة</th>
                  <th className="px-4 py-3 font-medium">المنصة</th>
                  <th className="px-4 py-3 font-medium">تاريخ التسجيل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium text-foreground">أحمد محمد</td>
                  <td className="px-4 py-3">الرياض</td>
                  <td className="px-4 py-3"><span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs">iOS</span></td>
                  <td className="px-4 py-3 text-muted-foreground">2024-03-01</td>
                </tr>
                <tr className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium text-foreground">سارة خالد</td>
                  <td className="px-4 py-3">جدة</td>
                  <td className="px-4 py-3"><span className="bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded text-xs">Android</span></td>
                  <td className="px-4 py-3 text-muted-foreground">2024-03-05</td>
                </tr>
                <tr className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium text-foreground">عبدالله سعد</td>
                  <td className="px-4 py-3">الدمام</td>
                  <td className="px-4 py-3"><span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs">iOS</span></td>
                  <td className="px-4 py-3 text-muted-foreground">2024-03-10</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
