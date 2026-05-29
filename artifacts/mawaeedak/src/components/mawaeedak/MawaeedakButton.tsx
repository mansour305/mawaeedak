import { type ReactNode } from "react";
import { Loader2 } from "lucide-react";

interface MawaeedakButtonProps {
  children: ReactNode;
  variant?: "gold" | "dark" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  type?: "button" | "submit" | "reset";
  fullWidth?: boolean;
}

export function MawaeedakButton({
  children,
  variant = "gold",
  size = "md",
  onClick,
  disabled,
  loading,
  className = "",
  type = "button",
  fullWidth = false,
}: MawaeedakButtonProps) {
  const cls =
    variant === "dark"    ? "mw-btn-dark" :
    variant === "outline" ? "mw-btn-outline" :
    variant === "ghost"   ? "mw-btn-outline" :
                            "mw-btn-gold";

  const heightMap = { sm: "32px", md: "44px", lg: "52px" };
  const fontMap   = { sm: "12px", md: "14px", lg: "16px" };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${cls} ${className}`}
      style={{
        height: heightMap[size],
        fontSize: fontMap[size],
        width: fullWidth ? "100%" : undefined,
        opacity: (disabled || loading) ? 0.65 : 1,
      }}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
}
