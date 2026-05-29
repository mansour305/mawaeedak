import { type ReactNode } from "react";

interface MawaeedakBadgeProps {
  children: ReactNode;
  variant?: "gold" | "dark" | "green" | "red" | "cream";
  className?: string;
}

export function MawaeedakBadge({ children, variant = "gold", className = "" }: MawaeedakBadgeProps) {
  const variantClass =
    variant === "dark"  ? "mw-badge mw-badge-dark" :
    variant === "green" ? "mw-badge mw-badge-green" :
    variant === "red"   ? "mw-badge mw-badge-red" :
    variant === "cream" ? "mw-badge mw-badge-cream" :
                          "mw-badge mw-badge-gold";

  return (
    <span className={`${variantClass} ${className}`}>
      {children}
    </span>
  );
}
