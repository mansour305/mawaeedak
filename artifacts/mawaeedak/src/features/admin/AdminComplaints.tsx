import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/layout/ConfirmDialog";
import { useToast } from "@/hooks/use-toast";
import {
  useListComplaints,
  useUpdateComplaint,
  useDeleteComplaint,
  getListComplaintsQueryKey,
} from "@workspace/api-client-react";
import type { Complaint } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Search, Loader2, MessageSquare, Trash2, Reply, Inbox } from "lucide-react";
import { format } from "date-fns";

const STATUS_OPTIONS = [
  { value: "pending", label: "جديد", color: "bg-amber-500/10 text-amber-600 border-amber-500/30" },
  { value: "in_progress", label: "قيد المعالجة", color: "bg-blue-500/10 text-blue-600 border-blue-500/30" },
  { value: "resolved", label: "تم الحل", color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30" },
  { value: "closed", label: "مغلق", color: "bg-muted text-muted-foreground border-border" },
];

function statusMeta(value: string) {
  return STATUS_OPTIONS.find(s => s.value === value) ?? { value, label: value, color: "bg-muted text-muted-foreground border-border" };
}

export default function AdminComplaints() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: complaints, isLoading } = useListComplaints();
  const updateComplaint = useUpdateComplaint();
  const deleteComplaint = useDeleteComplaint();

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [detail, setDetail] = useState<Complaint | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replyStatus, setReplyStatus] = useState("pending");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: getListComplaintsQueryKey() });

  const types = useMemo(() => {
    const set = new Set<string>();
    (complaints ?? []).forEach(c => set.add(c.type));
    return Array.from(set);
  }, [complaints]);

  const filtered = useMemo(() => {
    return (complaints ?? []).filter(c => {
      if (typeFilter !== "all" && c.type !== typeFilter) return false;
      if (statusFilter !== "all" && c.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        const hay = `${c.title ?? ""} ${c.message} ${c.type} ${c.category ?? ""} ${c.contact ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [complaints, typeFilter, statusFilter, search]);

  const counts = useMemo(() => {
    const all = complaints ?? [];
    return {
      total: all.length,
      pending: all.filter(c => c.status === "pending").length,
      resolved: all.filter(c => c.status === "resolved").length,
      awaitingReply: all.filter(c => !c.admin_reply && c.status !== "closed").length,
    };
  }, [complaints]);

  const openDetail = (c: Complaint) => {
    setDetail(c);
    setReplyText(c.admin_reply ?? "");
    setReplyStatus(c.status);
  };

  const handleSave = () => {
    if (!detail) return;
    updateComplaint.mutate(
      { id: detail.id, data: { status: replyStatus, admin_reply: replyText || undefined } },
      {
        onSuccess: () => {
          toast({ title: "تم الحفظ" });
          invalidate();
          setDetail(null);
        },
        onError: () => toast({ title: "خطأ", description: "تعذر حفظ التحديث", variant: "destructive" }),
      }
    );
  };

  const handleStatusInline = (c: Complaint, status: string) => {
    updateComplaint.mutate(
      { id: c.id, data: { status } },
      {
        onSuccess: () => { toast({ title: "تم تحديث الحالة" }); invalidate(); },
        onError: () => toast({ title: "خطأ", description: "تعذر تحديث الحالة", variant: "destructive" }),
      }
    );
  };

  const handleDelete = () => {
    if (deleteId == null) return;
    deleteComplaint.mutate(
      { id: deleteId },
      {
        onSuccess: () => { toast({ title: "تم الحذف" }); invalidate(); setDeleteId(null); },
        onError: () => toast({ title: "خطأ", description: "تعذر الحذف", variant: "destructive" }),
      }
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-bold">الشكاوى والاقتراحات</h2>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "الإجمالي", value: counts.total, icon: Inbox },
          { label: "جديدة", value: counts.pending, icon: MessageSquare },
          { label: "بانتظار رد", value: counts.awaitingReply, icon: Reply },
          { label: "تم حلها", value: counts.resolved, icon: MessageSquare },
        ].map(s => (
          <Card key={s.label} className="border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-2xl font-extrabold text-foreground">{s.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-2.5 w-4 h-4 text-muted-foreground" />
          <Input placeholder="بحث في الرسائل..." value={search} onChange={e => setSearch(e.target.value)} className="pr-9" />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="md:w-44"><SelectValue placeholder="النوع" /></SelectTrigger>
          <SelectContent className="rtl">
            <SelectItem value="all">كل الأنواع</SelectItem>
            {types.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="md:w-44"><SelectValue placeholder="الحالة" /></SelectTrigger>
          <SelectContent className="rtl">
            <SelectItem value="all">كل الحالات</SelectItem>
            {STATUS_OPTIONS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* List */}
      <Card className="border-border shadow-sm overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-10 text-center"><Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" /></div>
          ) : filtered.length === 0 ? (
            <div className="p-10 text-center text-muted-foreground">لا توجد رسائل مطابقة</div>
          ) : (
            <div className="divide-y divide-border">
              {filtered.map(c => {
                const sm = statusMeta(c.status);
                return (
                  <div key={c.id} className="p-4 hover:bg-muted/30 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0 cursor-pointer" onClick={() => openDetail(c)}>
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">{c.type}</span>
                          {c.category && <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{c.category}</span>}
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${sm.color}`}>{sm.label}</span>
                          {!c.admin_reply && <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 font-bold">بانتظار رد</span>}
                        </div>
                        {c.title && <div className="font-bold text-sm text-foreground truncate">{c.title}</div>}
                        <div className="text-sm text-muted-foreground line-clamp-2">{c.message}</div>
                        <div className="text-[10px] text-muted-foreground mt-1 flex items-center gap-2">
                          <span className="dir-ltr">{format(new Date(c.created_at), "yyyy-MM-dd HH:mm")}</span>
                          {c.contact && <span className="dir-ltr">· {c.contact}</span>}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <Select value={c.status} onValueChange={v => handleStatusInline(c, v)}>
                          <SelectTrigger className="h-8 w-32 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent className="rtl">
                            {STATUS_OPTIONS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <div className="flex gap-1">
                          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => openDetail(c)}>
                            <Reply className="w-3.5 h-3.5 ml-1" /> رد
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteId(c.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    {c.admin_reply && (
                      <div className="mt-2 p-2 rounded-lg bg-primary/5 border border-primary/15 text-xs text-foreground">
                        <span className="font-bold text-primary">الرد: </span>{c.admin_reply}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail / Reply dialog */}
      <Dialog open={!!detail} onOpenChange={open => { if (!open) setDetail(null); }}>
        <DialogContent className="rtl max-w-lg">
          <DialogHeader>
            <DialogTitle>تفاصيل الرسالة</DialogTitle>
          </DialogHeader>
          {detail && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">{detail.type}</span>
                {detail.category && <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{detail.category}</span>}
              </div>
              {detail.title && <div className="font-bold text-foreground">{detail.title}</div>}
              <div className="p-3 rounded-lg bg-muted/40 text-sm text-foreground whitespace-pre-wrap">{detail.message}</div>
              {detail.contact && <div className="text-xs text-muted-foreground dir-ltr">{detail.contact}</div>}
              <div className="space-y-2">
                <Label>الحالة</Label>
                <Select value={replyStatus} onValueChange={setReplyStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent className="rtl">
                    {STATUS_OPTIONS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>الرد</Label>
                <Textarea value={replyText} onChange={e => setReplyText(e.target.value)} rows={4} placeholder="اكتب رداً على الرسالة..." />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setDetail(null)}>إلغاء</Button>
                <Button onClick={handleSave} disabled={updateComplaint.isPending}>
                  {updateComplaint.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "حفظ"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteId != null}
        onOpenChange={open => { if (!open) setDeleteId(null); }}
        title="حذف الرسالة"
        description="هل أنت متأكد من حذف هذه الرسالة؟ لا يمكن التراجع."
        confirmText="حذف"
        onConfirm={handleDelete}
        destructive
      />
    </div>
  );
}
