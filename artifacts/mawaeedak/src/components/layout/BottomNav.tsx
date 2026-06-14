import { CalendarDays, Grid2X2, Home, MoreHorizontal, Wallet } from "lucide-react";
import { Link, useLocation } from "wouter";

const GOLD = "#C9A063";
const BROWN = "#8A6B3D";

const tabs = [
  { href: "/calendar", label: "التقويم", icon: CalendarDays, match: (path: string) => path.startsWith("/calendar") },
  { href: "/salaries", label: "الرواتب", icon: Wallet, match: (path: string) => path.startsWith("/salaries") || path.startsWith("/finance") },
  { href: "/", label: "الرئيسية", icon: Home, match: (path: string) => path === "/" },
  { href: "/services", label: "الخدمات", icon: Grid2X2, match: (path: string) => path.startsWith("/services") || path.startsWith("/centers") },
  { href: "/more", label: "المزيد", icon: MoreHorizontal, match: (path: string) => path.startsWith("/more") || path.startsWith("/account") },
];

export function BottomNav() {
  const [location] = useLocation();

  return (
    <nav
      dir="rtl"
      className="fixed bottom-3 left-1/2 z-50 grid h-[76px] w-[calc(100%-24px)] max-w-[456px] -translate-x-1/2 grid-cols-5 overflow-hidden rounded-[28px] border bg-white/90 px-2 py-2 backdrop-blur"
      style={{
        borderColor: "rgba(201,160,99,0.24)",
        boxShadow: "0 18px 42px rgba(47,43,37,0.16)",
      }}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const active = tab.match(location);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-label={tab.label}
            className="flex min-w-0 flex-col items-center justify-center gap-1 rounded-[22px] px-1 transition active:scale-[0.98]"
            style={{
              background: active ? "linear-gradient(180deg, #F3E8D6, #FFFFFF)" : "transparent",
              color: active ? BROWN : "#6F6557",
            }}
          >
            <Icon className="h-6 w-6" strokeWidth={active ? 2.3 : 1.8} style={{ color: active ? GOLD : "#77716A" }} />
            <span className="truncate text-[11px] font-extrabold">{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

