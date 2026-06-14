/**
 * EmptyState Component — مواعيدك
 * 
 * يعرض حالة فارغة عند عدم وجود بيانات.
 */

import { Calendar, CalendarDays, FileText, Inbox, MessageSquare, SearchX, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

interface EmptyStateProps {
  icon?: "calendar" | "wallet" | "message" | "search" | "inbox" | "file";
  title: string;
  description?: string;
  actionLabel?: string;
  actionPath?: string;
  onAction?: () => void;
}

const iconMap = {
  calendar: CalendarDays,
  wallet: Wallet,
  message: MessageSquare,
  search: SearchX,
  inbox: Inbox,
  file: FileText,
  calendarAlt: Calendar,
};

export function EmptyState({
  icon = "inbox",
  title,
  description,
  actionLabel,
  actionPath,
  onAction,
}: EmptyStateProps) {
  const Icon = iconMap[icon] || Inbox;

  return (
    <div
      className="flex flex-col items-center justify-center py-16 px-6 text-center"
      dir="rtl"
    >
      <div
        className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border"
        style={{
          background: "rgba(201, 160, 99, 0.08)",
          borderColor: "rgba(201, 160, 99, 0.24)",
        }}
      >
        <Icon className="h-10 w-10" style={{ color: "#C9A063" }} strokeWidth={1.5} />
      </div>

      <h3
        className="mb-2 text-xl font-bold"
        style={{ color: "#2F2B25" }}
      >
        {title}
      </h3>

      {description && (
        <p
          className="mb-6 max-w-[280px] text-sm leading-relaxed"
          style={{ color: "#6F6557" }}
        >
          {description}
        </p>
      )}

      {(actionLabel && actionPath) && (
        <Link href={actionPath}>
          <Button
            className="h-12 rounded-xl font-bold px-6"
            style={{
              background: "linear-gradient(135deg, #C9A063, #A78042)",
              border: "none",
            }}
          >
            {actionLabel}
          </Button>
        </Link>
      )}

      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          className="h-12 rounded-xl font-bold px-6"
          style={{
            background: "linear-gradient(135deg, #C9A063, #A78042)",
            border: "none",
          }}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

/**
 * Loading State Component
 */
export function LoadingState({ message = "جاري التحميل..." }: { message?: string }) {
  return (
    <div
      className="flex min-h-[200px] flex-col items-center justify-center py-12"
      dir="rtl"
    >
      <div
        className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-t-transparent"
        style={{
          borderColor: "rgba(201, 160, 99, 0.3)",
          borderTopColor: "#C9A063",
        }}
      />
      <p className="text-sm font-semibold" style={{ color: "#8A6B3D" }}>
        {message}
      </p>
    </div>
  );
}

/**
 * Error State Component
 */
export function ErrorState({
  message = "حدث خطأ غير متوقع",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div
      className="flex min-h-[200px] flex-col items-center justify-center py-12 px-6"
      dir="rtl"
    >
      <div
        className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-red-200 bg-red-50"
      >
        <span className="text-3xl">⚠️</span>
      </div>

      <h3 className="mb-2 text-lg font-bold" style={{ color: "#B9483F" }}>
        {message}
      </h3>

      {onRetry && (
        <Button
          onClick={onRetry}
          variant="outline"
          className="mt-4 h-11 rounded-xl font-bold"
          style={{
            borderColor: "rgba(201, 160, 99, 0.4)",
            color: "#8A6B3D",
          }}
        >
          إعادة المحاولة
        </Button>
      )}
    </div>
  );
}
