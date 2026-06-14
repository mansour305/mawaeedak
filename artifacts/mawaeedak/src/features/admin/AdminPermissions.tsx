import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Shield, Edit2 } from "lucide-react";

interface Role {
  id: string;
  name: string;
  label: string;
  description: string;
  permissions: string[];
  isSystem: boolean;
}

const DEFAULT_PERMISSIONS = [
  "dashboard", "users.view", "users.edit", "users.delete",
  "messages.view", "messages.create", "messages.edit", "messages.delete",
  "news.view", "news.create", "news.edit", "news.delete",
  "jobs.view", "jobs.create", "jobs.edit", "jobs.delete",
  "financial.view", "financial.create", "financial.edit", "financial.delete",
  "notifications.view", "notifications.send", "notifications.delete",
  "themes.view", "themes.edit",
  "reports.view", "reports.export",
  "settings.view", "settings.edit",
  "social.view", "social.edit",
  "complaints.view", "complaints.reply",
];

const PERM_LABELS: Record<string, string> = {
  "dashboard": "لوحة النظرة العامة",
  "users.view": "عرض المستخدمين",
  "users.edit": "تعديل المستخدمين",
  "users.delete": "حذف المستخدمين",
  "messages.view": "عرض الرسائل",
  "messages.create": "إنشاء رسالة",
  "messages.edit": "تعديل رسالة",
  "messages.delete": "حذف رسالة",
  "news.view": "عرض الأخبار",
  "news.create": "إنشاء خبر",
  "news.edit": "تعديل خبر",
  "news.delete": "حذف خبر",
  "jobs.view": "عرض الوظائف",
  "jobs.create": "إنشاء وظيفة",
  "jobs.edit": "تعديل وظيفة",
  "jobs.delete": "حذف وظيفة",
  "financial.view": "عرض المواعيد المالية",
  "financial.create": "إنشاء موعد مالي",
  "financial.edit": "تعديل موعد مالي",
  "financial.delete": "حذف موعد مالي",
  "notifications.view": "عرض الإشعارات",
  "notifications.send": "إرسال إشعار",
  "notifications.delete": "حذف إشعار",
  "themes.view": "عرض الثيمات",
  "themes.edit": "تعديل الثيمات",
  "reports.view": "عرض التقارير",
  "reports.export": "تصدير التقارير",
  "settings.view": "عرض الإعدادات",
  "settings.edit": "تعديل الإعدادات",
  "social.view": "عرض التواصل الاجتماعي",
  "social.edit": "تعديل إعدادات النشر",
  "complaints.view": "عرض الشكاوى",
  "complaints.reply": "الرد على الشكاوى",
};

const ROLES: Role[] = [
  { id: "owner", name: "owner", label: "مالك النظام", description: "صلاحيات كاملة على النظام والمنصة", permissions: [...DEFAULT_PERMISSIONS], isSystem: true },
  { id: "super_admin", name: "super_admin", label: "مدير نظام", description: "إدارة كاملة لجميع إعدادات المنصة", permissions: [...DEFAULT_PERMISSIONS], isSystem: true },
  { id: "admin", name: "admin", label: "مدير", description: "إدارة المحتوى والرسائل والإشعارات", permissions: ["dashboard", "messages.view", "messages.create", "messages.edit", "messages.delete", "news.view", "news.create", "news.edit", "jobs.view", "jobs.create", "jobs.edit", "notifications.view", "notifications.send", "complaints.view", "complaints.reply", "reports.view"], isSystem: true },
  { id: "content_manager", name: "content_manager", label: "مدير محتوى", description: "إدارة الرسائل والأخبار والوظائف", permissions: ["dashboard", "messages.view", "messages.create", "messages.edit", "news.view", "news.create", "news.edit", "news.delete", "jobs.view", "jobs.create", "jobs.edit", "jobs.delete", "complaints.view"], isSystem: false },
  { id: "support_manager", name: "support_manager", label: "مدير دعم", description: "الرد على الشكاوى والدعم الفني", permissions: ["dashboard", "complaints.view", "complaints.reply", "notifications.view", "notifications.send"], isSystem: false },
  { id: "user", name: "user", label: "مستخدم", description: "صلاحيات المستخدم العادي", permissions: ["dashboard"], isSystem: true },
];

export default function AdminPermissions() {
  const { toast } = useToast();
  const roles = ROLES;
  const [editRole, setEditRole] = useState<Role | null>(null);
  const [editPerms, setEditPerms] = useState<string[]>([]);

  const openEdit = (role: Role) => {
    setEditRole(role);
    setEditPerms([...role.permissions]);
  };

  const togglePerm = (perm: string) => {
    setEditPerms(prev => prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]);
  };

  const handleSave = () => {
    if (!editRole) return;
    toast({
      title: "تعديل الصلاحيات غير متاح من المتصفح",
      description: "إدارة الصلاحيات تتطلب endpoint إداري server-side وسياسات RLS مطبّقة.",
      variant: "destructive",
    });
  };

  const getPermGroups = () => {
    const groups: Record<string, string[]> = {};
    editPerms.forEach(p => {
      const group = p.split(".")[0];
      if (!groups[group]) groups[group] = [];
      groups[group].push(p);
    });
    return groups;
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex items-center gap-3">
        <div 
          className="w-1 h-6 rounded-full"
          style={{ background: "linear-gradient(180deg, hsl(38 62% 52%), hsl(32 55% 42%))" }}
        />
        <h1 className="text-2xl font-extrabold" style={{ color: "hsl(22 62% 18%)" }}>
          الصلاحيات
        </h1>
      </div>

      {/* Roles list */}
      <div className="grid gap-4">
        {roles.map(role => (
          <Card key={role.id} className={`border-border shadow-sm ${role.isSystem ? "border-l-4 border-l-primary" : ""}`}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold">{role.label}</h3>
                      {role.isSystem && <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded">أساسي</span>}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{role.description}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {role.permissions.slice(0, 5).map(p => (
                        <span key={p} className="text-[10px] bg-muted px-1.5 py-0.5 rounded">{PERM_LABELS[p] ?? p}</span>
                      ))}
                      {role.permissions.length > 5 && (
                        <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded">+{role.permissions.length - 5}</span>
                      )}
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="shrink-0" onClick={() => openEdit(role)} disabled={role.isSystem && role.id === "owner"}>
                  {role.id === "owner" ? <Shield className="w-4 h-4 text-muted-foreground" /> : <Edit2 className="w-4 h-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Permissions Dialog */}
      <Dialog open={!!editRole} onOpenChange={open => { if (!open) setEditRole(null); }}>
        <DialogContent className="rtl max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تعديل صلاحيات: {editRole?.label}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {DEFAULT_PERMISSIONS.filter(p => p.includes(".")).map(perm => (
              <div key={perm} className="flex items-center justify-between">
                <Label htmlFor={perm} className="text-sm cursor-pointer">{PERM_LABELS[perm] ?? perm}</Label>
                <Switch
                  id={perm}
                  checked={editPerms.includes(perm)}
                  onCheckedChange={() => togglePerm(perm)}
                  disabled
                />
              </div>
            ))}
            <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              إدارة الصلاحيات للقراءة فقط داخل المتصفح. أي تعديل يتطلب endpoint إداري server-side.
            </p>
            <Button className="w-full mt-4" onClick={handleSave} disabled>
              حفظ الصلاحيات
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

