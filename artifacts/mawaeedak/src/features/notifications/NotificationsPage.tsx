/**
 * NotificationsPage — مواعيدك Phase 13N
 * Visual Polish: heritage cards + ornaments + richer empty/loading states
 * Logic preserved: Gateway read/write, mark-read, mark-all-read, delete, unread count
 */

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import {
  getGetUnreadNotificationsCountQueryKey,
} from "@workspace/api-client-react";
import {
  Bell,
  CheckCheck,
  Loader2,
  AlertCircle,
  Trash2,
  Check,
  Briefcase,
  Calendar,
  Newspaper,
  Shield,
  BookOpen,
  MessageSquare,
  Coins,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTimeFormat } from "@/hooks/useTimeFormat";
import { useGatewayNotifications, gwQueryKeys } from "@/hooks/useGatewayData";
import {
  gwMarkNotificationRead,
  gwMarkAllNotificationsRead,
  gwDeleteNotification,
} from "@/lib/dataGateway";

const TYPE_CONFIG: Record<string, { icon: React.ElementType; label: string; accent: string }> = {
  system:      { icon: Shield,        label: "نظام",          accent: "hsl(210 70% 52%)" },
  news:        { icon: Newspaper,     label: "خبر",           accent: "hsl(30 80% 52%)" },
  financial:   { icon: Coins,         label: "مالي",          accent: "hsl(38 72% 52%)" },
  event:       { icon: Calendar,      label: "موعد",          accent: "hsl(270 60% 52%)" },
  salary:      { icon: Briefcase,     label: "راتب",          accent: "hsl(140 55% 42%)" },
  support:     { icon: Shield,        label: "دعم",           accent: "hsl(175 55% 40%)" },
  bill:        { icon: Coins,         label: "فاتورة",        accent: "hsl(10 65% 52%)" },
  appointment: { icon: Calendar,      label: "موعد شخصي",     accent: "hsl(250 60% 52%)" },
  story:       { icon: BookOpen,      label: "ستوري",         accent: "hsl(330 55% 52%)" },
  job:         { icon: Briefcase,     label: "وظيفة",         accent: "hsl(185 60% 40%)" },
  owner:       { icon: MessageSquare, label: "رسالة المالك",  accent: "hsl(38 80% 48%)" },
  reminder:    { icon: Bell,          label: "تذكير",         accent: "hsl(220 65% 52%)" },
  general:     { icon: Bell,          label: "عام",           accent: "hsl(38 45% 50%)" },
};

function getTypeConfig(type: string) {
  return TYPE_CONFIG[type] ?? TYPE_CONFIG.general;
}

function formatDateTime(iso: string, fmt: "12h" | "24h" = "12h"): string {
  try {
    return new Intl.DateTimeFormat("ar-SA-u-ca-gregory", {
      year: "numeric", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit",
      hour12: fmt === "12h",
    }).format(new Date(iso));
  } catch {
    return iso.slice(0, 10);
  }
}

