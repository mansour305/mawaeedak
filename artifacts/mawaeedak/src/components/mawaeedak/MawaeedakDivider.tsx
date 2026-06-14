interface MawaeedakDividerProps {
  className?: string;
  label?: string;
}

export function MawaeedakDivider({ className = "", label }: MawaeedakDividerProps) {
  return (
    <div className={`mw-divider ${className}`}>
      {label && (
        <span
          style={{
            fontSize: "11px",
            fontWeight: 700,
            color: "hsl(38 45% 52%)",
            fontFamily: "'Tajawal', sans-serif",
          }}
        >
          {label}
        </span>
      )}
      {!label && <div className="mw-divider-diamond" />}
    </div>
  );
}

