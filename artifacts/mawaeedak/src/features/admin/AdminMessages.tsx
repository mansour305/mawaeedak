/**
 * AdminMessages — Phase 12M
 *
 * Read:   useGatewayDailyMessages → API (mode=api/shadow) | Supabase (mode=supabase)
 * Write:  gwCreateDailyMessage / gwUpdateDailyMessage / gwDeleteDailyMessage
 *           mode=api/shadow → /api/daily-messages/:id
 *           mode=supabase   → Supabase INSERT/UPDATE/DELETE
 *
 * Invalidation: gwQueryKeys.dailyMessages + getListDailyMessagesQueryKey
 */

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/layout/ConfirmDialog";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { getListDailyMessagesQueryKey } from "@workspace/api-client-react";
import { Plus, Edit2, Trash2, Loader2, Calendar as CalIcon } from "lucide-react";
import { useGatewayDailyMessages, gwQueryKeys } from "@/hooks/useGatewayData";
import {
  gwCreateDailyMessage,
  gwUpdateDailyMessage,
  gwDeleteDailyMessage,
} from "@/lib/dataGateway";

export default function AdminMessages() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Phase 12M: Gateway read
  const { data: messages, isLoading, refetch: refetchMessages } = useGatewayDailyMessages();

  const [savePending, setSavePending] = useState(false);
  const [deletePending, setDeletePending] = useState(false);

  const [isOpen, setIsOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const [message, setMessage] = useState("");
  const [displayDate, setDisplayDate] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const invalidateMessages = () => {
    queryClient.invalidateQueries({ queryKey: gwQueryKeys.dailyMessages });
    queryClient.invalidateQueries({ queryKey: getListDailyMessagesQueryKey() });
    void refetchMessages();
  };

  const openAdd = () => {
    setIsEdit(false); setEditId(null);
    setMessage(""); setDisplayDate(""); setIsActive(true);
    setIsOpen(true);
  };

  const openEdit = (msg: { id: number; message: string; display_date?: string | null; is_active: boolean }) => {
    setIsEdit(true); setEditId(msg.id);
    setMessage(msg.message);
    setDisplayDate(msg.display_date ?? "");
    setIsActive(msg.is_active);
    setIsOpen(true);
  };

  const handleSave = async () => {
    if (!message) {
      toast({ title: "خطأ", description: "الرسالة مطلوبة", variant: "destructive" });
      return;
    }
    const payload = { message, display_date: displayDate || undefined, is_active: isActive };
    setSavePending(true);
    try {
      const result = isEdit && editId
        ? await gwUpdateDailyMessage(editId, payload)
        : await gwCreateDailyMessage(payload);
      if (result.success) {
        toast({ title: isEdit ? "تم التعديل" : "تمت الإضافة" });
        setIsOpen(false);
        invalidateMessages();
      } else {
        toast({ title: "خطأ", description: result.error ?? "فشلت العملية", variant: "destructive" });
      }
    } finally {
      setSavePending(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeletePending(true);
    try {
      const result = await gwDeleteDailyMessage(deleteId);
      if (result.success) {
        toast({ title: "تم الحذف" });
        setIsDeleteOpen(false);
        invalidateMessages();
      } else {
        toast({ title: "فشل الحذف", description: result.error ?? "خطأ غير معروف", variant: "destructive" });
        setIsDeleteOpen(false);
      }
    } finally {
      setDeletePending(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">رسائل اليوم</h2>
        <Button onClick={openAdd} size="sm"><Plus className="w-4 h-4 ml-1" /> إضافة رسالة</Button>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="rtl max-w-[400px] rounded-xl">
          <DialogHeader>
            <DialogTitle>{isEdit ? "تعديل رسالة" : "رسالة جديدة"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>نص الرسالة</Label>
              <Textarea value={message} onChange={e => setMessage(e.target.value)} rows={4} placeholder="اكتب الحكمة أو الرسالة هنا..." />
            </div>
            <div className="space-y-2">
              <Label>تاريخ العرض (اختياري)</Label>
              <Input type="date" value={displayDate} onChange={e => setDisplayDate(e.target.value)} />
              <p className="text-xs text-muted-foreground">إذا تركته فارغاً ستظهر الرسالة بشكل عشوائي للرسائل المفعّلة</p>
            </div>
            <div className="flex items-center justify-between">
              <Label>تفعيل الرسالة</Label>
              <Switch checked={isActive} onCheckedChange={setIsActive} />
            </div>
            <Button className="w-full" onClick={handleSave} disabled={savePending}>
              {savePending ? <Loader2 className="w-4 h-4 animate-spin" /> : "حفظ"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {isLoading ? (
        <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : messages && messages.length > 0 ? (
        <div className="space-y-3">
          {messages.map(msg => (
            <Card key={msg.id} className={`border-border shadow-sm ${!msg.is_active ? "opacity-60" : ""}`}>
              <CardContent className="p-4">
                <p className="font-medium text-sm leading-relaxed mb-3">{msg.message}</p>
                <div className="flex justify-between items-center border-t border-border pt-3">
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    {msg.display_date ? (
                      <span className="flex items-center gap-1"><CalIcon className="w-3 h-3" /> {msg.display_date}</span>
                    ) : (
                      <span className="text-accent bg-accent/10 px-2 py-0.5 rounded">عامة</span>
                    )}
                    {!msg.is_active && <span className="text-destructive bg-destructive/10 px-2 py-0.5 rounded">معطلة</span>}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => openEdit(msg)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => { setDeleteId(msg.id); setIsDeleteOpen(true); }}
                      disabled={deletePending}
                    >
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
          لا توجد رسائل
        </div>
      )}

      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="حذف الرسالة"
        description="هل أنت متأكد من حذف هذه الرسالة؟"
        onConfirm={handleDelete}
      />
    </div>
  );
}
