/**
 * usePrayerEngine — Phase 14
 *
 * Prayer times engine that:
 * 1. Uses official_prayer_times from Supabase first
 * 2. Falls back to AlAdhan API with method=4 for Saudi Arabia
 * 3. Caches results with 6-hour expiry
 * 4. Supports location detection and manual city selection
 * 5. Live countdown ticks every second
 */

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useOfficialPrayerTimes } from "./useOfficialData";
import { useLocationPrefs } from "./useLocationPrefs";
import {
  fetchAlAdhanPrayerTimes,
  getCachedPrayerTimes,
  cachePrayerTimes,
  clearPrayerCache,
  type AlAdhanTimings,
  type PrayerCacheEntry,
} from "@/lib/aladhanService";
import { getRiyadhNow, getRiyadhTodayKey, parseTimeToDateToday } from "@/lib/riyadhTime";
import { getCityName, normalizeCityKey } from "@/lib/prayerTimesService";

export type PrayerTimes = {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
};

export type PrayerStatus = "loading" | "error" | "empty" | "ready";

export type NextPrayer = {
  key: keyof PrayerTimes;
  label: string;
  time: Date;
  countdown: number;
};

export type UsePrayerEngineResult = {
  status: PrayerStatus;
  error: string | null;
  timings: PrayerTimes | null;
  cityName: string;
  cityKey: string;
  nextPrayer: NextPrayer | null;
  countdown: string;
  refresh: () => void;
  requestLocation: () => Promise<void>;
  setManualCity: (city: string) => void;
};

const PRAYER_LABELS: Record<keyof PrayerTimes, string> = {
  fajr: "الفجر",
  sunrise: "الشروق",
  dhuhr: "الظهر",
  asr: "العصر",
  maghrib: "المغرب",
  isha: "العشاء",
};

const LOCATION_PROMPT_KEY = "mawaeedak_location_prompted_v1";

