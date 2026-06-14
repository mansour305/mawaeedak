let purged = false;

export function registerPwaServiceWorker(): void {
  if (purged || typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return;
  }

  purged = true;

  window.addEventListener("load", () => {
    navigator.serviceWorker
      .getRegistrations()
      .then(async (registrations) => {
        await Promise.all(registrations.map((registration) => registration.unregister()));
        if ("caches" in window) {
          const keys = await caches.keys();
          await Promise.all(keys.map((key) => caches.delete(key)));
        }
      })
      .catch(() => {
        // Cache cleanup is best effort.
      });
  });
}

