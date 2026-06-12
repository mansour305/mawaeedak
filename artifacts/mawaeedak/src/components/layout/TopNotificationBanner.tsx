/**
 * Top Notification Banner — مواعيدك
 * 
 * إشعار علوي يظهر في أعلى الشاشة مع إمكانية الإغلاق والتأجيل
 */

import { useEffect, useState, useCallback } from "react";
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle, Clock } from "lucide-react";

export type NotificationType = "success" | "error" | "info" | "warning";

export type TopNotification = {
  id: string;
  message: string;
  type: NotificationType;
  duration?: number;
  priority?: "high" | "normal" | "low";
  actionUrl?: string;
  actionLabel?: string;
};

export type SnoozeOption = {
  label: string;
  minutes: number;
};

// Snooze options
export const SNOOZE_OPTIONS: SnoozeOption[] = [
  { label: "10 دقائق", minutes: 10 },
  { label: "30 دقيقة", minutes: 30 },
  { label: "ساعة", minutes: 60 },
  { label: "غداً", minutes: 1440 },
];

// Storage key for snoozed notifications
const SNOOZED_KEY = "mawaeedak_snoozed_notifications_v1";

type SnoozedEntry = {
  notificationId: string;
  snoozedUntil: string;
};

function loadSnoozed(): SnoozedEntry[] {
  try {
    const raw = localStorage.getItem(SNOOZED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveSnoozed(entries: SnoozedEntry[]): void {
  try {
    localStorage.setItem(SNOOZED_KEY, JSON.stringify(entries));
  } catch {
    // Ignore
  }
}

function isSnoozed(notificationId: string): boolean {
  const snoozed = loadSnoozed();
  const entry = snoozed.find(e => e.notificationId === notificationId);
  if (!entry) return false;
  return new Date(entry.snoozedUntil) > new Date();
}

function snoozeNotification(notificationId: string, minutes: number): void {
  const snoozed = loadSnoozed().filter(e => e.notificationId !== notificationId);
  const until = new Date(Date.now() + minutes * 60 * 1000);
  snoozed.push({ notificationId, snoozedUntil: until.toISOString() });
  saveSnoozed(snoozed);
}

function dismissSnooze(notificationId: string): void {
  const snoozed = loadSnoozed().filter(e => e.notificationId !== notificationId);
  saveSnoozed(snoozed);
}

// Global notification queue
let globalListeners: ((notification: TopNotification) => void)[] = [];

export function showTopNotification(message: string, type: NotificationType = "info", duration = 4000) {
  const notification: TopNotification = {
    id: `top-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    message,
    type,
    duration,
  };
  
  globalListeners.forEach(listener => listener(notification));
}

export function onTopNotification(callback: (notification: TopNotification) => void) {
  globalListeners.push(callback);
  return () => {
    globalListeners = globalListeners.filter(l => l !== callback);
  };
}

const ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

const COLORS = {
  success: { bg: "bg-emerald-500", text: "text-white", border: "border-emerald-600" },
  error: { bg: "bg-red-500", text: "text-white", border: "border-red-600" },
  info: { bg: "bg-blue-500", text: "text-white", border: "border-blue-600" },
  warning: { bg: "bg-amber-500", text: "text-white", border: "border-amber-600" },
};

function SingleBanner({ 
  notification, 
  onClose,
  onSnooze,
  onAction,
}: { 
  notification: TopNotification; 
  onClose: () => void;
  onSnooze: (minutes: number) => void;
  onAction?: () => void;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [showSnoozeMenu, setShowSnoozeMenu] = useState(false);
  const Icon = ICONS[notification.type];
  const colors = COLORS[notification.type];

  useEffect(() => {
    // Slide in
    setIsVisible(true);
    
    // Auto hide after duration
    const timer = setTimeout(() => {
      setIsLeaving(true);
      setTimeout(onClose, 300);
    }, notification.duration || 4000);

    return () => clearTimeout(timer);
  }, [notification, onClose, notification.duration]);

  const handleSnooze = (minutes: number) => {
    onSnooze(minutes);
    setIsLeaving(true);
    setTimeout(onClose, 300);
  };

  return (
    <div
      className={`
        fixed top-0 left-0 right-0 z-[9999] flex flex-col
        shadow-lg transition-all duration-300
        ${colors.bg} ${colors.text}
        ${isVisible && !isLeaving ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"}
      `}
      style={{ 
        maxWidth: "480px", 
        margin: "0 auto",
        direction: "rtl",
      }}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <Icon className="h-5 w-5 shrink-0" />
        <p className="flex-1 text-sm font-medium">{notification.message}</p>
        
        {/* Action button if available */}
        {notification.actionUrl && notification.actionLabel && (
          <button
            onClick={onAction}
            className="text-xs font-bold underline underline-offset-2 opacity-90"
          >
            {notification.actionLabel}
          </button>
        )}
        
        {/* Snooze button */}
        <button
          onClick={() => setShowSnoozeMenu(!showSnoozeMenu)}
          className="rounded-full p-1 opacity-80 transition-opacity hover:opacity-100"
          title="تأجيل"
        >
          <Clock className="h-4 w-4" />
        </button>
        
        {/* Close button */}
        <button
          onClick={() => {
            setIsLeaving(true);
            setTimeout(onClose, 300);
          }}
          className="rounded-full p-1 opacity-80 transition-opacity hover:opacity-100"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      
      {/* Snooze menu */}
      {showSnoozeMenu && (
        <div 
          className="px-4 pb-3 flex gap-2 flex-wrap"
          style={{ borderTop: "1px solid rgba(255,255,255,0.2)" }}
        >
          <span className="text-xs opacity-75 py-1">تأجيل:</span>
          {SNOOZE_OPTIONS.map(option => (
            <button
              key={option.minutes}
              onClick={() => handleSnooze(option.minutes)}
              className="text-xs px-2 py-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Container component that manages multiple notifications
export function TopNotificationContainer() {
  const [notifications, setNotifications] = useState<TopNotification[]>([]);

  useEffect(() => {
    return onTopNotification((notification) => {
      // Check if snoozed
      if (isSnoozed(notification.id)) {
        return;
      }
      
      // Add notification
      setNotifications(prev => {
        // Limit to 3 notifications max to avoid stacking
        const updated = [...prev, notification];
        return updated.slice(-3);
      });
    });
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    dismissSnooze(id);
  }, []);

  const snoozeNotificationHandler = useCallback((id: string, minutes: number) => {
    snoozeNotification(id, minutes);
  }, []);

  const handleAction = useCallback((notification: TopNotification) => {
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  }, []);

  return (
    <>
      {notifications.map((notification) => (
        <SingleBanner
          key={notification.id}
          notification={notification}
          onClose={() => removeNotification(notification.id)}
          onSnooze={(minutes) => snoozeNotificationHandler(notification.id, minutes)}
          onAction={notification.actionUrl ? () => handleAction(notification) : undefined}
        />
      ))}
    </>
  );
}