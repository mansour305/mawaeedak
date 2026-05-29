import { type ReactNode } from "react";

interface MawaeedakSectionProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
}

function GoldDiamond({ size = 5 }: { size?: number }) {
  return (
    <svg viewBox="0 0 10 10" style={{ width: size, height: size, flexShrink: 0 }} fill="hsl(38 65% 52%)">
      <polygon points="5,0 10,5 5,10 0,5" />
    </svg>
  );
}

function GoldStar({ size = 11 }: { size?: number }) {
  return (
    <svg viewBox="0 0 16 16" style={{ width: size, height: size, flexShrink: 0 }} fill="hsl(38 60% 56%)">
      <path d="M8,0 L10,5.5 L16,5.5 L11.5,9 L13.5,15 L8,11.5 L2.5,15 L4.5,9 L0,5.5 L6,5.5Z" />
    </svg>
  );
}

export function MawaeedakSection({ title, subtitle, action, className = "" }: MawaeedakSectionProps) {
  return (
    <div className={`flex flex-col gap-0.5 ${className}`}>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 flex-1">
          <div
            className="flex-1 h-px"
            style={{ background: "linear-gradient(to left, hsl(38 55% 58% / 0.9), transparent)" }}
          />
          <GoldDiamond size={5} />
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <GoldStar size={11} />
          <span
            style={{
              fontSize: "14px",
              fontWeight: 800,
              color: "hsl(20 52% 12%)",
              fontFamily: "'Tajawal', sans-serif",
            }}
          >
            {title}
          </span>
          <GoldStar size={11} />
        </div>
        <div className="flex items-center gap-1.5 flex-1">
          <GoldDiamond size={5} />
          <div
            className="flex-1 h-px"
            style={{ background: "linear-gradient(to right, hsl(38 55% 58% / 0.9), transparent)" }}
          />
        </div>
        {action && <div className="shrink-0 mr-1">{action}</div>}
      </div>
      {subtitle && (
        <p className="text-center text-[11px]" style={{ color: "hsl(24 18% 52%)" }}>{subtitle}</p>
      )}
    </div>
  );
}
