/**
 * CentersPage — Saudi Premium Minimal Services
 *
 * Features:
 * - Title: الخدمات
 * - Subtitle: خدمات منظمة تساعدك في يومك
 * - Section title: الخدمات المتاحة
 * - 8 premium service cards with icons
 * - Bottom blessing card with Salawat
 * - No user-facing technical text
 */

import { Link } from "wouter";
import { AppShell } from "@/components/layout/AppShell";
import {
  Calculator, Bell, Briefcase, Gift, GraduationCap, MessageSquare, Plane, Target,
} from "lucide-react";

// Services in required order - only 8 visible services
const visibleServices = [
  { title: "احسب هدفك", subtitle: "حدد هدفك وخطة التوفير", icon: Target, path: "/services/goals", status: "ready" },
  { title: "حساب التكاليف", subtitle: "قائمة البنود والمصروفات", icon: Calculator, path: "/services/costs", status: "ready" },
  { title: "ذكرني", subtitle: "تذكيرات ومواعيد", icon: Bell, path: "/services/reminders", status: "ready" },
  { title: "السفر", subtitle: "رحلاتي القادمة", icon: Plane, path: "/centers/travel", status: "ready" },
  { title: "الدراسة والإجازات", subtitle: "جدولي الدراسي والإجازات", icon: GraduationCap, path: "/centers/study", status: "ready" },
  { title: "الوظائف والأخبار", subtitle: "فرص وظيفية ومستجدات", icon: Briefcase, path: "/centers/jobs", status: "ready" },
  { title: "بطاقة اليوم", subtitle: "شارك يومك مع الآخرين", icon: Gift, path: "/daily-card", status: "ready" },
  { title: "صوتك مسموع", subtitle: "شكاوى واقتراحات", icon: MessageSquare, path: "/centers/complaints", status: "ready" },
];

// Coming Soon badge
function ComingSoonBadge() {
  return (
    <span 
      className="absolute -top-1 -left-1 text-[8px] font-bold px-1.5 py-0.5 rounded-full"
      style={{ 
        background: "linear-gradient(135deg, hsl(38 72% 52%), hsl(28 68% 38%))",
        color: "white",
      }}
    >
      قريباً
    </span>
  );
}

export default function CentersPage() {
  return (
    <AppShell title="الخدمات">
      <div className="space-y-6">
        <p className="text-center text-[16px] font-semibold" style={{ color: "#6F6557" }}>
          خدمات منظمة تساعدك في يومك
        </p>

        {/* Section title */}
        <div className="flex items-center gap-3">
          <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, transparent, rgba(201,160,99,0.4))" }} />
          <h2 className="text-[18px] font-bold" style={{ color: "#A78042" }}>
            الخدمات المتاحة
          </h2>
          <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, rgba(201,160,99,0.4), transparent)" }} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {visibleServices.map((service) => {
            const Icon = service.icon;
            const isReady = service.status === "ready";
            
            return (
              <Link key={service.title} href={isReady ? service.path : "#"}>
                <article
                  className={`relative flex min-h-[174px] flex-col items-center justify-center rounded-[24px] border bg-white/82 p-5 text-center transition ${isReady ? "active:scale-[0.98] cursor-pointer" : "opacity-60 cursor-not-allowed"}`}
                  style={{
                    borderColor: "rgba(201,160,99,0.22)",
                    boxShadow: "0 14px 34px rgba(138,107,61,0.10)",
                  }}
                >
                  {!isReady && <ComingSoonBadge />}
                  <div 
                    className="grid h-16 w-16 place-items-center rounded-[20px]" 
                    style={{ 
                      background: "linear-gradient(135deg, rgba(201,160,99,0.15), rgba(201,160,99,0.05))",
                      color: "#C9A063",
                    }}
                  >
                    <Icon className="h-10 w-10" strokeWidth={1.5} />
                  </div>
                  <h3 className="mt-3 text-[20px] font-extrabold leading-tight" style={{ color: "#2F2B25" }}>
                    {service.title}
                  </h3>
                  <p className="mt-2 max-w-[180px] text-[14px] font-bold leading-6" style={{ color: "#6F6557" }}>
                    {service.subtitle}
                  </p>
                </article>
              </Link>
            );
          })}
        </div>

        {/* Blessing card */}
        <div 
          className="relative overflow-hidden rounded-[24px] border p-6 text-center"
          style={{ 
            borderColor: "rgba(201,160,99,0.25)",
            background: "linear-gradient(180deg, #FAF7F2 0%, #FFFDF8 100%)",
            boxShadow: "0 8px 24px rgba(138,107,61,0.08)",
          }}
        >
          {/* Ornamental gold divider */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-10 flex-1" style={{ background: "linear-gradient(90deg, transparent, #C9A063)" }} />
            <span className="text-lg" style={{ color: "#C9A063" }}>✦</span>
            <div className="h-px w-10 flex-1" style={{ background: "linear-gradient(90deg, #C9A063, transparent)" }} />
          </div>

          <p 
            className="text-xl font-bold leading-relaxed"
            style={{ 
              color: "#8A6B3D",
              fontFamily: "'Noto Kufi Arabic', Cairo, sans-serif",
            }}
          >
            اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّد ﷺ
          </p>
        </div>
      </div>
    </AppShell>
  );
}

