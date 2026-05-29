/**
 * CentersPage — Phase 13L
 * Heritage tile grid matching reference design.
 * Richer gold borders, ornate icon containers, shadow depth.
 */
import { AppShell } from "@/components/layout/AppShell";
import { Link } from "wouter";
import { Briefcase, Plane, BookOpen, Newspaper, Search, Gift, MessageSquare, HeadphonesIcon } from "lucide-react";

const centers = [
  {
    id: "work",
    title: "مركز الأعمال",
    icon: Briefcase,
    path: "/centers/work",
  },
  {
    id: "travel",
    title: "مركز السفر",
    icon: Plane,
    path: "/centers/travel",
  },
  {
    id: "study",
    title: "الدراسة والإجازات",
    icon: BookOpen,
    path: "/centers/study",
  },
  {
    id: "news",
    title: "مركز الأخبار",
    icon: Newspaper,
    path: "/centers/news",
  },
  {
    id: "jobs",
    title: "مركز الوظائف",
    icon: Search,
    path: "/centers/jobs",
  },
  {
    id: "greetings",
    title: "مركز التهاني",
    icon: Gift,
    path: "/centers/greetings",
  },
  {
    id: "complaints",
    title: "الشكاوى والاقتراحات",
    icon: MessageSquare,
    path: "/centers/complaints",
  },
  {
    id: "support",
    title: "اتصل بنا",
    icon: HeadphonesIcon,
    path: "/support",
  },
];

const GoldCorner = ({ pos }: { pos: "tl" | "tr" | "bl" | "br" }) => {
  const [t, r, b, l] = [pos.includes("t"), pos.includes("r"), pos.includes("b"), pos.includes("l")];
  return (
    <svg
      viewBox="0 0 12 12"
      style={{
        position: "absolute",
        width: 12, height: 12,
        top: t ? 4 : "auto",
        bottom: b ? 4 : "auto",
        right: r ? 4 : "auto",
        left: l ? 4 : "auto",
        opacity: 0.55,
      }}
      fill="none"
      stroke="hsl(38 68% 46%)"
      strokeWidth="1.5"
    >
      {t && r && <><line x1="12" y1="0" x2="5" y2="0"/><line x1="12" y1="0" x2="12" y2="7"/></>}
      {t && l && <><line x1="0" y1="0" x2="7" y2="0"/><line x1="0" y1="0" x2="0" y2="7"/></>}
      {b && r && <><line x1="12" y1="12" x2="5" y2="12"/><line x1="12" y1="12" x2="12" y2="5"/></>}
      {b && l && <><line x1="0" y1="12" x2="7" y2="12"/><line x1="0" y1="12" x2="0" y2="5"/></>}
    </svg>
  );
};

export default function CentersPage() {
  return (
    <AppShell title="المراكز">
      <div className="grid grid-cols-2 gap-3 pb-6">
        {centers.map((center) => {
          const Icon = center.icon;
          return (
            <Link key={center.id} href={center.path}>
              <div
                className="relative rounded-2xl cursor-pointer group active:scale-[0.96] transition-all duration-200"
                style={{
                  background:
                    "linear-gradient(145deg, hsl(36 42% 96%) 0%, hsl(34 34% 92%) 55%, hsl(33 30% 88%) 100%)",
                  border: "1.5px solid hsl(34 48% 66% / 0.75)",
                  boxShadow:
                    "0 4px 18px -4px rgba(60,28,4,0.22), " +
                    "0 2px 6px -2px rgba(60,28,4,0.12), " +
                    "inset 0 1px 0 rgba(255,242,200,0.20)",
                  overflow: "hidden",
                }}
              >
                {/* Corner ornaments */}
                <GoldCorner pos="tl" />
                <GoldCorner pos="tr" />
                <GoldCorner pos="bl" />
                <GoldCorner pos="br" />

                {/* Subtle top gold strip */}
                <div
                  style={{
                    height: "2px",
                    background: "linear-gradient(to right, transparent, hsl(38 68% 52% / 0.50), transparent)",
                  }}
                />

                <div className="p-5 flex flex-col items-center justify-center text-center gap-3">
                  {/* Icon container */}
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                    style={{
                      background:
                        "linear-gradient(145deg, hsl(28 55% 30% / 0.15) 0%, hsl(20 50% 25% / 0.10) 100%)",
                      border: "1.5px solid hsl(34 50% 56% / 0.50)",
                      boxShadow:
                        "0 2px 8px -2px rgba(60,28,4,0.18), " +
                        "inset 0 1px 0 rgba(255,228,150,0.14)",
                    }}
                  >
                    <Icon
                      className="w-7 h-7"
                      strokeWidth={1.75}
                      style={{ color: "hsl(28 58% 32%)" }}
                    />
                  </div>

                  <h3
                    className="font-bold text-[13px] leading-snug"
                    style={{ color: "hsl(20 48% 22%)" }}
                  >
                    {center.title}
                  </h3>
                </div>

                {/* Bottom gold strip */}
                <div
                  style={{
                    height: "2px",
                    background: "linear-gradient(to right, transparent, hsl(38 68% 52% / 0.40), transparent)",
                  }}
                />
              </div>
            </Link>
          );
        })}
      </div>
    </AppShell>
  );
}
