/**
 * NotificationsPage — مواعيدك Phase 13N
 * Visual Polish: heritage cards + ornaments + richer empty/loading states
 * Logic preserved: Gateway read/write, mark-read, mark-all-read, delete, unread count
 */

import { useState } from "react";
import { useLocation } from "wouter";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import {
  getGetUnreadNotificationsCountQueryKey,
} from "@api-client";
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
  ExternalLink,
  BellRing,
  Info,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTimeFormat } from "@/hooks/useTimeFormat";
import { useGatewayNotifications, gwQueryKeys } from "@/hooks/useGatewayData";
import {
  gwMarkNotificationRead,
  gwMarkAllNotificationsRead,
  gwDeleteNotification,
} from "@/lib/dataGateway";
import { useNotificationPermission } from "@/hooks/useNotificationPermission";

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

function routeForNotification(type: string): string {
  const routes: Record<string, string> = {
    financial: "/salaries",
    salary: "/salaries",
    bill: "/salaries",
    event: "/calendar",
    appointment: "/calendar",
    reminder: "/services/reminders",
    story: "/story",
    news: "/centers/news",
    job: "/centers/jobs",
    support: "/support",
    owner: "/more",
    system: "/more",
    general: "/notifications",
  };

  return routes[type] ?? "/notifications";
}

type TabFilter = "all" | "unread" | "important";

export default function NotificationsPage() {
  const { toast } = useToast();
  const { format: timeFormat } = useTimeFormat();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const { 
    status, 
    statusLabel, 
    isRequesting, 
    isSupported, 
    iPhoneGuidance, 
    requestPermission 
  } = useNotificationPermission();

  const { data: notifications, isLoading, isError, refetch } = useGatewayNotifications();
  const [filter, setFilter] = useState<TabFilter>("all");

  const [pendingMarkRead, setPendingMarkRead] = useState<number | null>(null);
  const [pendingDelete, setPendingDelete] = useState<number | null>(null);
  const [pendingMarkAll, setPendingMarkAll] = useState(false);

  // Filter notifications based on tab
  const filteredNotifications = (notifications ?? []).filter((n: any) => {
    if (filter === "unread") return !n.is_read;
    if (filter === "important") return n.type === "financial" || n.type === "salary" || n.type === "event";
    return true;
  });

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

  const handleOpenNotification = async (id: number, type: string, isRead: boolean) => {
    if (!isRead) {
      await handleMarkRead(id);
    }
    setLocation(routeForNotification(type));
  };

  const unreadCount = (notifications ?? []).filter(n => !n.is_read).length;
  const hasUnread = unreadCount > 0;

  const tabs: { key: TabFilter; label: string }[] = [
    { key: "all", label: "الكل" },
    { key: "unread", label: "غير مقروءة" },
    { key: "important", label: "مهمة" },
  ];

  return (
    <AppShell title="الإشعارات" showBack>
      <div className="space-y-4">

        {/* ─── Notification Permission Card ────────────────────── */}
        {isSupported !== false && status !== "granted" && (
          <div 
            className="relative overflow-hidden rounded-[22px] border p-4"
            style={{ 
              borderColor: "rgba(201,160,99,0.25)",
              background: "linear-gradient(145deg, #FFFCF7 0%, #FFF8EE 100%)",
              boxShadow: "0 8px 24px rgba(138,107,61,0.10)",
            }}
          >
            <div className="flex items-start gap-4">
              <div 
                className="grid h-14 w-14 shrink-0 place-items-center rounded-[18px]"
                style={{ background: "linear-gradient(135deg, #C9A063, #A78042)" }}
              >
                {isRequesting ? (
                  <Loader2 className="h-6 w-6 animate-spin text-white" />
                ) : (
                  <BellRing className="h-6 w-6 text-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-[18px] font-extrabold" style={{ color: "#2F2B25" }}>
                    تفعيل الإشعارات
                  </h3>
                  <span 
                    className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                    style={{ 
                      background: status === "denied" ? "rgba(185,72,63,0.12)" : "rgba(138,107,61,0.10)",
                      color: status === "denied" ? "#B9483F" : "#8A6B3D",
                    }}
                  >
                    {statusLabel}
                  </span>
                </div>
                <p className="text-[13px] font-medium leading-6" style={{ color: "#6F6557" }}>
                  فعّل الإشعارات لتصلك تنبيهات الرواتب والمواعيد.
                </p>
                {iPhoneGuidance && (
                  <div 
                    className="mt-2 flex items-start gap-2 rounded-[14px] border p-3"
                    style={{ 
                      borderColor: "rgba(201,160,99,0.20)",
                      background: "rgba(255,255,255,0.6)",
                    }}
                  >
                    <Info className="h-4 w-4 shrink-0 mt-0.5" style={{ color: "#C9A063" }} />
                    <p className="text-[12px] font-medium" style={{ color: "#6F6557" }}>
                      {iPhoneGuidance}
                    </p>
                  </div>
                )}
                <button
                  onClick={async () => {
                    const result = await requestPermission();
                    toast({ 
                      title: result.success ? "تم تفعيل الإشعارات" : result.message,
                      variant: result.success ? "default" : "destructive"
                    });
                  }}
                  disabled={isRequesting}
                  className="mt-3 w-full rounded-[16px] border py-3 text-[15px] font-bold transition active:scale-[0.98] disabled:opacity-60"
                  style={{ 
                    background: "linear-gradient(135deg, #C9A063, #A78042)",
                    color: "white",
                    borderColor: "#A78042",
                    boxShadow: "0 4px 14px rgba(167,128,66,0.25)",
                  }}
                >
                  {isRequesting ? "جاري التفعيل..." : "تفعيل الإشعارات"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── Segmented Tabs ────────────────────────────────── */}
        <div 
          className="rounded-[22px] border p-1" 
          style={{ 
            borderColor: "rgba(201,160,99,0.22)",
            background: "rgba(255,255,255,0.6)",
          }}
        >
          <div className="grid grid-cols-3 gap-1">
            {tabs.map(tab => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setFilter(tab.key)}
                className="h-12 rounded-[18px] text-[16px] font-bold transition-all"
                style={{
                  background: filter === tab.key 
                    ? "linear-gradient(135deg, #C9A063, #A78042)" 
                    : "transparent",
                  color: filter === tab.key ? "#FFFFFF" : "#6F6557",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

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
                className="rounded-2xl border bg-[#FFFCF7] p-4 animate-pulse"
                style={{ borderColor: "rgba(201,160,99,0.18)" }}
              >
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#F3E8D6]" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-[#F3E8D6] rounded w-3/4" />
                    <div className="h-3 bg-[#F3E8D6] rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ─── Notification List ──────────────────────────────── */}
        {!isLoading && filteredNotifications.length > 0 && (
          <div className="space-y-3 pt-1">
            {filteredNotifications.map((notif: any) => {
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
                          <button
                            onClick={() => handleOpenNotification(notif.id, notif.type, notif.is_read)}
                            disabled={isMarkingRead || pendingMarkAll}
                            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                            style={{
                              background: "hsl(210 70% 52% / 0.10)",
                              border: "1px solid hsl(210 70% 52% / 0.22)",
                              color: "hsl(210 60% 42%)",
                            }}
                            title="فتح"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
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
        {!isLoading && !isError && filteredNotifications.length === 0 && (
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
                {filter === "unread" ? "جميع الإشعارات مقروءة" : filter === "important" ? "لا توجد إشعارات مهمة" : "ستظهر تنبيهاتك ومواعيدك هنا"}
              </p>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

