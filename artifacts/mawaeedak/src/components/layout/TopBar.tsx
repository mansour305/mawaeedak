import { Bell, Menu } from "lucide-react";
import MawaeedakLogoSvg from "@/assets/brand/mawaeedak-logo.svg";
import { Link } from "wouter";
import { useGatewayUnreadCount } from "@/hooks/useGatewayData";

interface TopBarProps {
  title?: string;
  showBack?: boolean;
}

interface MawaeedakLogoProps {
  compact?: boolean;
}

function Mark({ compact = false }: MawaeedakLogoProps) {
  return (
    <div className="flex items-center gap-2">
      <img 
        src={MawaeedakLogoSvg} 
        alt="مواعيدك" 
        className={compact ? "h-16 w-auto" : "h-11 w-auto"}
      />
    </div>
  );
}

export function MawaeedakLogo({ compact = false }: MawaeedakLogoProps) {
  return <Mark compact={compact} />;
}

export function TopBar({ title }: TopBarProps) {
  const { data: unreadCount } = useGatewayUnreadCount();
  const count = unreadCount ?? 0;

  return (
    <header dir="rtl" className="sticky top-0 z-40 w-full border-b border-[rgba(201,149,58,0.20)] bg-[rgba(255,253,248,0.98)] backdrop-blur-xl shadow-[0_4px_20px_rgba(90,60,20,0.08)]">
      <div className="flex min-h-[72px] items-center justify-between gap-3 px-5">
        <div className="maw-icon-btn">
          <Menu className="h-6 w-6" />
        </div>
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <Mark />
          {title && title !== "الرئيسية" ? <h1 className="mt-1 text-[18px] font-extrabold text-[#1A1614]">{title}</h1> : null}
        </div>
        <Link href="/notifications" className="relative maw-icon-btn">
          <Bell className="h-6 w-6" />
          {count > 0 ? <span className="absolute -left-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-[#C9953A] px-1 text-[10px] font-bold text-white shadow-gold">{count > 9 ? "9+" : count}</span> : null}
        </Link>
      </div>
    </header>
  );
}
