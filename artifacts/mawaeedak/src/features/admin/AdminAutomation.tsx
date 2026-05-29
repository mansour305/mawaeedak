/**
 * AdminAutomation — Phase 13B/13C
 * لوحة تحكم الأتمتة اليومية:
 * - حالة آخر تشغيل لكل مهمة
 * - تشغيل يدوي فوري
 * - سجل العمليات الأخيرة
 */

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Clock,
  Play,
  RefreshCw,
  CheckCircle2,
  XCircle,
  SkipForward,
  MessageSquare,
  Bell,
  Calendar,
  Wallet,
  Loader2,
  Zap,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { authedFetch } from "@/lib/apiAuth";

interface JobStatus {
  job_name: string;
  label: string;
  last_run: {
    id: number;
    status: string;
    details: string | null;
    items_created: number;
    run_at: string;
    created_at: string;
  } | null;
}

interface AutomationLog {
  id: number;
  job_name: string;
  status: string;
  details: string | null;
  items_created: number;
  run_at: string;
  created_at: string;
}

const JOB_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  daily_content: MessageSquare,
  appointment_reminders: Calendar,
  financial_reminders: Wallet,
  daily_content_notification: Bell,
};

const STATUS_CONFIG = {
  success: { label: "ناجح", variant: "default" as const, Icon: CheckCircle2, color: "text-green-600" },
  failure: { label: "فشل", variant: "destructive" as const, Icon: XCircle, color: "text-red-500" },
  skipped: { label: "متخطى", variant: "secondary" as const, Icon: SkipForward, color: "text-muted-foreground" },
  running: { label: "جارٍ", variant: "outline" as const, Icon: Loader2, color: "text-primary" },
};

