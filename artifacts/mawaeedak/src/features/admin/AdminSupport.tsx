import { useState, useMemo, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Search, Loader2, Headphones, Reply, Check, Clock, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { supabase, isSupabaseEnabled } from "@/lib/supabase";

interface SupportTicket {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  category: string;
  message: string;
  status: "new" | "in_progress" | "resolved" | "closed";
  admin_reply?: string;
  created_at: string;
}

const CATEGORIES = [
  { value: "technical", label: "مشكلة تقنية" },
  { value: "account", label: "مشكلة حساب" },
  { value: "suggestion", label: "اقتراح" },
  { value: "complaint", label: "شكوى" },
  { value: "inquiry", label: "استفسار" },
  { value: "other", label: "أخرى" },
];

const STATUS_OPTIONS = [
  { value: "new", label: "جديد", color: "bg-amber-500/10 text-amber-600" },
  { value: "in_progress", label: "قيد المعالجة", color: "bg-blue-500/10 text-blue-600" },
  { value: "resolved", label: "تم الحل", color: "bg-emerald-500/10 text-emerald-600" },
  { value: "closed", label: "مغلق", color: "bg-muted text-muted-foreground" },
];

export default function AdminSupport() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [detail, setDetail] = useState<SupportTicket | null>(null);
  const [reply, setReply] = useState("");
  const [replyStatus, setReplyStatus] = useState<SupportTicket["status"]>("new");
  const [saving, setSaving] = useState(false);

  // Load support tickets from Supabase (complaints table with support category)
  useEffect(() => {
    if (!isSupabaseEnabled) {
      setIsLoading(false);
      return;
    }

    const loadTickets = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase!
          .from("complaints")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(100);

        if (error) throw error;

        const mappedTickets: SupportTicket[] = (data || []).map(c => ({
          id: c.id,
          name: c.name || c.contact || "مستخدم",
          email: c.contact,
          category: c.type || "inquiry",
          message: c.message,
          status: c.status === "pending" ? "new" as const : 
                  c.status === "in_progress" ? "in_progress" as const :
                  c.status === "resolved" ? "resolved" as const : "closed" as const,
          admin_reply: c.admin_response,
          created_at: c.created_at,
        }));

        setTickets(mappedTickets);
      } catch (err) {
        console.error("[AdminSupport] Error loading tickets:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadTickets();
  }, []);

  const filtered = useMemo(() => {
    return tickets.filter(t => {
      if (catFilter !== "all" && t.category !== catFilter) return false;
      if (statusFilter !== "all" && t.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!t.name.toLowerCase().includes(q) && !t.message.toLowerCase().includes(q) && !(t.email?.toLowerCase().includes(q))) return false;
      }
      return true;
    });
  }, [tickets, catFilter, statusFilter, search]);

  const counts = useMemo(() => ({
    total: tickets.length,
    new: tickets.filter(t => t.status === "new").length,
    inProgress: tickets.filter(t => t.status === "in_progress").length,
    resolved: tickets.filter(t => t.status === "resolved").length,
  }), [tickets]);

  const openDetail = (t: SupportTicket) => {
    setDetail(t);
    setReply(t.admin_reply ?? "");
    setReplyStatus(t.status);
  };

  const handleSaveReply = async () => {
    if (!detail) return;
    setSaving(true);

    try {
      if (!isSupabaseEnabled) {
        toast({ title: "خطأ", description: "Supabase غير مفعّل", variant: "destructive" });
        setSaving(false);
        return;
      }

      // Map status back to complaint status
      const statusMap: Record<string, string> = {
        "new": "pending",
        "in_progress": "in_progress",
        "resolved": "resolved",
        "closed": "closed",
      };

      const { error } = await supabase!
        .from("complaints")
        .update({
          admin_response: reply,
          status: statusMap[replyStatus] || replyStatus,
        })
        .eq("id", detail.id);

      if (error) throw error;

      setTickets(prev => prev.map(t => t.id === detail.id ? { ...t, admin_reply: reply, status: replyStatus } : t));
      toast({ title: "تم حفظ الرد" });
      setDetail(null);
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message || "فشل الحفظ", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (ticket: SupportTicket, newStatus: SupportTicket["status"]) => {
    try {
      if (!isSupabaseEnabled) {
        toast({ title: "خطأ", description: "Supabase غير مفعّل", variant: "destructive" });
        return;
      }

      const statusMap: Record<string, string> = {
        "new": "pending",
        "in_progress": "in_progress",
        "resolved": "resolved",
        "closed": "closed",
      };

      const { error } = await supabase!
        .from("complaints")
        .update({ status: statusMap[newStatus] || newStatus })
        .eq("id", ticket.id);

      if (error) throw error;

      setTickets(prev => prev.map(t => t.id === ticket.id ? { ...t, status: newStatus } : t));
      toast({ title: "تم تحديث الحالة" });
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message || "فشل التحديث", variant: "destructive" });
    }
  };

  const statusMeta = (status: string) => STATUS_OPTIONS.find(s => s.value === status) ?? STATUS_OPTIONS[0];

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex items-center gap-3">
        <div 
          className="w-1 h-6 rounded-full"
          style={{ background: "linear-gradient(180deg, hsl(38 62% 52%), hsl(32 55% 42%))" }}
        />
        <h1 className="text-2xl font-extrabold" style={{ color: "hsl(22 62% 18%)" }}>
          الدعم والمساعدة
        </h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "الإجمالي", value: counts.total, icon: MessageSquare },
          { label: "جديد", value: counts.new, icon: Clock },
          { label: "قيد المعالجة", value: counts.inProgress, icon: Reply },
          { label: "تم الحل", value: counts.resolved, icon: Check },
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
          <Input placeholder="بحث..." value={search} onChange={e => setSearch(e.target.value)} className="pr-9" />
        </div>
        <Select value={catFilter} onValueChange={setCatFilter}>
          <SelectTrigger className="md:w-40"><SelectValue /></SelectTrigger>
          <SelectContent className="rtl">
            <SelectItem value="all">كل التصنيفات</SelectItem>
            {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="md:w-40"><SelectValue /></SelectTrigger>
          <SelectContent className="rtl">
            <SelectItem value="all">كل الحالات</SelectItem>
            {STATUS_OPTIONS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* List */}
      <div className="space-y-3">
        {isLoading ? (
          <Card className="border-border shadow-sm">
            <CardContent className="p-10 text-center"><Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" /></CardContent>
          </Card>
        ) : filtered.length === 0 ? (
          <Card className="border-border shadow-sm">
            <CardContent className="p-10 text-center text-muted-foreground">لا توجد طلبات</CardContent>
          </Card>
        ) : filtered.map(ticket => {
          const sm = statusMeta(ticket.status);
          return (
            <Card key={ticket.id} className="border-border shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => openDetail(ticket)}>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">
                        {CATEGORIES.find(c => c.value === ticket.category)?.label ?? ticket.category}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${sm.color}`}>{sm.label}</span>
                    </div>
                    <div className="font-bold text-sm">{ticket.name}</div>
                    <div className="text-sm text-muted-foreground line-clamp-2 mt-1">{ticket.message}</div>
                    <div className="text-[10px] text-muted-foreground mt-2 flex items-center gap-2">
                      <span dir="ltr">{format(new Date(ticket.created_at), "yyyy-MM-dd HH:mm")}</span>
                      {ticket.email && <span dir="ltr">{ticket.email}</span>}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    <Select value={ticket.status} onValueChange={(v) => handleStatusChange(ticket, v as SupportTicket["status"])}>
                      <SelectTrigger className="h-8 w-36 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent className="rtl">
                        {STATUS_OPTIONS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm" className="h-8" onClick={() => openDetail(ticket)}>
                      <Reply className="w-3.5 h-3.5 ml-1" /> رد
                    </Button>
                  </div>
                </div>
                {ticket.admin_reply && (
                  <div className="mt-3 p-3 rounded-lg bg-primary/5 border border-primary/15 text-sm">
                    <span className="font-bold text-primary">الرد: </span>{ticket.admin_reply}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    
      {/* Detail Dialog */}
      <Dialog open={!!detail} onOpenChange={open => { if (!open) setDetail(null); }}>
        <DialogContent className="rtl max-w-lg">
          <DialogHeader><DialogTitle>تفاصيل الطلب</DialogTitle></DialogHeader>
          {detail && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">
                  {CATEGORIES.find(c => c.value === detail.category)?.label ?? detail.category}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${statusMeta(detail.status).color}`}>
                  {statusMeta(detail.status).label}
                </span>
              </div>
              <div className="font-bold">{detail.name}</div>
              <div className="p-3 rounded-lg bg-muted/40 text-sm">{detail.message}</div>
              <div className="text-xs text-muted-foreground dir-ltr">{detail.email ?? detail.phone}</div>
              <div className="space-y-2">
                <Label>الحالة</Label>
                <Select value={replyStatus} onValueChange={(v) => setReplyStatus(v as SupportTicket["status"])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent className="rtl">
                    {STATUS_OPTIONS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>الرد</Label>
                <Textarea value={reply} onChange={e => setReply(e.target.value)} rows={4} placeholder="اكتب ردك هنا..." />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setDetail(null)}>إلغاء</Button>
                <Button onClick={handleSaveReply} disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "حفظ الرد"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
