import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/layout/ConfirmDialog";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useGatewayFinancialEvents, gwQueryKeys } from "@/hooks/useGatewayData";
import { gwCreateFinancialEvent, gwUpdateFinancialEvent, gwDeleteFinancialEvent } from "@/lib/dataGateway";
import { Plus, Edit2, Trash2, Loader2, Wallet, Receipt } from "lucide-react";

export default function AdminFinancial() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filterType, setFilterType] = useState("all");
  const { data: allEvents, isLoading } = useGatewayFinancialEvents();
  const events = useMemo(() => {
    const rows = Array.isArray(allEvents) ? allEvents : [];
    if (filterType === "all") return rows;
    return rows.filter((event: any) => event.type === filterType);
  }, [allEvents, filterType]);

  const [isOpen, setIsOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const [name, setName] = useState("");
  const [type, setType] = useState("salary");
  const [nextDate, setNextDate] = useState("");
  const [amount, setAmount] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const invalidateFinancial = () => {
    queryClient.invalidateQueries({ queryKey: gwQueryKeys.financialEvents });
    queryClient.invalidateQueries({ queryKey: gwQueryKeys.financialCountdown });
  };

  const openAdd = () => {
    setIsEdit(false);
    setEditId(null);
    setName("");
    setType("salary");
    setNextDate("");
    setAmount("");
    setIsActive(true);
    setIsOpen(true);
  };

  const openEdit = (ev: any) => {
    setIsEdit(true);
    setEditId(ev.id);
    setName(ev.name);
    setType(ev.type);
    setNextDate(ev.next_date);
    setAmount(ev.amount ? String(ev.amount) : "");
    setIsActive(ev.is_active);
    setIsOpen(true);
  };

  const handleSave = async () => {
    if (!name.trim() || !nextDate) {
      toast({ title: "خطأ", description: "الاسم والتاريخ مطلوبان", variant: "destructive" });
      return;
    }

    const data = {
      name: name.trim(),
      type,
      next_date: nextDate,
      amount: amount ? Number(amount) : null,
      is_active: isActive,
    };

    setIsSaving(true);
    try {
      const result = isEdit && editId
        ? await gwUpdateFinancialEvent(editId, data)
        : await gwCreateFinancialEvent(data);

      if (!result.success) {
        toast({ title: "فشل الحفظ", description: result.error ?? "تعذر حفظ الموعد المالي", variant: "destructive" });
        return;
      }

      toast({ title: isEdit ? "تم التعديل" : "تمت الإضافة" });
      setIsOpen(false);
      invalidateFinancial();
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const result = await gwDeleteFinancialEvent(deleteId);
      if (!result.success) {
        toast({ title: "فشل الحذف", description: result.error ?? "تعذر حذف الموعد المالي", variant: "destructive" });
        return;
      }
      toast({ title: "تم الحذف" });
      setIsDeleteOpen(false);
      setDeleteId(null);
      invalidateFinancial();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div 
            className="w-1 h-6 rounded-full"
            style={{ background: "linear-gradient(180deg, hsl(38 62% 52%), hsl(32 55% 42%))" }}
          />
          <h1 className="text-2xl font-extrabold" style={{ color: "hsl(22 62% 18%)" }}>
            الرواتب والدعم
          </h1>
        </div>
        <Button onClick={openAdd} size="sm">
          <Plus className="w-4 h-4 ml-1" /> إضافة موعد
        </Button>
      </div>
      
      <Select value={filterType} onValueChange={setFilterType}>
        <SelectTrigger className="w-full bg-card">
          <SelectValue placeholder="تصفية حسب النوع" />
        </SelectTrigger>
        <SelectContent className="rtl">
          <SelectItem value="all">الكل</SelectItem>
          <SelectItem value="salary">رواتب</SelectItem>
          <SelectItem value="support">دعم حكومي</SelectItem>
          <SelectItem value="bill">فواتير والتزامات</SelectItem>
        </SelectContent>
      </Select>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="rtl max-w-[400px] rounded-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEdit ? "تعديل الموعد المالي" : "موعد مالي جديد"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>اسم الموعد / الجهة</Label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="مثال: حساب المواطن" />
            </div>
            <div className="space-y-2">
              <Label>النوع</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent className="rtl">
                  <SelectItem value="salary">راتب</SelectItem>
                  <SelectItem value="support">دعم</SelectItem>
                  <SelectItem value="bill">فاتورة/التزام</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>تاريخ الاستحقاق</Label>
                <Input type="date" value={nextDate} onChange={e => setNextDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>المبلغ (اختياري)</Label>
                <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label>مفعّل ويظهر للجميع</Label>
              <Switch checked={isActive} onCheckedChange={setIsActive} />
            </div>
            <Button className="w-full" onClick={handleSave} disabled={isSaving}>
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "حفظ"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {isLoading ? (
        <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : events.length > 0 ? (
        <div className="space-y-3">
          {events.map((ev: any) => (
            <Card key={ev.id} className={`border-border shadow-sm overflow-hidden ${!ev.is_active ? 'opacity-60' : ''}`}>
              <div className="flex border-r-4" style={{ borderRightColor: ev.type === 'salary' ? 'hsl(var(--primary))' : ev.type === 'bill' ? 'hsl(var(--destructive))' : 'hsl(var(--accent))' }}>
                <CardContent className="p-4 w-full">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      {ev.type === 'bill' ? <Receipt className="w-4 h-4 text-destructive" /> : <Wallet className="w-4 h-4 text-primary" />}
                      <h4 className="font-bold text-sm">{ev.name}</h4>
                    </div>
                    {ev.amount && <span className="font-bold text-sm text-primary">{ev.amount} ر.س</span>}
                  </div>
                  <div className="flex justify-between items-center border-t border-border pt-3 mt-2">
                    <div className="text-xs text-muted-foreground">التاريخ: {ev.next_date}</div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => openEdit(ev)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => { setDeleteId(ev.id); setIsDeleteOpen(true); }}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center p-8 bg-card rounded-xl border border-dashed border-border text-muted-foreground">
          لا توجد مواعيد مالية
        </div>
      )}

      <ConfirmDialog 
        open={isDeleteOpen} onOpenChange={setIsDeleteOpen}
        title="حذف الموعد المالي" description="هل أنت متأكد من الحذف؟ هذا سيؤثر على عدادات جميع المستخدمين."
        onConfirm={handleDelete}
        confirmText={isDeleting ? "جاري الحذف..." : "تأكيد"}
      />
    </div>
  );
}

