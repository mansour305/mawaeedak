import { useState } from "react";
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
import { 
  useListFinancialEvents, 
  useCreateFinancialEvent, 
  useUpdateFinancialEvent, 
  useDeleteFinancialEvent,
  getListFinancialEventsQueryKey 
} from "@workspace/api-client-react";
import { Plus, Edit2, Trash2, Loader2, Wallet, Receipt } from "lucide-react";

export default function AdminFinancial() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filterType, setFilterType] = useState("all");
  const { data: events, isLoading } = useListFinancialEvents(filterType !== 'all' ? { type: filterType } : undefined);
  
  const createEvent = useCreateFinancialEvent();
  const updateEvent = useUpdateFinancialEvent();
  const deleteEvent = useDeleteFinancialEvent();

  const [isOpen, setIsOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  
  const [name, setName] = useState("");
  const [type, setType] = useState("salary");
  const [nextDate, setNextDate] = useState("");
  const [amount, setAmount] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const openAdd = () => {
    setIsEdit(false); setEditId(null);
    setName(""); setType("salary"); setNextDate(""); setAmount(""); setIsActive(true);
    setIsOpen(true);
  };

  const openEdit = (ev: any) => {
    setIsEdit(true); setEditId(ev.id);
    setName(ev.name); setType(ev.type); setNextDate(ev.next_date); 
    setAmount(ev.amount ? String(ev.amount) : ""); setIsActive(ev.is_active);
    setIsOpen(true);
  };

  const handleSave = () => {
    if (!name || !nextDate) { toast({ title: "خطأ", description: "الاسم والتاريخ مطلوبان", variant: "destructive" }); return; }

    const data = { 
      name, type, next_date: nextDate, 
      amount: amount ? Number(amount) : undefined, 
      is_active: isActive 
    };

    if (isEdit && editId) {
      updateEvent.mutate({ id: editId, data }, {
        onSuccess: () => {
          toast({ title: "تم التعديل" }); setIsOpen(false);
          queryClient.invalidateQueries({ queryKey: getListFinancialEventsQueryKey() });
        }
      });
    } else {
      createEvent.mutate({ data }, {
        onSuccess: () => {
          toast({ title: "تمت الإضافة" }); setIsOpen(false);
          queryClient.invalidateQueries({ queryKey: getListFinancialEventsQueryKey() });
        }
      });
    }
  };

  const handleDelete = () => {
    if (!deleteId) return;
    deleteEvent.mutate({ id: deleteId }, {
      onSuccess: () => {
        toast({ title: "تم الحذف" }); setIsDeleteOpen(false);
        queryClient.invalidateQueries({ queryKey: getListFinancialEventsQueryKey() });
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">المواعيد المالية</h2>
        <Button onClick={openAdd} size="sm"><Plus className="w-4 h-4 ml-1" /> إضافة موعد</Button>
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
            <Button className="w-full" onClick={handleSave} disabled={createEvent.isPending || updateEvent.isPending}>
              {(createEvent.isPending || updateEvent.isPending) ? <Loader2 className="w-4 h-4 animate-spin" /> : "حفظ"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {isLoading ? (
        <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : events && events.length > 0 ? (
        <div className="space-y-3">
          {events.map(ev => (
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
      />
    </div>
  );
}
