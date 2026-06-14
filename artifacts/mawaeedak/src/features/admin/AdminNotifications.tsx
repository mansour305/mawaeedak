/**
 * AdminNotifications — Phase 12K
 *
 * Read:   useGatewayNotifications → API (mode=api/shadow) | Supabase (mode=supabase)
 * Send:   useCreateNotification (Orval → API) — يبقى على API
 *         السبب: POST /api/notifications = fan-out متعدد المستخدمين على الخادم،
 *         لا RLS INSERT policy مُعرَّفة، وليس user-scoped INSERT.
 * Delete: gwDeleteNotification → API (mode=api/shadow) | Supabase (mode=supabase)
 *
 * Invalidation بعد كل write:
 *   - gwQueryKeys.notifications → يُعيد جلب القائمة
 *   - gwQueryKeys.unreadCount → يُعيد جلب عداد TopBar
 */

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  useCreateNotification,
  getListNotificationsQueryKey,
  getGetUnreadNotificationsCountQueryKey,
} from "@api-client";
import { useQueryClient } from "@tanstack/react-query";
import { Send, Loader2, Trash2 } from "lucide-react";
import { useGatewayNotifications, gwQueryKeys } from "@/hooks/useGatewayData";
import { gwDeleteNotification } from "@/lib/dataGateway";

const TYPES = [
  { value: "system",      label: "تحديث نظام" },
  { value: "owner",       label: "رسالة من المالك" },
  { value: "news",        label: "خبر عاجل" },
  { value: "financial",   label: "تنبيه مالي عام" },
  { value: "salary",      label: "تنبيه راتب" },
  { value: "support",     label: "تنبيه دعم" },
  { value: "bill",        label: "تنبيه فاتورة" },
  { value: "event",       label: "موعد عام" },
  { value: "appointment", label: "موعد شخصي" },
  { value: "prayer",      label: "صلاة" },
  { value: "story",       label: "ستوري اليوم" },
  { value: "job",         label: "وظيفة" },
  { value: "reminder",    label: "تذكير" },
];

export default function AdminNotifications() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createNotif = useCreateNotification();

  // Phase 12K: Gateway read
  const { data: notifications, isLoading } = useGatewayNotifications();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [type, setType] = useState("owner");
  const [pendingDelete, setPendingDelete] = useState<number | null>(null);

  // بعد كل write: invalidate Gateway cache + Orval cache (للتوافق مع send الذي يبقى API)
  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: gwQueryKeys.notifications });
    queryClient.invalidateQueries({ queryKey: gwQueryKeys.unreadCount });
    // Orval keys — للتوافق مع send (يكتب API) حتى تُحدَّث Orval cache أيضاً
    queryClient.invalidateQueries({ queryKey: getListNotificationsQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetUnreadNotificationsCountQueryKey() });
  };

  // Send يبقى على API (Orval) — fan-out متعدد المستخدمين، لا RLS INSERT policy
  const handleSend = () => {
    if (!title.trim()) {
      toast({ title: "خطأ", description: "عنوان الإشعار مطلوب", variant: "destructive" });
      return;
    }
    createNotif.mutate({ data: { title: title.trim(), body: body.trim() || undefined, type } }, {
      onSuccess: () => {
        toast({ title: "تم إرسال الإشعار", description: `"${title}" — ظهر في مركز الإشعارات` });
        setTitle("");
        setBody("");
        invalidateAll();
      },
      onError: () => toast({ title: "خطأ", description: "فشل إرسال الإشعار", variant: "destructive" }),
    });
  };

  // Delete عبر Gateway — RLS notifications_delete_own موجودة
  const handleDelete = async (id: number) => {
    setPendingDelete(id);
    try {
      const result = await gwDeleteNotification(id);
      if (result.success) {
        invalidateAll();
        toast({ title: "تم الحذف" });
      } else {
        toast({
          title: "خطأ في الحذف",
          description: result.error ?? "فشل الحذف",
          variant: "destructive",
        });
      }
    } finally {
      setPendingDelete(null);
    }
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
          الإشعارات
        </h1>
      </div>

      <Card className="border-border shadow-sm">
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <Label>عنوان الإشعار *</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: تحديث جديد للمنصة"
              dir="rtl"
            />
          </div>
          <div className="space-y-2">
            <Label>نص الإشعار (اختياري)</Label>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={3}
              placeholder="التفاصيل..."
              dir="rtl"
            />
          </div>
          <div className="space-y-2">
            <Label>النوع / التصنيف</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger dir="rtl"><SelectValue /></SelectTrigger>
              <SelectContent className="rtl" dir="rtl">
                {(Array.isArray(TYPES) ? TYPES : []).map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            className="w-full h-12 text-base font-bold mt-4"
            onClick={handleSend}
            disabled={createNotif.isPending}
          >
            {createNotif.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <><Send className="w-5 h-5 ml-2 rtl:rotate-180" /> إرسال للجميع</>
            )}
          </Button>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground text-center">
        الإشعار يظهر فوراً في مركز الإشعارات. Push Notifications مؤجل لإصدار لاحق.
      </p>

      {/* Recent notifications list for quick delete */}
      {!isLoading && notifications && notifications.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-base font-bold">الإشعارات الحالية ({notifications.length})</h3>
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {(Array.isArray(notifications) ? notifications : []).map((n) => (
              <div
                key={n.id}
                className="flex items-center justify-between gap-2 p-3 rounded-xl border border-border bg-card text-sm"
              >
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-foreground truncate block">{n.title}</span>
                  <span className="text-[11px] text-muted-foreground">
                    {n.type} — {n.is_read ? "مقروء" : "غير مقروء"}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-7 h-7 shrink-0 text-destructive/70 hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => handleDelete(n.id)}
                  disabled={pendingDelete === n.id}
                >
                  {pendingDelete === n.id
                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    : <Trash2 className="w-3.5 h-3.5" />}
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

