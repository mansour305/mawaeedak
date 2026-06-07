import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/layout/ConfirmDialog";
import { showTopNotification } from "@/components/layout/TopNotificationBanner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase, isSupabaseEnabled } from "@/lib/supabase";
import {
  useCreateOfficialFinancialDate,
  useUpdateOfficialFinancialDate,
  useDeleteOfficialFinancialDate,
} from "@/hooks/useOfficialData";
import { Plus, Edit2, Trash2, Loader2, CalendarClock, ArrowRight, ArrowLeft, RefreshCw } from "lucide-react";

/**
 * AdminOfficialFinancial — a simple admin page for managing official
 * financial dates. Allows listing all records (confirmed and unconfirmed),
 * creating new entries, editing existing ones, adjusting dates, and deleting entries.
 * Uses Supabase directly for listing and React Query mutations for writes.
 */
export default function AdminOfficialFinancial() {
  const queryClient = useQueryClient();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Query all official financial dates regardless of confirmation status
  const { data: events, isLoading } = useQuery({
    queryKey: ["admin-official-financial"],
    queryFn: async () => {
      if (!isSupabaseEnabled || !supabase) throw new Error("Supabase غير مفعّل");
      
      // Get current user for audit
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
      
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
  
  // Adjustment dialog state
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [adjustEvent, setAdjustEvent] = useState<any>(null);
  const [adjustType, setAdjustType] = useState<"advance" | "delay" | "correction">("delay");
  const [adjustReason, setAdjustReason] = useState("");
  const [adjustNewDate, setAdjustNewDate] = useState("");
  const [isAdjusting, setIsAdjusting] = useState(false);
  
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

  const openAdjust = (ev: any) => {
    setAdjustEvent(ev);
    setAdjustType("delay");
    setAdjustReason("");
    setAdjustNewDate(ev.occurrence_date_gregorian || "");
    setIsAdjustOpen(true);
  };

  const handleSave = () => {
    if (!eventKey || !eventName || !dateGreg) {
      showTopNotification("يجب إدخال المفتاح والاسم والتاريخ الميلادي", "error");
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
          showTopNotification("تم التعديل بنجاح", "success");
          setIsOpen(false);
          queryClient.invalidateQueries({ queryKey: ["admin-official-financial"] });
        },
        onError: (error: any) => {
          showTopNotification(error.message || "فشل التعديل", "error");
        },
      });
    } else {
      createEvent.mutate(data, {
        onSuccess: () => {
          showTopNotification("تمت الإضافة بنجاح", "success");
          setIsOpen(false);
          queryClient.invalidateQueries({ queryKey: ["admin-official-financial"] });
        },
        onError: (error: any) => {
          showTopNotification(error.message || "فشل الإضافة", "error");
        },
      });
    }
  };

  const handleDelete = () => {
    if (!deleteId) return;
    deleteEvent.mutate(deleteId, {
      onSuccess: () => {
        showTopNotification("تم الحذف بنجاح", "success");
        setIsDeleteOpen(false);
        queryClient.invalidateQueries({ queryKey: ["admin-official-financial"] });
      },
      onError: (error: any) => {
        showTopNotification(error.message || "فشل الحذف", "error");
      },
    });
  };

  const handleAdjust = async () => {
    if (!adjustEvent || !adjustNewDate || !adjustReason) {
      showTopNotification("يجب إدخال التاريخ والسبب", "error");
      return;
    }

    setIsAdjusting(true);
    
    try {
      if (!isSupabaseEnabled || !supabase) {
        showTopNotification("Supabase غير مفعّل", "error");
        setIsAdjusting(false);
        return;
      }

      const oldDate = adjustEvent.occurrence_date_gregorian;
      
      // 1. Record adjustment in financial_date_adjustments
      const { error: adjustError } = await supabase
        .from("financial_date_adjustments")
        .insert({
          program_key: adjustEvent.event_key,
          event_id: adjustEvent.id,
          old_date: oldDate,
          new_date: adjustNewDate,
          adjustment_type: adjustType,
          reason: adjustReason,
          approval_status: "approved",
          applied_at: new Date().toISOString(),
          updated_by: currentUserId,
        });

      if (adjustError) throw adjustError;

      // 2. Update the official financial date
      const { error: updateError } = await supabase
        .from("official_financial_dates")
        .update({
          occurrence_date_gregorian: adjustNewDate,
          adjustment_status: adjustType,
          adjustment_reason: adjustReason,
          updated_at: new Date().toISOString(),
        })
        .eq("id", adjustEvent.id);

      if (updateError) throw updateError;

      // 3. Create notification for admin
      await supabase
        .from("notifications")
        .insert({
          user_id: currentUserId,
          type: "system",
          title: `تم تعديل ${adjustEvent.event_name_ar}`,
          body: `تم ${adjustType === 'advance' ? 'تقديم' : adjustType === 'delay' ? 'تأجيل' : 'تصحيح'} الموعد من ${oldDate} إلى ${adjustNewDate}`,
          is_read: false,
        });

      showTopNotification(`تم ${adjustType === 'advance' ? 'تقديم' : adjustType === 'delay' ? 'تأجيل' : 'تصحيح'} الموعد بنجاح`, "success");
      setIsAdjustOpen(false);
      queryClient.invalidateQueries({ queryKey: ["admin-official-financial"] });
    } catch (err: any) {
      showTopNotification(err.message || "فشل تعديل الموعد", "error");
    } finally {
      setIsAdjusting(false);
    }
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

      {/* Adjustment dialog */}
      <Dialog open={isAdjustOpen} onOpenChange={setIsAdjustOpen}>
        <DialogContent className="rtl max-w-[450px] rounded-xl">
          <DialogHeader>
            <DialogTitle>تعديل موعد {adjustEvent?.event_name_ar}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                <strong>التاريخ الحالي:</strong> {adjustEvent?.occurrence_date_gregorian}
              </p>
              {adjustEvent?.adjustment_status && adjustEvent?.adjustment_status !== 'none' && (
                <p className="text-xs text-amber-600 mt-1">
                  آخر تعديل: {adjustEvent?.adjustment_reason}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label>نوع التعديل</Label>
              <Select value={adjustType} onValueChange={(v: "advance" | "delay" | "correction") => setAdjustType(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent className="rtl">
                  <SelectItem value="advance">تقديم (تغيير التاريخ لوقت أبكر)</SelectItem>
                  <SelectItem value="delay">تأجيل (تغيير التاريخ لوقت لاحق)</SelectItem>
                  <SelectItem value="correction">تصحيح (تصحيح خطأ في التاريخ)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>التاريخ الجديد</Label>
              <Input type="date" value={adjustNewDate} onChange={e => setAdjustNewDate(e.target.value)} />
            </div>
            
            <div className="space-y-2">
              <Label>سبب التعديل</Label>
              <Textarea 
                value={adjustReason} 
                onChange={e => setAdjustReason(e.target.value)} 
                rows={3} 
                placeholder="اكتب سبب التعديل..." 
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1" 
                onClick={() => setIsAdjustOpen(false)}
              >
                إلغاء
              </Button>
              <Button 
                className="flex-1" 
                onClick={handleAdjust}
                disabled={isAdjusting || !adjustNewDate || !adjustReason}
              >
                {isAdjusting ? <Loader2 className="w-4 h-4 animate-spin" /> : "حفظ التعديل"}
              </Button>
            </div>
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
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs font-bold text-primary">{ev.occurrence_date_gregorian}</span>
                    {ev.adjustment_status && ev.adjustment_status !== 'none' && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                        {ev.adjustment_status === 'advance' ? 'تم تقديمه' : ev.adjustment_status === 'delay' ? 'تم تأجيله' : 'تم تصحيحه'}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-center border-t border-border pt-3 mt-2">
                  <div className="text-xs text-muted-foreground">
                    {ev.is_confirmed ? "مؤكد" : "غير مؤكد"}
                  </div>
                  <div className="flex gap-1">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 text-xs border-amber-200 text-amber-700 hover:bg-amber-50"
                      onClick={() => openAdjust(ev)}
                    >
                      <RefreshCw className="w-3.5 h-3.5 ml-1" /> تعديل الموعد
                    </Button>
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