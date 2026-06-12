/**
 * useNotificationPermission - Phase 16
 * Manages browser notification permissions with graceful degradation.
 * Provides visible UI controls for requesting notification access.
 */
import { useState, useCallback, useEffect } from "react";

export type NotificationPermissionStatus = "granted" | "denied" | "prompt" | "unsupported" | "unknown";

const NOTIFICATION_PREFS_KEY = "mawaeedak_notification_prefs_v1";

interface NotificationPrefs {
  permissionStatus: NotificationPermissionStatus;
  lastUpdated: string | null;
  source: "user" | "default";
}

function loadPrefs(): NotificationPrefs {
  try {
    const raw = localStorage.getItem(NOTIFICATION_PREFS_KEY);
    if (!raw) return { permissionStatus: "unknown", lastUpdated: null, source: "default" };
    return JSON.parse(raw);
  } catch {
    return { permissionStatus: "unknown", lastUpdated: null, source: "default" };
  }
}

function savePrefs(prefs: NotificationPrefs): void {
  localStorage.setItem(NOTIFICATION_PREFS_KEY, JSON.stringify(prefs));
}

export function useNotificationPermission() {
  const [prefs, setPrefs] = useState<NotificationPrefs>(loadPrefs);
  const [isRequesting, setIsRequesting] = useState(false);
  const [isSupported, setIsSupported] = useState<boolean | null>(null);

  useEffect(() => {
    const supported = "Notification" in window && "serviceWorker" in navigator;
    setIsSupported(supported);
  }, []);

  const getCurrentStatus = useCallback((): NotificationPermissionStatus => {
    if (!("Notification" in window)) return "unsupported";
    if (!navigator.serviceWorker) return "unsupported";
    const status = Notification.permission;
    if (status === "granted") return "granted";
    if (status === "denied") return "denied";
    return "prompt";
  }, []);

  const syncWithBrowser = useCallback(() => {
    const currentStatus = getCurrentStatus();
    if (currentStatus !== prefs.permissionStatus) {
      const newPrefs: NotificationPrefs = {
        permissionStatus: currentStatus,
        lastUpdated: new Date().toISOString(),
        source: "user",
      };
      setPrefs(newPrefs);
      savePrefs(newPrefs);
    }
    return currentStatus;
  }, [getCurrentStatus, prefs.permissionStatus]);

  const requestPermission = useCallback(async (): Promise<{ success: boolean; status: NotificationPermissionStatus; message: string }> => {
    if (!("Notification" in window)) {
      return { success: false, status: "unsupported", message: "المتصفح لا يدعم الإشعارات" };
    }
    if (!navigator.serviceWorker) {
      return { success: false, status: "unsupported", message: "لا يوجد Service Worker" };
    }
    setIsRequesting(true);
    try {
      if (Notification.permission === "denied") {
        const newPrefs: NotificationPrefs = {
          permissionStatus: "denied",
          lastUpdated: new Date().toISOString(),
          source: "user",
        };
        setPrefs(newPrefs);
        savePrefs(newPrefs);
        return {
          success: false,
          status: "denied",
          message: "تم رفض الإشعارات مسبقاً. يمكنك تفعيلها من إعدادات المتصفح.",
        };
      }
      const permission = await Notification.requestPermission();
      const newStatus: NotificationPermissionStatus = permission === "granted" ? "granted" 
        : permission === "denied" ? "denied" 
        : "prompt";
      const newPrefs: NotificationPrefs = {
        permissionStatus: newStatus,
        lastUpdated: new Date().toISOString(),
        source: "user",
      };
      setPrefs(newPrefs);
      savePrefs(newPrefs);
      if (permission === "granted") {
        try {
          const registration = await navigator.serviceWorker.ready;
          console.log("Notification permission granted, service worker ready:", registration.scope);
        } catch (e) {
          console.log("Service worker registration for push not available:", e);
        }
        return {
          success: true,
          status: "granted",
          message: "تم تفعيل الإشعارات بنجاح",
        };
      }
      return {
        success: false,
        status: newStatus,
        message: newStatus === "denied" 
          ? "تم رفض الإذن. يمكنك تغييره من إعدادات المتصفح."
          : "تم إلغاء طلب الإشعارات",
      };
    } catch (error) {
      console.error("Notification permission error:", error);
      return {
        success: false,
        status: "unknown",
        message: "حدث خطأ أثناء طلب إذن الإشعارات",
      };
    } finally {
      setIsRequesting(false);
    }
  }, []);

  const getIPhoneGuidance = useCallback((): string | null => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    if (isIOS && isSafari && !window.matchMedia("(display-mode: standalone)").matches) {
      return "لإشعارات iPhone: أضف مواعيدك إلى الشاشة الرئيسية ثم فعّل الإشعارات.";
    }
    return null;
  }, []);

  const getStatusLabel = useCallback((status: NotificationPermissionStatus): string => {
    switch (status) {
      case "granted": return "مفعلة";
      case "denied": return "مرفوضة";
      case "prompt": return "غير مفعلة";
      case "unsupported": return "غير مدعومة";
      default: return "غير مفعلة";
    }
  }, []);

  useEffect(() => {
    syncWithBrowser();
  }, [syncWithBrowser]);

  return {
    status: prefs.permissionStatus,
    statusLabel: getStatusLabel(prefs.permissionStatus),
    isRequesting,
    isSupported,
    iPhoneGuidance: getIPhoneGuidance(),
    requestPermission,
    syncWithBrowser,
  };
}
