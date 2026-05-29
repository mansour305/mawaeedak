import { useGetAdminStats, useListAuditLogs } from "@workspace/api-client-react";
import {
  Calendar, Bell, Newspaper, Briefcase,
  AlertTriangle, Loader2, TrendingUp, Clock
} from "lucide-react";
import { format } from "date-fns";

const STAT_CARDS = [
  {
    key: "total_appointments" as const,
    label: "المواعيد الكلية",
    icon: Calendar,
    gradient: "linear-gradient(145deg, hsl(22 72% 18%), hsl(18 72% 14%))",
    accent: "hsl(38 72% 58%)",
    glow: "rgba(80,40,10,0.28)",
  },
  {
    key: "total_notifications" as const,
    label: "الإشعارات",
    icon: Bell,
    gradient: "linear-gradient(145deg, hsl(38 65% 18%), hsl(32 65% 14%))",
    accent: "hsl(38 82% 68%)",
    glow: "rgba(80,40,10,0.22)",
  },
  {
    key: "total_news" as const,
    label: "الأخبار",
    icon: Newspaper,
    gradient: "linear-gradient(145deg, hsl(210 60% 22%), hsl(210 60% 16%))",
    accent: "hsl(210 70% 70%)",
    glow: "rgba(30,60,100,0.22)",
  },
  {
    key: "total_jobs" as const,
    label: "الوظائف",
    icon: Briefcase,
    gradient: "linear-gradient(145deg, hsl(140 45% 20%), hsl(140 45% 15%))",
    accent: "hsl(140 60% 62%)",
    glow: "rgba(20,80,40,0.20)",
  },
];

