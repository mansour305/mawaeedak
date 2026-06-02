import { type ReactNode } from "react";

interface MawaeedakSectionProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
}

function SectionDiamond({ size = 5 }: { size?: number }) {
  return (
    <svg viewBox="0 0 10 10" style={{ width: size, height: size, flexShrink: 0 }} fill="hsl(var(--primary))">
      <polygon points="5,0 10,5 5,10 0,5" />
    </svg>
  );
}

function SectionMark({ size = 11 }: { size?: number }) {
  return (
    <svg viewBox="0 0 16 16" style={{ width: size, height: size, flexShrink: 0 }} fill="hsl(var(--primary))">
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
            style={{ background: "linear-gradient(to left, hsl(var(--border)), transparent)" }}
          />
          <SectionDiamond size={5} />
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <SectionMark size={11} />
          <span
            style={{
              fontSize: "14px",
              fontWeight: 800,
              color: "hsl(var(--foreground))",
              fontFamily: "'Tajawal', sans-serif",
            }}
          >
            {title}
          </span>
          <SectionMark size={11} />
        </div>
        <div className="flex items-center gap-1.5 flex-1">
          <SectionDiamond size={5} />
          <div
            className="flex-1 h-px"
            style={{ background: "linear-gradient(to right, hsl(var(--border)), transparent)" }}
          />
        </div>
        {action && <div className="shrink-0 mr-1">{action}</div>}
      </div>
      {subtitle && (
        <p className="text-center text-[11px]" style={{ color: "hsl(var(--muted-foreground))" }}>{subtitle}</p>
      )}
    </div>
  );
}
