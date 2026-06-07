import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Search, Loader2, Users as UsersIcon, Ban, CheckCircle, MoreHorizontal } from "lucide-react";
import { useStore } from "@/hooks/useStore";

interface User {
  id: string;
  name: string;
  email: string;
  city: string;
  role: string;
  status: "active" | "banned" | "pending";
  created_at: string;
}

const ROLES = [
  { value: "user", label: "مستخدم" },
  { value: "admin", label: "مدير" },
  { value: "super_admin", label: "مدير نظام" },
];

const STATUS_OPTIONS = [
  { value: "active", label: "نشط", color: "bg-emerald-500/10 text-emerald-600" },
  { value: "banned", label: "محظور", color: "bg-red-500/10 text-red-600" },
  { value: "pending", label: "قيد الانتظار", color: "bg-amber-500/10 text-amber-600" },
];

export default function AdminMembers() {
  const { toast } = useToast();
  const { user: currentUser } = useStore();

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [detail, setDetail] = useState<User | null>(null);
  const [editRole, setEditRole] = useState("user");
  const [editStatus, setEditStatus] = useState("active");

  // Mock users data - replace with real API when available
  const [users, setUsers] = useState<User[]>([
    { id: "1", name: "أحمد محمد", email: "ahmed@example.com", city: "الرياض", role: "user", status: "active", created_at: "2024-01-15" },
    { id: "2", name: "سارة خالد", email: "sara@example.com", city: "جدة", role: "user", status: "active", created_at: "2024-02-20" },
    { id: "3", name: "عبدالله سعد", email: "abdullah@example.com", city: "الدمام", role: "admin", status: "active", created_at: "2024-03-05" },
  ]);
  const [isLoading] = useState(false);

  const filtered = useMemo(() => {
    return users.filter(u => {
      if (roleFilter !== "all" && u.role !== roleFilter) return false;
      if (statusFilter !== "all" && u.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!u.name.toLowerCase().includes(q) && !u.email.toLowerCase().includes(q) && !u.city.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [users, roleFilter, statusFilter, search]);

  const counts = useMemo(() => ({
    total: users.length,
    active: users.filter(u => u.status === "active").length,
    banned: users.filter(u => u.status === "banned").length,
    admins: users.filter(u => u.role === "admin" || u.role === "super_admin").length,
  }), [users]);

  const openDetail = (u: User) => {
    setDetail(u);
    setEditRole(u.role);
    setEditStatus(u.status);
  };

  const handleSave = () => {
    if (!detail) return;
    setUsers(prev => prev.map(u => u.id === detail.id ? { ...u, role: editRole, status: editStatus as User["status"] } : u));
    toast({ title: "تم تحديث بيانات المستخدم" });
    setDetail(null);
  };

  const handleToggleBan = (u: User) => {
    const newStatus = u.status === "banned" ? "active" : "banned";
    setUsers(prev => prev.map(x => x.id === u.id ? { ...x, status: newStatus } : x));
    toast({ title: newStatus === "banned" ? "تم حظر المستخدم" : "تم فك حظر المستخدم" });
  };

  const statusMeta = (status: string) => STATUS_OPTIONS.find(s => s.value === status) ?? STATUS_OPTIONS[0];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">إدارة المستخدمين</h2>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "الإجمالي", value: counts.total, icon: UsersIcon },
          { label: "نشطون", value: counts.active, icon: CheckCircle },
          { label: "محظورون", value: counts.banned, icon: Ban },
          { label: "مديرون", value: counts.admins, icon: UsersIcon },
        ].map(s => (
          <Card key={s.label} className="border-border shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <s.icon className="w-5 h-5 text-primary" />
              <div>
                <div className="text-2xl font-extrabold">{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-2.5 w-4 h-4 text-muted-foreground" />
          <Input placeholder="بحث بالاسم أو البريد أو المدينة..." value={search} onChange={e => setSearch(e.target.value)} className="pr-9" />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="md:w-36"><SelectValue placeholder="الدور" /></SelectTrigger>
          <SelectContent className="rtl">
            <SelectItem value="all">كل الأدوار</SelectItem>
            {ROLES.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="md:w-36"><SelectValue placeholder="الحالة" /></SelectTrigger>
          <SelectContent className="rtl">
            <SelectItem value="all">كل الحالات</SelectItem>
            {STATUS_OPTIONS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card className="border-border shadow-sm overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-10 text-center"><Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" /></div>
          ) : filtered.length === 0 ? (
            <div className="p-10 text-center text-muted-foreground">لا يوجد مستخدمون</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-right rtl">
                <thead className="bg-muted/50 text-muted-foreground border-b border-border">
                  <tr>
                    <th className="px-4 py-3 font-medium">الاسم</th>
                    <th className="px-4 py-3 font-medium">البريد</th>
                    <th className="px-4 py-3 font-medium">المدينة</th>
                    <th className="px-4 py-3 font-medium">الدور</th>
                    <th className="px-4 py-3 font-medium">الحالة</th>
                    <th className="px-4 py-3 font-medium">تاريخ التسجيل</th>
                    <th className="px-4 py-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map(u => {
                    const sm = statusMeta(u.status);
                    return (
                      <tr key={u.id} className="hover:bg-muted/30">
                        <td className="px-4 py-3 font-medium text-foreground">{u.name}</td>
                        <td className="px-4 py-3 text-muted-foreground dir-ltr">{u.email}</td>
                        <td className="px-4 py-3">{u.city}</td>
                        <td className="px-4 py-3">
                          <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs">
                            {ROLES.find(r => r.value === u.role)?.label ?? u.role}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded text-xs ${sm.color}`}>{sm.label}</span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{u.created_at}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleToggleBan(u)} title={u.status === "banned" ? "فك الحظر" : "حظر"}>
                              {u.status === "banned" ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <Ban className="w-4 h-4 text-red-500" />}
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openDetail(u)}>
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!detail} onOpenChange={open => { if (!open) setDetail(null); }}>
        <DialogContent className="rtl max-w-[400px] rounded-xl">
          <DialogHeader><DialogTitle>تعديل المستخدم</DialogTitle></DialogHeader>
          {detail && (
            <div className="space-y-4 py-4">
              <div className="text-center mb-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 mx-auto flex items-center justify-center mb-2">
                  <UsersIcon className="w-8 h-8 text-primary" />
                </div>
                <div className="font-bold text-lg">{detail.name}</div>
                <div className="text-sm text-muted-foreground dir-ltr">{detail.email}</div>
              </div>
              <div className="space-y-2">
                <Label>الدور</Label>
                <Select value={editRole} onValueChange={setEditRole}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent className="rtl">
                    {ROLES.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>الحالة</Label>
                <Select value={editStatus} onValueChange={setEditStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent className="rtl">
                    {STATUS_OPTIONS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full" onClick={handleSave}>حفظ التعديلات</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
