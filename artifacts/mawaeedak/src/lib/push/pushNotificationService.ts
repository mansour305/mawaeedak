/**
 * pushNotificationService.ts — Phase 15
 * 
 * Web Push Notification Foundation for Mawaeedak
 * 
 * This module provides the foundation for real push notifications that work
 * when the app is closed. Uses the Web Push API with Supabase backend.
 * 
 * SECURITY: VAPID keys must NOT be committed to the repository.
 * See .env.example for required environment variables.
 */

import { supabase } from "../supabase";
import { DATA_SOURCE_MODE } from "../dataSourceMode";

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface PushSubscriptionRecord {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  user_agent: string;
  created_at: string;
  updated_at: string;
}

// Check if Supabase is enabled (production mode)
function isSupabaseEnabled(): boolean {
  return DATA_SOURCE_MODE === "supabase" || DATA_SOURCE_MODE === "supabase_shadow";
}

// Check if Push API is supported
export function isPushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

// Check if notification permission is granted
export async function getNotificationPermission(): Promise<NotificationPermission> {
  if (!isPushSupported()) return "denied";
  return Notification.permission;
}

// Request notification permission
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isPushSupported()) {
    console.warn("[Push] Push notifications not supported");
    return "denied";
  }
  
  const permission = await Notification.requestPermission();
  return permission;
}

// Get VAPID public key from environment
function getVapidPublicKey(): string | null {
  return (import.meta.env.VITE_VAPID_PUBLIC_KEY as string) || null;
}

// Register service worker and subscribe to push
export async function subscribeToPush(): Promise<PushSubscription | null> {
  if (!isPushSupported()) {
    console.warn("[Push] Push notifications not supported in this browser");
    return null;
  }

  const permission = await getNotificationPermission();
  if (permission !== "granted") {
    console.warn("[Push] Notification permission not granted:", permission);
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const vapidKey = getVapidPublicKey();
    
    if (!vapidKey) {
      console.warn("[Push] VITE_VAPID_PUBLIC_KEY not configured");
      return null;
    }

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidKey) as BufferSource,
    });

    console.info("[Push] Successfully subscribed to push notifications");
    return subscription;
  } catch (error) {
    console.error("[Push] Failed to subscribe to push:", error);
    return null;
  }
}

// Save push subscription to Supabase
export async function savePushSubscription(
  subscription: PushSubscription,
  userId: string
): Promise<boolean> {
  if (!isSupabaseEnabled() || !supabase) {
    console.warn("[Push] Supabase not enabled, cannot save subscription");
    return false;
  }

  try {
    const subscriptionJson = subscription.toJSON();
    
    await supabase.from("push_subscriptions").upsert(
      {
        user_id: userId,
        endpoint: subscriptionJson.endpoint,
        p256dh: subscriptionJson.keys?.p256dh || "",
        auth: subscriptionJson.keys?.auth || "",
        user_agent: navigator.userAgent,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id,endpoint",
      }
    );

    console.info("[Push] Push subscription saved to Supabase");
    return true;
  } catch (error) {
    console.error("[Push] Error saving subscription:", error);
    return false;
  }
}

// Unsubscribe from push
export async function unsubscribeFromPush(): Promise<boolean> {
  if (!isPushSupported()) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    
    if (subscription) {
      await subscription.unsubscribe();
      console.info("[Push] Unsubscribed from push notifications");
    }
    
    return true;
  } catch (error) {
    console.error("[Push] Failed to unsubscribe:", error);
    return false;
  }
}

// Delete push subscription from Supabase
export async function deletePushSubscription(userId: string): Promise<boolean> {
  if (!isSupabaseEnabled() || !supabase) {
    return false;
  }

  try {
    await supabase
      .from("push_subscriptions")
      .delete()
      .eq("user_id", userId);

    return true;
  } catch (error) {
    console.error("[Push] Error deleting subscription:", error);
    return false;
  }
}

// Get existing push subscription
export async function getExistingSubscription(): Promise<PushSubscription | null> {
  if (!isPushSupported()) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    return await registration.pushManager.getSubscription();
  } catch (error) {
    console.error("[Push] Failed to get existing subscription:", error);
    return null;
  }
}

// Handle notification click in service worker
export function setupNotificationClickHandler(): void {
  if (typeof window === "undefined") return;
  
  navigator.serviceWorker?.addEventListener("message", (event) => {
    if (event.data?.type === "NOTIFICATION_CLICK") {
      const url = event.data.url || "/";
      window.location.href = url;
    }
  });
}

// Convert VAPID key from base64 to Uint8Array
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  
  return outputArray;
}

// Full subscription flow
export async function enablePushNotifications(userId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  if (!isPushSupported()) {
    return { success: false, error: "المتصفح لا يدعم الإشعارات" };
  }

  const permission = await requestNotificationPermission();
  if (permission !== "granted") {
    return { success: false, error: "لم يتم السماح بالإشعارات" };
  }

  const subscription = await subscribeToPush();
  if (!subscription) {
    return { success: false, error: "فشل في الاشتراك" };
  }

  const saved = await savePushSubscription(subscription, userId);
  if (!saved) {
    return { success: false, error: "فشل في حفظ الاشتراك" };
  }

  return { success: true };
}

// Disable push notifications
export async function disablePushNotifications(userId: string): Promise<boolean> {
  await unsubscribeFromPush();
  await deletePushSubscription(userId);
  return true;
}

