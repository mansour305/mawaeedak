import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/layout/ConfirmDialog";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase, isSupabaseEnabled } from "@/lib/supabase";
import {
  useCreateOfficialFinancialDate,
  useUpdateOfficialFinancialDate,
  useDeleteOfficialFinancialDate,
} from "@/hooks/useOfficialData";
import { Plus, Edit2, Trash2, Loader2, AlertTriangle } from "lucide-react";

/**
 * AdminOfficialFinancial — a simple admin page for managing official
 * financial dates. Allows listing all records (confirmed and unconfirmed),
 * creating new entries, editing existing ones, and deleting entries. Uses
 * Supabase directly for listing and React Query mutations for writes.
 */
export default function AdminOfficialFinancial() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  // Query all official financial dates regardless of confirmation status
  const { data: events, isLoading } = useQuery({
    queryKey: ["admin-official-financial"],
    queryFn: async () => {
      if (!isSupabaseEnabled || !supabase) throw new Error("Supabase غير مفعّل");
      const { data, error } = await supabase
        .from("official_financial_dates")
        .select("*")
        .order("occurrence_date_gregorian", { ascending: true });
      if (error) throw error;
      return data;
    },
    retry: 1,
    staleTime: 60_000,
  });

  const createEvent = useCreateOfficialFinancialDate();
  const updateEvent = useUpdateOfficialFinancialDate();
  const deleteEvent = useDeleteOfficialFinancialDate();

  // Dialog state for add/edit
  const [isOpen, setIsOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  // Form fields
  const [eventKey, setEventKey] = useState("");
  const [eventName, setEventName] = useState("");
  const [dateGreg, setDateGreg] = useState("");
  const [dateHijri, setDateHijri] = useState("");
  const [sourceAuthority, setSourceAuthority] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [isConfirmed, setIsConfirmed] = useState(true);
  // Delete confirmation
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const openAdd = () => {
    setIsEdit(false);
    setEditId(null);
    setEventKey("");
    setEventName("");
    setDateGreg("");
    setDateHijri("");
    setSourceAuthority("");
    setSourceUrl("");
    setIsConfirmed(true);
    setIsOpen(true);
  };

  const openEdit = (ev: any) => {
    setIsEdit(true);
    setEditId(ev.id);
    setEventKey(ev.event_key || "");
    setEventName(ev.event_name_ar || "");
    setDateGreg(ev.occurrence_date_gregorian || "");
    setDateHijri(ev.occurrence_date_hijri || "");
    setSourceAuthority(ev.source_authority || "");
    setSourceUrl(ev.source_url || "");
    setIsConfirmed(ev.is_confirmed ?? true);
    setIsOpen(true);
  };

  const handleSave = () => {
    if (!eventKey || !eventName || !dateGreg) {
      toast({ title: "خطأ", description: "يجب إدخال المفتاح والاسم والتاريخ الميلادي", variant: "destructive" });
      return;
    }
    const data = {
      event_key: eventKey,
      event_name_ar: eventName,
      occurrence_date_gregorian: dateGreg,
      occurrence_date_hijri: dateHijri || null,
      source_authority: sourceAuthority || null,
      source_url: sourceUrl || null,
      is_confirmed: isConfirmed,
    } as Record<string, any>;
    if (isEdit && editId) {
      updateEvent.mutate({ id: editId, data }, {
        onSuccess: () => {
          toast({ title: "تم التعديل" });
          setIsOpen(false);
          queryClient.invalidateQueries({ queryKey: ["admin-official-financial"] });
        },
        onError: (error: any) => {
          toast({ title: "فشل التعديل", description: error.message || "خطأ غير معروف", variant: "destructive" });
        },
      });
    } else {
      createEvent.mutate(data, {
        onSuccess: () => {
          toast({ title: "تمت الإضافة" });
          setIsOpen(false);
          queryClient.invalidateQueries({ queryKey: ["admin-official-financial"] });
        },
        onError: (error: any) => {
          toast({ title: "فشل الإضافة", description: error.message || "خطأ غير معروف", variant: "destructive" });
        },
      });
    }
  };

  const handleDelete = () => {
    if (!deleteId) return;
    deleteEvent.mutate(deleteId, {
      onSuccess: () => {
        toast({ title: "تم الحذف" });
        setIsDeleteOpen(false);
        queryClient.invalidateQueries({ queryKey: ["admin-official-financial"] });
      },
      onError: (error: any) => {
        toast({ title: "فشل الحذف", description: error.message || "خطأ غير معروف", variant: "destructive" });
      },
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">التواريخ المالية الرسمية</h2>
        <Button onClick={openAdd} size="sm">
          <Plus className="w-4 h-4 ml-1" /> إضافة تاريخ
        </Button>
      </div>

      {/* Add/Edit dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="rtl max-w-[450px] rounded-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEdit ? "تعديل التاريخ" : "تاريخ مالي جديد"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>المفتاح الفريد</Label>
              <Input value={eventKey} onChange={e => setEventKey(e.target.value)} placeholder="مثال: gov_salary" />
            </div>
            <div className="space-y-2">
              <Label>اسم الحدث (بالعربية)</Label>
              <Input value={eventName} onChange={e => setEventName(e.target.value)} placeholder="مثال: الراتب الحكومي" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>التاريخ الميلادي</Label>
                <Input type="date" value={dateGreg} onChange={e => setDateGreg(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>التاريخ الهجري (اختياري)</Label>
                <Input type="text" value={dateHijri} onChange={e => setDateHijri(e.target.value)} placeholder="مثال: 1448-01-27" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>الجهة الرسمية (اختياري)</Label>
              <Input value={sourceAuthority} onChange={e => setSourceAuthority(e.target.value)} placeholder="مثال: وزارة المالية" />
            </div>
            <div className="space-y-2">
              <Label>رابط المصدر (اختياري)</Label>
              <Input value={sourceUrl} onChange={e => setSourceUrl(e.target.value)} placeholder="https://" />
            </div>
            <div className="flex items-center justify-between">
              <Label>مؤكد</Label>
              <Switch checked={isConfirmed} onCheckedChange={setIsConfirmed} />
            </div>
            <Button className="w-full" onClick={handleSave} disabled={createEvent.isPending || updateEvent.isPending}>
              {createEvent.isPending || updateEvent.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "حفظ"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* List */}
      {isLoading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : events && events.length > 0 ? (
        <div className="space-y-3">
          {(events as any[]).map(ev => (
            <Card key={ev.id} className={`border-border shadow-sm overflow-hidden ${!ev.is_confirmed ? 'opacity-70' : ''}`}>
              <CardContent className="p-4 w-full">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-bold">{ev.event_name_ar}</span>
                    <span className="text-xs text-muted-foreground">{ev.event_key}</span>
                  </div>
                  <span className="text-xs font-bold text-primary">{ev.occurrence_date_gregorian}</span>
                </div>
                <div className="flex justify-between items-center border-t border-border pt-3 mt-2">
                  <div className="text-xs text-muted-foreground">
                    {ev.is_confirmed ? "مؤكد" : "غير مؤكد"}
                  </div>
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
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center p-8 bg-card rounded-xl border border-dashed border-border text-muted-foreground">
          لا توجد تواريخ رسمية
        </div>
      )}

      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="حذف التاريخ المالي"
        description="هل أنت متأكد من الحذف؟ سوف يختفي هذا الحدث من قائمة التواريخ الرسمية."
        onConfirm={handleDelete}
      />
    </div>
  );
}