export default function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useGetAdminStats();
  const { data: logs, isLoading: logsLoading } = useListAuditLogs({ limit: 5 });

  if (statsLoading || logsLoading) {
    return (
      <div className="flex justify-center p-12">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{
            background: "linear-gradient(145deg, hsl(22 62% 22%), hsl(18 68% 18%))",
            boxShadow: "0 4px 16px rgba(80,40,10,0.22)",
            border: "1.5px solid hsl(38 55% 40% / 0.4)",
          }}
        >
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: "hsl(38 82% 68%)" }} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Section title */}
      <div className="flex items-center gap-2">
        <div
          className="w-1 h-5 rounded-full"
          style={{ background: "linear-gradient(180deg, hsl(38 82% 62%), hsl(38 60% 42%))" }}
        />
        <h2 className="text-[16px] font-extrabold" style={{ color: "hsl(22 62% 22%)" }}>
          نظرة عامة
        </h2>
      </div>

      {/* Stat cards — 2×2 grid */}
      <div className="grid grid-cols-2 gap-3">
        {STAT_CARDS.map(card => {
          const Icon = card.icon;
          const value = stats?.[card.key] ?? 0;
          return (
            <div
              key={card.key}
              className="rounded-2xl p-4 flex flex-col items-center text-center"
              style={{
                background: card.gradient,
                boxShadow: `0 4px 16px -4px ${card.glow}, 0 1px 0 rgba(255,220,120,0.10) inset`,
                border: "1px solid rgba(255,220,120,0.15)",
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-2"
                style={{
                  background: `${card.accent}20`,
                  border: `1.5px solid ${card.accent}35`,
                }}
              >
                <Icon className="w-5 h-5" style={{ color: card.accent }} />
              </div>
              <div
                className="text-2xl font-extrabold leading-none mb-1"
                style={{ color: card.accent }}
              >
                {value}
              </div>
              <div className="text-[10px] font-semibold" style={{ color: "rgba(255,255,255,0.55)" }}>
                {card.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Complaints & suggestions overview */}
      <div className="flex items-center gap-2 pt-1">
        <div
          className="w-1 h-5 rounded-full"
          style={{ background: "linear-gradient(180deg, hsl(38 82% 62%), hsl(38 60% 42%))" }}
        />
        <h2 className="text-[16px] font-extrabold" style={{ color: "hsl(22 62% 22%)" }}>
          الشكاوى والاقتراحات
        </h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "الإجمالي", value: stats?.total_complaints ?? 0, accent: "hsl(38 72% 50%)" },
          { label: "الاقتراحات", value: stats?.total_suggestions ?? 0, accent: "hsl(210 60% 52%)" },
          { label: "بانتظار رد", value: stats?.awaiting_reply ?? 0, accent: "hsl(10 65% 55%)" },
          { label: "تم حلها", value: stats?.resolved_complaints ?? 0, accent: "hsl(140 50% 45%)" },
        ].map(s => (
          <div
            key={s.label}
            className="rounded-2xl p-3 text-center"
            style={{
              background: "linear-gradient(145deg, #FFFBF4 0%, hsl(36 28% 93%) 100%)",
              border: "1px solid hsl(38 55% 75% / 0.5)",
              boxShadow: "0 2px 10px -3px rgba(80,40,10,0.12)",
            }}
          >
            <div className="text-2xl font-extrabold leading-none mb-1" style={{ color: s.accent }}>
              {s.value}
            </div>
            <div className="text-[10px] font-semibold" style={{ color: "hsl(38 30% 45%)" }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Pending complaints banner */}
      {(stats?.pending_complaints ?? 0) > 0 && (
        <div
          className="rounded-2xl p-4 flex items-center justify-between"
          style={{
            background: "linear-gradient(145deg, hsl(10 60% 16%), hsl(10 55% 12%))",
            border: "1px solid hsl(10 55% 38% / 0.4)",
            boxShadow: "0 3px 12px -3px rgba(150,30,10,0.25)",
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                background: "hsl(10 65% 52% / 0.2)",
                border: "1.5px solid hsl(10 65% 52% / 0.4)",
              }}
            >
              <AlertTriangle className="w-4.5 h-4.5" style={{ color: "hsl(10 75% 65%)" }} />
            </div>
            <div>
              <div className="font-extrabold text-[13px]" style={{ color: "hsl(10 75% 72%)" }}>
                شكاوى معلقة
              </div>
              <div className="text-[11px]" style={{ color: "hsl(10 55% 58%)" }}>
                تحتاج إلى مراجعة
              </div>
            </div>
          </div>
          <div
            className="text-2xl font-extrabold"
            style={{ color: "hsl(10 75% 68%)" }}
          >
            {stats?.pending_complaints}
          </div>
        </div>
      )}

      {/* Recent activity */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "linear-gradient(145deg, #FFFBF4 0%, hsl(36 28% 93%) 100%)",
          border: "1px solid hsl(38 55% 72% / 0.5)",
          boxShadow: "0 3px 12px -3px rgba(80,40,10,0.12)",
        }}
      >
        {/* Card header */}
        <div
          className="px-4 py-3 flex items-center gap-2 border-b"
          style={{
            background: "linear-gradient(135deg, hsl(22 62% 20%), hsl(18 68% 16%))",
            borderColor: "hsl(38 55% 38% / 0.4)",
          }}
        >
          <TrendingUp className="w-4 h-4" style={{ color: "hsl(38 72% 62%)" }} />
          <h3 className="font-extrabold text-[13px]" style={{ color: "hsl(38 82% 80%)" }}>
            الأنشطة الأخيرة
          </h3>
        </div>

        {/* Log list */}
        <div className="divide-y" style={{ borderColor: "hsl(38 35% 82% / 0.6)" }}>
          {logs?.map((log) => (
            <div
              key={log.id}
              className="px-4 py-3 flex justify-between items-start"
            >
              <div>
                <div className="font-bold text-[13px]" style={{ color: "hsl(22 45% 25%)" }}>
                  {log.action === "CREATE" ? "إضافة " : log.action === "UPDATE" ? "تعديل " : "حذف "}
                  {log.entity_name || log.entity_type}
                </div>
                <div className="text-[11px] mt-0.5" style={{ color: "hsl(38 30% 52%)" }}>
                  بواسطة: {log.performed_by}
                </div>
              </div>
              <div
                className="flex items-center gap-1 text-[10px] font-semibold whitespace-nowrap"
                style={{ color: "hsl(38 35% 55%)" }}
              >
                <Clock className="w-3 h-3" />
                {format(new Date(log.created_at), "MM/dd HH:mm")}
              </div>
            </div>
          ))}
          {(!logs || logs.length === 0) && (
            <div
              className="text-center py-8 text-[13px] font-semibold"
              style={{ color: "hsl(38 30% 58%)" }}
            >
              لا توجد أنشطة مسجلة
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
