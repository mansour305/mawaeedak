import { Card, CardContent } from "@/components/ui/card";

export default function AdminPermissions() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">الصلاحيات والأدوار</h2>
      </div>

      <Card className="border-border shadow-sm bg-primary/5 border-primary/20">
        <CardContent className="p-6 text-right text-primary font-medium leading-relaxed">
          الصلاحيات والأدوار مُطبَّقة عبر نظام تسجيل الدخول، مع عزل بيانات المستخدمين حسب الحساب.
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card className="border-border shadow-sm">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-primary mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              مدير نظام (Super Admin)
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              له الصلاحية الكاملة لإدارة جميع إعدادات المنصة، إضافة وتعديل الرسائل، إدارة المواعيد المالية للمنصة، وإرسال الإشعارات لجميع المستخدمين. هذا الدور مخصص لملاك المنصة فقط.
            </p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-accent mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent" />
              مستخدم مسجل (User)
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              يمكنه إدارة مواعيده الخاصة، تفضيلاته، صيغة الوقت، المدينة، التنبيهات، والوصول إلى خدمات التطبيق والمراكز. لا يمكنه دخول لوحة المالك أو رؤية بيانات المستخدمين الآخرين.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
