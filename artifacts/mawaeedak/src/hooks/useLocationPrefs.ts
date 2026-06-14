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
  city: "riyadh",
  timezone: "Asia/Riyadh",
  lat: null,
  lng: null,
  source: "default",
  permissionStatus: "unknown",
  lastUpdated: null,
};

const SAUDI_CITIES_COORDS: Array<{ key: string; lat: number; lng: number }> = [
  { key: "riyadh", lat: 24.7136, lng: 46.6753 },
  { key: "jeddah", lat: 21.2854, lng: 39.2376 },
  { key: "makkah", lat: 21.3891, lng: 39.8579 },
  { key: "madinah", lat: 24.5247, lng: 39.5692 },
  { key: "dammam", lat: 26.4207, lng: 50.0888 },
  { key: "khobar", lat: 26.2172, lng: 50.1971 },
  { key: "dhahran", lat: 26.2861, lng: 50.1579 },
  { key: "taif", lat: 21.2854, lng: 40.4149 },
  { key: "tabuk", lat: 28.3998, lng: 36.5717 },
  { key: "buraydah", lat: 26.326, lng: 43.975 },
  { key: "alhasa", lat: 25.3798, lng: 49.5896 },
  { key: "najran", lat: 17.4927, lng: 44.1322 },
  { key: "jazan", lat: 16.8892, lng: 42.5511 },
  { key: "abha", lat: 18.2164, lng: 42.5053 },
  { key: "hail", lat: 27.5114, lng: 41.7208 },
  { key: "arar", lat: 30.9753, lng: 41.0381 },
  { key: "sakaka", lat: 29.9697, lng: 40.2093 },
  { key: "jubail", lat: 27.0046, lng: 49.6587 },
  { key: "qatif", lat: 26.5674, lng: 50.0068 },
  { key: "bisha", lat: 19.9891, lng: 42.5978 },
  { key: "rafha", lat: 29.6199, lng: 43.7329 },
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
  return best.key;
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
          const timezone = "Asia/Riyadh";
          const now = new Date().toISOString();
          update({
            lat,
            lng,
            city,
            timezone,
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
        { timeout: 15000, enableHighAccuracy: true, maximumAge: 0 }
      );
    });
  }, [update]);

  const setManual = useCallback((city: string, timezone: string) => {
    update({
      city,
      timezone,
      lat: null,
      lng: null,
      source: "manual",
      lastUpdated: new Date().toISOString(),
    });
  }, [update]);

  const resetToDefault = useCallback(() => {
    update({ ...DEFAULT_PREFS, timezone: "Asia/Riyadh", lastUpdated: null });
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