function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString("ar-SA", {
      timeZone: "Asia/Riyadh",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function AdminAutomation() {
  const { toast } = useToast();
  const [status, setStatus] = useState<JobStatus[]>([]);
  const [logs, setLogs] = useState<AutomationLog[]>([]);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [runningAll, setRunningAll] = useState(false);
  const [runningJob, setRunningJob] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await authedFetch("/api/admin/automation/status");
      if (!res.ok) throw new Error("خطأ في الخادم");
      const data = await res.json() as { status: JobStatus[] };
      setStatus(data.status);
    } catch {
      toast({ title: "خطأ", description: "تعذّر تحميل حالة الأتمتة", variant: "destructive" });
    } finally {
      setLoadingStatus(false);
    }
  }, [toast]);

  const fetchLogs = useCallback(async () => {
    try {
      const res = await authedFetch("/api/admin/automation/logs?limit=30");
      if (!res.ok) throw new Error();
      const data = await res.json() as { logs: AutomationLog[] };
      setLogs(data.logs);
    } catch {
      // silent
    } finally {
      setLoadingLogs(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    fetchLogs();
  }, [fetchStatus, fetchLogs]);

  const refresh = () => {
    setLoadingStatus(true);
    setLoadingLogs(true);
    fetchStatus();
    fetchLogs();
  };

  const runAll = async () => {
    setRunningAll(true);
    try {
      const res = await authedFetch("/api/admin/automation/run", { method: "POST" });
      if (!res.ok) throw new Error();
      toast({ title: "تم", description: "تم تشغيل جميع المهام بنجاح" });
      refresh();
    } catch {
      toast({ title: "خطأ", description: "فشل تشغيل المهام", variant: "destructive" });
    } finally {
      setRunningAll(false);
    }
  };

  const runJob = async (endpoint: string, label: string) => {
    setRunningJob(endpoint);
    try {
      const res = await authedFetch(`/api/admin/automation/run/${endpoint}`, { method: "POST" });
      if (!res.ok) throw new Error();
      toast({ title: "تم", description: `تم تشغيل "${label}" بنجاح` });
      refresh();
    } catch {
      toast({ title: "خطأ", description: `فشل تشغيل "${label}"`, variant: "destructive" });
    } finally {
      setRunningJob(null);
    }
  };

  return (
    <div className="space-y-5 rtl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-foreground">الأتمتة اليومية</h2>
          <p className="text-xs text-muted-foreground mt-0.5">محرك المحتوى والإشعارات التلقائية</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={refresh} disabled={loadingStatus}>
            <RefreshCw className={`w-4 h-4 ml-1.5 ${loadingStatus ? "animate-spin" : ""}`} />
            تحديث
          </Button>
          <Button size="sm" onClick={runAll} disabled={runningAll}>
            {runningAll
              ? <Loader2 className="w-4 h-4 animate-spin ml-1.5" />
              : <Zap className="w-4 h-4 ml-1.5" />}
            تشغيل الكل
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {loadingStatus
          ? Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-[96px] rounded-xl" />
            ))
          : status.map((job) => {
              const Icon = JOB_ICONS[job.job_name] ?? Bell;
              const st = job.last_run
                ? STATUS_CONFIG[job.last_run.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.skipped
                : null;
              const StIcon = st?.Icon;
              const endpoint =
                job.job_name === "daily_content"
                  ? "daily-content"
                  : "notifications";
              const isRunning = runningJob === endpoint;

              return (
                <Card key={job.job_name} className="border-card-border shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-[14px] text-foreground">{job.label}</span>
                            {st && (
                              <Badge variant={st.variant} className="text-[10px] h-5 px-1.5">
                                {StIcon && <StIcon className={`w-3 h-3 ml-1 ${st.color}`} />}
                                {st.label}
                              </Badge>
                            )}
                          </div>
                          {job.last_run ? (
                            <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                              <Clock className="w-3 h-3 inline ml-1" />
                              {formatDateTime(job.last_run.created_at)}
                              {job.last_run.items_created > 0 &&
                                ` · ${job.last_run.items_created} عنصر`}
                            </p>
                          ) : (
                            <p className="text-[11px] text-muted-foreground mt-0.5">لم يُشغَّل بعد</p>
                          )}
                          {job.last_run?.details && (
                            <p className="text-[10px] text-muted-foreground/70 mt-0.5 truncate">
                              {job.last_run.details}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="shrink-0"
                        disabled={isRunning}
                        onClick={() => runJob(endpoint, job.label)}
                      >
                        {isRunning
                          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          : <Play className="w-3.5 h-3.5" />}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
      </div>

      <Card className="border-card-border shadow-sm">
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            سجل العمليات الأخيرة
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          {loadingLogs ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 rounded-lg" />
              ))}
            </div>
          ) : logs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">لا توجد سجلات بعد</p>
          ) : (
            <div className="space-y-2">
              {logs.map((log) => {
                const st =
                  STATUS_CONFIG[log.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.skipped;
                const StIcon = st.Icon;
                return (
                  <div
                    key={log.id}
                    className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/30 border border-border/40"
                  >
                    <StIcon className={`w-4 h-4 shrink-0 ${st.color}`} />
                    <div className="flex-1 min-w-0">
                      <span className="text-[12px] font-medium text-foreground">
                        {JOB_LABELS[log.job_name] ?? log.job_name}
                      </span>
                      {log.items_created > 0 && (
                        <span className="text-[11px] text-muted-foreground mr-1.5">
                          · {log.items_created} عنصر
                        </span>
                      )}
                      <p className="text-[10px] text-muted-foreground truncate">{log.details}</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {new Date(log.created_at).toLocaleTimeString("ar-SA", {
                        hour: "2-digit",
                        minute: "2-digit",
                        timeZone: "Asia/Riyadh",
                      })}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-card-border shadow-sm">
        <CardContent className="p-4">
          <h3 className="font-bold text-sm text-foreground mb-2 flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            جداول التشغيل التلقائي
          </h3>
          <div className="space-y-2 text-[12px] text-muted-foreground">
            <div className="flex justify-between items-center py-1.5 border-b border-border/40">
              <span>رسالة اليوم + إشعار المحتوى</span>
              <Badge variant="outline" className="text-[10px]">كل يوم 01:05 ص</Badge>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-border/40">
              <span>تذكيرات المواعيد والمالية</span>
              <Badge variant="outline" className="text-[10px]">كل يوم 07:00 ص</Badge>
            </div>
            <div className="flex justify-between items-center py-1.5">
              <span className="flex items-center gap-1">
                <span>المنطقة الزمنية للجدولة</span>
              </span>
              <Badge variant="secondary" className="text-[10px] font-mono">Asia/Riyadh (خادم)</Badge>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground/70 mt-3 border-t border-border/40 pt-2">
            الإشعارات تُولَّد بتوقيت الرياض (Asia/Riyadh) على الخادم — يراعي source_key لمنع التكرار.
            تفضيلات المنطقة الزمنية الخاصة بكل مستخدم محفوظة في متصفحه.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

const JOB_LABELS: Record<string, string> = {
  daily_content: "رسالة اليوم",
  appointment_reminders: "تذكيرات المواعيد",
  financial_reminders: "تذكيرات مالية",
  daily_content_notification: "إشعار محتوى اليوم",
};