function formatCountdown(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

function computeNextPrayer(timings: PrayerTimes): NextPrayer | null {
  const now = getRiyadhNow();
  const prayerOrder: (keyof PrayerTimes)[] = ["fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha"];

  for (const key of prayerOrder) {
    const prayerTime = parseTimeToDateToday(timings[key]);
    if (prayerTime && prayerTime > now) {
      return {
        key,
        label: PRAYER_LABELS[key],
        time: prayerTime,
        countdown: prayerTime.getTime() - now.getTime(),
      };
    }
  }

  const fajrTime = parseTimeToDateToday(timings.fajr);
  if (fajrTime) {
    const nextFajrTime = new Date(fajrTime);
    nextFajrTime.setUTCDate(nextFajrTime.getUTCDate() + 1);
    return {
      key: "fajr",
      label: PRAYER_LABELS.fajr,
      time: nextFajrTime,
      countdown: nextFajrTime.getTime() - now.getTime(),
    };
  }

  return null;
}

function shouldPromptForLocation(source: string, permissionStatus: string, coords: unknown): boolean {
  if (source !== "default") return false;
  if (permissionStatus === "denied" || permissionStatus === "granted") return false;
  if (coords) return false;

  try {
    if (sessionStorage.getItem(LOCATION_PROMPT_KEY) === "1") return false;
    sessionStorage.setItem(LOCATION_PROMPT_KEY, "1");
  } catch {
    // Session storage is best effort.
  }

  return true;
}

export function usePrayerEngine(): UsePrayerEngineResult {
  const { prefs, requestGPS, setManual } = useLocationPrefs();
  const cityKey = normalizeCityKey(prefs.city) ?? "riyadh";
  const cityName = cityKey ? getCityName(cityKey) : "الرياض";
  const todayIso = getRiyadhTodayKey();
  const coords = useMemo(() => {
    if (typeof prefs.lat === "number" && typeof prefs.lng === "number") {
      return { lat: prefs.lat, lng: prefs.lng };
    }
    return null;
  }, [prefs.lat, prefs.lng]);

  const [aladhanTimings, setAladhanTimings] = useState<AlAdhanTimings | null>(null);
  const [aladhanLoading, setAladhanLoading] = useState(false);
  const [aladhanError, setAladhanError] = useState<string | null>(null);
  const [liveCountdown, setLiveCountdown] = useState("--:--:--");
  const liveNextPrayerRef = useRef<NextPrayer | null>(null);

  const {
    data: officialPrayer,
    isLoading: isOfficialLoading,
    isError: isOfficialError,
    refetch: refetchOfficial,
  } = useOfficialPrayerTimes(cityKey, todayIso);

  const fetchAlAdhan = useCallback(async () => {
    const cached = getCachedPrayerTimes(cityKey, todayIso, coords);
    if (cached) {
      setAladhanTimings(cached.timings);
      return;
    }

    setAladhanLoading(true);
    setAladhanError(null);

    try {
      const timings = await fetchAlAdhanPrayerTimes(cityKey, todayIso, coords);
      if (timings) {
        setAladhanTimings(timings);

        const cacheEntry: PrayerCacheEntry = {
          date: todayIso,
          cityKey,
          lat: coords?.lat ?? null,
          lng: coords?.lng ?? null,
          timings,
          fetchedAt: new Date().toISOString(),
          sourceType: "aladhan",
          isConfirmed: false,
        };
        cachePrayerTimes(cacheEntry);
      } else {
        setAladhanError("تعذر جلب مواقيت الصلاة من المصدر الاحتياطي");
      }
    } catch {
      setAladhanError("حدث خطأ أثناء تحميل المواقيت");
    } finally {
      setAladhanLoading(false);
    }
  }, [cityKey, todayIso, coords]);

  useEffect(() => {
    if (shouldPromptForLocation(prefs.source, prefs.permissionStatus, coords)) {
      requestGPS()
        .then(() => {
          clearPrayerCache();
          setAladhanTimings(null);
          refetchOfficial();
        })
        .catch(() => undefined);
    }
  }, [prefs.source, prefs.permissionStatus, coords, requestGPS, refetchOfficial]);

  const timings = useMemo<PrayerTimes | null>(() => {
    if (officialPrayer?.fajr_time) {
      return {
        fajr: officialPrayer.fajr_time,
        sunrise: officialPrayer.sunrise_time,
        dhuhr: officialPrayer.dhuhr_time,
        asr: officialPrayer.asr_time,
        maghrib: officialPrayer.maghrib_time,
        isha: officialPrayer.isha_time,
      };
    }

    return aladhanTimings;
  }, [officialPrayer, aladhanTimings]);

  const nextPrayer = useMemo<NextPrayer | null>(() => {
    if (!timings) return null;
    const next = computeNextPrayer(timings);
    liveNextPrayerRef.current = next;
    return next;
  }, [timings]);

  const status = useMemo<PrayerStatus>(() => {
    if (isOfficialLoading || aladhanLoading) return "loading";
    if (isOfficialError && !aladhanTimings) return "error";
    if (!timings) return "empty";
    return "ready";
  }, [isOfficialLoading, aladhanLoading, isOfficialError, aladhanTimings, timings]);

  const error = useMemo<string | null>(() => {
    if (status === "error") return "تعذر تحميل مواقيت الصلاة حالياً.";
    if (status === "empty") return aladhanError || "مواقيت الصلاة غير متاحة حالياً. فعّل الموقع أو اختر المدينة.";
    return null;
  }, [status, aladhanError]);

  useEffect(() => {
    if (!officialPrayer && !aladhanLoading && !aladhanTimings && !isOfficialLoading) {
      fetchAlAdhan();
    }
  }, [officialPrayer, aladhanLoading, aladhanTimings, isOfficialLoading, fetchAlAdhan]);

  useEffect(() => {
    if (!nextPrayer) {
      setLiveCountdown("--:--:--");
      return;
    }

    const updateCountdown = () => {
      const now = getRiyadhNow();
      const current = liveNextPrayerRef.current;
      if (current?.time) {
        const remaining = current.time.getTime() - now.getTime();
        if (remaining > 0) {
          setLiveCountdown(formatCountdown(remaining));
          return;
        }

        if (timings) {
          const newNext = computeNextPrayer(timings);
          liveNextPrayerRef.current = newNext;
          if (newNext?.time) {
            const newRemaining = newNext.time.getTime() - now.getTime();
            setLiveCountdown(newRemaining > 0 ? formatCountdown(newRemaining) : "--:--:--");
            return;
          }
        }
      }
      setLiveCountdown("--:--:--");
    };

    updateCountdown();
    const intervalId = setInterval(updateCountdown, 1000);
    return () => clearInterval(intervalId);
  }, [nextPrayer, timings]);

  const refresh = useCallback(() => {
    clearPrayerCache();
    setAladhanTimings(null);
    refetchOfficial();
    fetchAlAdhan();
  }, [refetchOfficial, fetchAlAdhan]);

  const requestLocation = useCallback(async () => {
    await requestGPS();
    clearPrayerCache();
    setAladhanTimings(null);
    refetchOfficial();
  }, [requestGPS, refetchOfficial]);

  const setManualCity = useCallback((city: string) => {
    setManual(city, "Asia/Riyadh");
    clearPrayerCache();
    setAladhanTimings(null);
  }, [setManual]);

  return {
    status,
    error,
    timings,
    cityName,
    cityKey,
    nextPrayer,
    countdown: liveCountdown,
    refresh,
    requestLocation,
    setManualCity,
  };
}

export const PRAYER_STATUS_MESSAGES: Record<PrayerStatus, string> = {
  loading: "جاري تحميل مواقيت الصلاة...",
  error: "تعذر تحميل مواقيت الصلاة حالياً.",
  empty: "مواقيت الصلاة غير متاحة حالياً. فعّل الموقع أو اختر المدينة.",
  ready: "",
};

