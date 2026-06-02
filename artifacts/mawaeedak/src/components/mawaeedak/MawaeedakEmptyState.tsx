import { type ReactNode } from "react";

interface MawaeedakEmptyStateProps {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function MawaeedakEmptyState({ icon, title, subtitle, action }: MawaeedakEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12 px-6 text-center">
      <div className="mw-empty-icon-box">
        {icon}
      </div>
      <div className="flex flex-col gap-1">
        <p
          style={{
            fontSize: "15px",
            fontWeight: 800,
            color: "hsl(var(--foreground))",
            fontFamily: "'Tajawal', sans-serif",
          }}
        >
          {title}
        </p>
        {subtitle && (
          <p
            style={{
              fontSize: "12px",
              fontWeight: 500,
              color: "hsl(var(--muted-foreground))",
              fontFamily: "'Tajawal', sans-serif",
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
