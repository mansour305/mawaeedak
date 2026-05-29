/**
 * useLocationPrefs — Phase 13G
 * Manages user location & timezone preferences:
 * - Browser GPS (navigator.geolocation)
 * - Auto timezone detection (Intl.DateTimeFormat)
 * - Manual city / timezone selection
 * - Persist in localStorage only (no service_role, no hardcoded secrets)
 */

import { useState, useCallback } from "react";

export type LocationSource = "gps" | "manual" | "default";
export type PermissionStatus = "granted" | "denied" | "prompt" | "unknown";

export interface LocationPrefs {
  city: string;
  timezone: string;
  lat: number | null;
  lng: number | null;
  source: LocationSource;
  permissionStatus: PermissionStatus;
  lastUpdated: string | null;
}

const LOCATION_KEY = "mawaeedak_location_prefs_v1";

const DEFAULT_PREFS: LocationPrefs = {
  city: "الرياض",
  timezone: "Asia/Riyadh",
  lat: null,
  lng: null,
  source: "default",
  permissionStatus: "unknown",
  lastUpdated: null,
};

/* Saudi city coordinates for nearest-city lookup */
const SAUDI_CITIES_COORDS: Array<{ name: string; lat: number; lng: number }> = [
  { name: "الرياض",         lat: 24.7136, lng: 46.6753 },
  { name: "جدة",            lat: 21.2854, lng: 39.2376 },
  { name: "مكة المكرمة",    lat: 21.3891, lng: 39.8579 },
  { name: "المدينة المنورة",lat: 24.5247, lng: 39.5692 },
  { name: "الدمام",         lat: 26.4207, lng: 50.0888 },
  { name: "الخبر",          lat: 26.2172, lng: 50.1971 },
  { name: "الطائف",         lat: 21.2854, lng: 40.4149 },
  { name: "تبوك",           lat: 28.3998, lng: 36.5717 },
  { name: "بريدة",          lat: 26.3260, lng: 43.9750 },
  { name: "خميس مشيط",     lat: 18.3030, lng: 42.7286 },
  { name: "الأحساء",        lat: 25.3798, lng: 49.5896 },
  { name: "نجران",          lat: 17.4927, lng: 44.1322 },
  { name: "جيزان",          lat: 16.8892, lng: 42.5511 },
  { name: "أبها",           lat: 18.2164, lng: 42.5053 },
  { name: "ينبع",           lat: 24.0894, lng: 38.0618 },
  { name: "حائل",           lat: 27.5114, lng: 41.7208 },
  { name: "عرعر",           lat: 30.9753, lng: 41.0381 },
  { name: "سكاكا",          lat: 29.9697, lng: 40.2093 },
  { name: "الباحة",         lat: 20.0129, lng: 41.4677 },
  { name: "الجبيل",         lat: 27.0046, lng: 49.6587 },
];

function deg2rad(d: number): number {
  return (d * Math.PI) / 180;
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLng = deg2rad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function nearestSaudiCity(lat: number, lng: number): string {
  let best = SAUDI_CITIES_COORDS[0];
  let bestDist = haversineKm(lat, lng, best.lat, best.lng);
  for (const city of SAUDI_CITIES_COORDS) {
    const d = haversineKm(lat, lng, city.lat, city.lng);
    if (d < bestDist) { bestDist = d; best = city; }
  }
  return best.name;
}

export function detectTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Riyadh";
  } catch {
    return "Asia/Riyadh";
  }
}

function loadPrefs(): LocationPrefs {
  try {
    const raw = localStorage.getItem(LOCATION_KEY);
    if (!raw) return DEFAULT_PREFS;
    return { ...DEFAULT_PREFS, ...JSON.parse(raw) } as LocationPrefs;
  } catch {
    return DEFAULT_PREFS;
  }
}

function savePrefs(prefs: LocationPrefs): void {
  localStorage.setItem(LOCATION_KEY, JSON.stringify(prefs));
}

/* ══════════════════════════════════════════════
   HOOK
   ══════════════════════════════════════════════ */
export function useLocationPrefs() {
  const [prefs, setPrefs] = useState<LocationPrefs>(loadPrefs);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  const update = useCallback((updates: Partial<LocationPrefs>) => {
    setPrefs(prev => {
      const next = { ...prev, ...updates };
      savePrefs(next);
      return next;
    });
  }, []);

  /** Request GPS permission and detect nearest city + timezone */
  const requestGPS = useCallback((): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const msg = "المتصفح لا يدعم تحديد الموقع";
        setGpsError(msg);
        update({ permissionStatus: "denied" });
        reject(new Error(msg));
        return;
      }

      setGpsLoading(true);
      setGpsError(null);

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude: lat, longitude: lng } = pos.coords;
          const city = nearestSaudiCity(lat, lng);
          const timezone = detectTimezone();
          const now = new Date().toISOString();
          update({
            lat, lng, city, timezone,
            source: "gps",
            permissionStatus: "granted",
            lastUpdated: now,
          });
          setGpsLoading(false);
          resolve(city);
        },
        (err) => {
          const msg = err.code === 1
            ? "تم رفض إذن الموقع"
            : err.code === 2
            ? "تعذّر تحديد الموقع"
            : "انتهت مهلة تحديد الموقع";
          setGpsError(msg);
          setGpsLoading(false);
          update({ permissionStatus: err.code === 1 ? "denied" : "prompt" });
          reject(new Error(msg));
        },
        { timeout: 10000, enableHighAccuracy: false, maximumAge: 300000 }
      );
    });
  }, [update]);

  /** Set city + timezone manually */
  const setManual = useCallback((city: string, timezone: string) => {
    update({
      city, timezone,
      lat: null, lng: null,
      source: "manual",
      lastUpdated: new Date().toISOString(),
    });
  }, [update]);

  /** Reset to default */
  const resetToDefault = useCallback(() => {
    const tz = detectTimezone();
    update({ ...DEFAULT_PREFS, timezone: tz, lastUpdated: null });
  }, [update]);

  return {
    prefs,
    gpsLoading,
    gpsError,
    requestGPS,
    setManual,
    resetToDefault,
  };
}
