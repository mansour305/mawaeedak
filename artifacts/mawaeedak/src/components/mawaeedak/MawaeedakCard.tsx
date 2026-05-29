import { type ReactNode } from "react";

interface MawaeedakCardProps {
  children: ReactNode;
  variant?: "cream" | "dark" | "gold" | "elevated";
  className?: string;
  cornerOrnament?: boolean;
  onClick?: () => void;
}

export function MawaeedakCard({
  children,
  variant = "cream",
  className = "",
  cornerOrnament = false,
  onClick,
}: MawaeedakCardProps) {
  const variantClass =
    variant === "dark"     ? "mw-card mw-card-dark" :
    variant === "gold"     ? "mw-card mw-card-gold" :
    variant === "elevated" ? "mw-card mw-card-elevated" :
                             "mw-card";

  return (
    <div
      className={`${variantClass} ${cornerOrnament ? "mw-corner-tl mw-corner-tr" : ""} ${className}`}
      onClick={onClick}
      style={onClick ? { cursor: "pointer" } : undefined}
    >
      {children}
    </div>
  );
}
