/*
  pushNotifications.js

  This module demonstrates how to register the service worker for push
  notifications and subscribe to a push service.  To make this fully
  functional you must supply your own VAPID public key and implement a
  backend endpoint that accepts push subscriptions and sends notifications.

  Usage example in your React application:

  import { registerForPush } from '@/final_tasks/pushNotifications';
  useEffect(() => {
    registerForPush().catch(console.error);
  }, []);
*/

const VAPID_PUBLIC_KEY = 'REPLACE_WITH_YOUR_VAPID_PUBLIC_KEY';

export async function registerForPush() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('Push notifications are not supported in this browser.');
    return;
  }

  // Ensure the service worker is registered
  const registration = await navigator.serviceWorker.ready;

  // Request notification permission
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    console.warn('Notification permission denied');
    return;
  }

  // Subscribe to push service
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
  });

  console.log('Push subscription:', subscription);
  // TODO: send subscription to your backend via fetch()
  await fetch('/api/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(subscription),
  });
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}