export default function NotificationsPage() {
  const { toast } = useToast();
  const { format: timeFormat } = useTimeFormat();
  const queryClient = useQueryClient();

  const { data: notifications, isLoading, isError, refetch } = useGatewayNotifications();

  const [pendingMarkRead, setPendingMarkRead] = useState<number | null>(null);
  const [pendingDelete, setPendingDelete] = useState<number | null>(null);
  const [pendingMarkAll, setPendingMarkAll] = useState(false);

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: gwQueryKeys.notifications });
    queryClient.invalidateQueries({ queryKey: getGetUnreadNotificationsCountQueryKey() });
    void refetch();
  };

  const handleMarkRead = async (id: number) => {
    setPendingMarkRead(id);
    try {
      const result = await gwMarkNotificationRead(id);
      if (result.success) {
        invalidateAll();
      } else {
        toast({ title: "خطأ في تحديث الإشعار", description: result.error ?? "فشل التحديث", variant: "destructive" });
      }
    } finally {
      setPendingMarkRead(null);
    }
  };

  const handleMarkAllRead = async () => {
    setPendingMarkAll(true);
    try {
      const result = await gwMarkAllNotificationsRead();
      if (result.success) {
        invalidateAll();
        toast({ title: "تم تحديد الكل كمقروء" });
      } else {
        toast({ title: "خطأ في تحديث الإشعارات", description: result.error ?? "فشل التحديث", variant: "destructive" });
      }
    } finally {
      setPendingMarkAll(false);
    }
  };

  const handleDelete = async (id: number, title: string) => {
    setPendingDelete(id);
    try {
      const result = await gwDeleteNotification(id);
      if (result.success) {
        invalidateAll();
        toast({ title: "تم الحذف", description: `حُذف: ${title}` });
      } else {
        toast({ title: "خطأ في الحذف", description: result.error ?? "فشل الحذف", variant: "destructive" });
      }
    } finally {
      setPendingDelete(null);
    }
  };

  const unreadCount = (notifications ?? []).filter(n => !n.is_read).length;
  const hasUnread = unreadCount > 0;

  return (
    <AppShell title="الإشعارات">
      <div className="space-y-4">

        {/* ─── Heritage Header ────────────────────────────────── */}
        <div
          className="-mx-3 px-4 pt-4 pb-3"
          style={{
            background: "linear-gradient(160deg, hsl(22 72% 16%) 0%, hsl(16 72% 12%) 60%, hsl(22 62% 14%) 100%)",
            borderBottom: "1.5px solid hsl(38 65% 38% / 0.5)",
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, hsl(38 72% 52% / 0.25), hsl(38 72% 52% / 0.10))",
                  border: "1.5px solid hsl(38 72% 52% / 0.4)",
                }}
              >
                <Bell className="w-4.5 h-4.5" style={{ color: "hsl(38 82% 68%)" }} />
              </div>
              <div>
                <h2 className="text-[15px] font-extrabold" style={{ color: "hsl(38 85% 82%)" }}>
                  التنبيهات
                </h2>
                {hasUnread && (
                  <p className="text-[10px] font-semibold" style={{ color: "hsl(38 60% 58%)" }}>
                    {unreadCount} غير مقروء
                  </p>
                )}
              </div>
            </div>

            {hasUnread && (
              <button
                onClick={handleMarkAllRead}
                disabled={pendingMarkAll}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all"
                style={{
                  background: "hsl(38 72% 52% / 0.18)",
                  border: "1px solid hsl(38 72% 52% / 0.35)",
                  color: "hsl(38 82% 72%)",
                }}
              >
                {pendingMarkAll
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  : <CheckCheck className="w-3.5 h-3.5" />}
                تحديد الكل
              </button>
            )}
          </div>
        </div>

        {/* ─── Loading Skeleton ────────────────────────────────── */}
        {isLoading && (
          <div className="space-y-3 pt-1">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className="rounded-2xl p-4 flex gap-3 items-start animate-pulse"
                style={{
                  background: "linear-gradient(145deg, #FFFBF4 0%, hsl(36 28% 93%) 100%)",
                  border: "1px solid hsl(38 55% 75% / 0.4)",
                }}
              >
                <div className="w-10 h-10 rounded-xl shrink-0" style={{ background: "hsl(38 35% 85%)" }} />
                <div className="flex-1 space-y-2">
                  <div className="h-4 rounded-lg w-3/4" style={{ background: "hsl(38 35% 85%)" }} />
                  <div className="h-3 rounded-lg w-full" style={{ background: "hsl(38 30% 88%)" }} />
                  <div className="h-3 rounded-lg w-1/2" style={{ background: "hsl(38 30% 88%)" }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ─── Error ───────────────────────────────────────────── */}
        {isError && (
          <div
            className="flex flex-col items-center gap-2 py-10 rounded-2xl"
            style={{
              background: "hsl(10 55% 52% / 0.06)",
              border: "1px solid hsl(10 55% 52% / 0.2)",
            }}
          >
            <AlertCircle className="w-8 h-8" style={{ color: "hsl(10 55% 52%)" }} />
            <p className="text-sm font-semibold" style={{ color: "hsl(10 40% 40%)" }}>
              تعذّر تحميل الإشعارات. حاول تحديث الصفحة.
            </p>
          </div>
        )}

        {/* ─── Notification List ───────────────────────────────── */}
        {!isLoading && !isError && notifications && notifications.length > 0 && (
          <div className="space-y-3">
            {notifications.map((notif) => {
              const cfg = getTypeConfig(notif.type);
              const Icon = cfg.icon;
              const isMarkingRead = pendingMarkRead === notif.id;
              const isDeleting = pendingDelete === notif.id;
              return (
                <div
                  key={notif.id}
                  className="rounded-2xl overflow-hidden transition-opacity"
                  style={{
                    background: notif.is_read
                      ? "linear-gradient(145deg, #FFFBF4 0%, hsl(36 28% 93%) 100%)"
                      : "linear-gradient(145deg, hsl(38 55% 96%) 0%, hsl(36 35% 92%) 100%)",
                    border: notif.is_read
                      ? "1px solid hsl(38 40% 78% / 0.5)"
                      : "1.5px solid hsl(38 65% 62% / 0.55)",
                    boxShadow: notif.is_read
                      ? "0 2px 8px -2px rgba(80,40,10,0.10)"
                      : "0 3px 12px -2px rgba(80,40,10,0.18), 0 1px 0 rgba(255,225,150,0.2) inset",
                    opacity: isDeleting ? 0.5 : 1,
                  }}
                >
                  <div className="p-4 flex gap-3">
                    {/* Type icon */}
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{
                        background: `linear-gradient(135deg, ${cfg.accent}22, ${cfg.accent}0d)`,
                        border: `1.5px solid ${cfg.accent}40`,
                        boxShadow: `0 2px 6px ${cfg.accent}20`,
                      }}
                    >
                      <Icon className="w-4.5 h-4.5" style={{ color: cfg.accent }} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-1 mb-1">
                        <h4
                          className="font-extrabold text-[14px] leading-snug flex-1 truncate"
                          style={{ color: notif.is_read ? "hsl(22 35% 30%)" : "hsl(22 62% 18%)" }}
                        >
                          {notif.title}
                        </h4>
                        {!notif.is_read && (
                          <span
                            className="w-2 h-2 rounded-full shrink-0 mt-1.5"
                            style={{ background: "hsl(38 72% 52%)" }}
                          />
                        )}
                      </div>

                      {notif.body && (
                        <p className="text-[12px] leading-relaxed mb-2" style={{ color: "hsl(38 25% 45%)" }}>
                          {notif.body}
                        </p>
                      )}

                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          {/* Type badge */}
                          <span
                            className="text-[9px] px-2 py-0.5 rounded-full font-bold"
                            style={{
                              background: `${cfg.accent}16`,
                              color: cfg.accent,
                              border: `1px solid ${cfg.accent}30`,
                            }}
                          >
                            {cfg.label}
                          </span>
                          <span className="text-[10px]" style={{ color: "hsl(38 30% 55%)" }}>
                            {formatDateTime(notif.created_at, timeFormat)}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1">
                          {!notif.is_read && (
                            <button
                              onClick={() => handleMarkRead(notif.id)}
                              disabled={isMarkingRead || pendingMarkAll}
                              className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                              style={{
                                background: "hsl(38 72% 52% / 0.14)",
                                border: "1px solid hsl(38 72% 52% / 0.3)",
                                color: "hsl(38 62% 38%)",
                              }}
                              title="تحديد كمقروء"
                            >
                              {isMarkingRead
                                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                : <Check className="w-3.5 h-3.5" />}
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(notif.id, notif.title)}
                            disabled={isDeleting}
                            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                            style={{
                              background: "hsl(10 55% 52% / 0.10)",
                              border: "1px solid hsl(10 55% 52% / 0.22)",
                              color: "hsl(10 55% 48%)",
                            }}
                            title="حذف"
                          >
                            {isDeleting
                              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              : <Trash2 className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ─── Empty State ─────────────────────────────────────── */}
        {!isLoading && !isError && (!notifications || notifications.length === 0) && (
          <div
            className="flex flex-col items-center gap-4 py-16 rounded-2xl"
            style={{
              background: "linear-gradient(145deg, #FFFBF4 0%, hsl(36 28% 93%) 100%)",
              border: "1.5px dashed hsl(38 55% 65% / 0.55)",
            }}
          >
            <div
              className="w-18 h-18 rounded-2xl flex items-center justify-center"
              style={{
                width: 72,
                height: 72,
                background: "linear-gradient(145deg, hsl(22 62% 22%), hsl(18 68% 18%))",
                boxShadow: "0 4px 16px rgba(80,40,10,0.22)",
                border: "1.5px solid hsl(38 55% 40% / 0.4)",
              }}
            >
              <Bell className="w-8 h-8" style={{ color: "hsl(38 72% 62%)" }} />
            </div>
            <div className="text-center">
              <p className="text-[16px] font-extrabold" style={{ color: "hsl(22 62% 22%)" }}>
                لا توجد إشعارات
              </p>
              <p className="text-[13px] mt-1.5" style={{ color: "hsl(38 30% 52%)" }}>
                ستظهر تنبيهاتك ومواعيدك هنا
              </p>
            </div>
          </div>
        )}

        {/* Push notice */}
        <p className="text-[10px] text-center pt-1" style={{ color: "hsl(38 25% 55%)" }}>
          الإشعارات المعروضة داخلية فقط. Push Notifications مؤجل لإصدار لاحق.
        </p>
      </div>
    </AppShell>
  );
}
