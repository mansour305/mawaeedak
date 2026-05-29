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
  useListPublicEvents, 
  useCreatePublicEvent, 
  useUpdatePublicEvent, 
  useDeletePublicEvent,
  getListPublicEventsQueryKey 
} from "@workspace/api-client-react";
import { Plus, Edit2, Trash2, Loader2, Calendar } from "lucide-react";

export default function AdminEvents() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: events, isLoading } = useListPublicEvents();
  
  const createEvent = useCreatePublicEvent();
  const updateEvent = useUpdatePublicEvent();
  const deleteEvent = useDeletePublicEvent();

  const [isOpen, setIsOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [category, setCategory] = useState("عام");
  const [isActive, setIsActive] = useState(true);

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const openAdd = () => {
    setIsEdit(false); setEditId(null);
    setTitle(""); setDescription(""); setEventDate(""); setCategory("عام"); setIsActive(true);
    setIsOpen(true);
  };

  const openEdit = (ev: any) => {
    setIsEdit(true); setEditId(ev.id);
    setTitle(ev.title); setDescription(ev.description || ""); setEventDate(ev.event_date); 
    setCategory(ev.category); setIsActive(ev.is_active);
    setIsOpen(true);
  };

  const handleSave = () => {
    if (!title || !eventDate) { toast({ title: "خطأ", description: "العنوان والتاريخ مطلوبان", variant: "destructive" }); return; }

    const data = { title, description: description || undefined, event_date: eventDate, category, is_active: isActive };

    if (isEdit && editId) {
      updateEvent.mutate({ id: editId, data }, {
        onSuccess: () => {
          toast({ title: "تم التعديل" }); setIsOpen(false);
          queryClient.invalidateQueries({ queryKey: getListPublicEventsQueryKey() });
        }
      });
    } else {
      createEvent.mutate({ data }, {
        onSuccess: () => {
          toast({ title: "تمت الإضافة" }); setIsOpen(false);
          queryClient.invalidateQueries({ queryKey: getListPublicEventsQueryKey() });
        }
      });
    }
  };

  const handleDelete = () => {
    if (!deleteId) return;
    deleteEvent.mutate({ id: deleteId }, {
      onSuccess: () => {
        toast({ title: "تم الحذف" }); setIsDeleteOpen(false);
        queryClient.invalidateQueries({ queryKey: getListPublicEventsQueryKey() });
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">المواعيد العامة والإجازات</h2>
        <Button onClick={openAdd} size="sm"><Plus className="w-4 h-4 ml-1" /> إضافة موعد</Button>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="rtl max-w-[400px] rounded-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEdit ? "تعديل الموعد" : "موعد عام جديد"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>عنوان الموعد</Label>
              <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="مثال: إجازة عيد الفطر" />
            </div>
            <div className="space-y-2">
              <Label>الوصف (اختياري)</Label>
              <Input value={description} onChange={e => setDescription(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>تاريخ الموعد</Label>
                <Input type="date" value={eventDate} onChange={e => setEventDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>التصنيف</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent className="rtl">
                    <SelectItem value="عام">عام</SelectItem>
                    <SelectItem value="دراسة">دراسة</SelectItem>
                    <SelectItem value="إجازة">إجازة</SelectItem>
                    <SelectItem value="وطني">وطني</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label>مفعّل</Label>
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
            <Card key={ev.id} className={`border-border shadow-sm ${!ev.is_active ? 'opacity-60' : ''}`}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    <h4 className="font-bold text-sm">{ev.title}</h4>
                  </div>
                  <span className="text-[10px] bg-secondary text-secondary-foreground px-2 py-0.5 rounded">{ev.category}</span>
                </div>
                <div className="text-xs text-muted-foreground mt-2 mb-3">التاريخ: {ev.event_date}</div>
                <div className="flex justify-end gap-1 border-t border-border pt-3">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => openEdit(ev)}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => { setDeleteId(ev.id); setIsDeleteOpen(true); }}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center p-8 bg-card rounded-xl border border-dashed border-border text-muted-foreground">
          لا توجد مواعيد عامة
        </div>
      )}

      <ConfirmDialog 
        open={isDeleteOpen} onOpenChange={setIsDeleteOpen}
        title="حذف الموعد" description="هل أنت متأكد من الحذف؟"
        onConfirm={handleDelete}
      />
    </div>
  );
}
