import { getRiyadhTodayKey } from "./riyadhTime";
import { normalizeCityKey } from "./prayerTimesService";

export type AlAdhanTimings = {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
};

export type Coordinates = {
  lat: number;
  lng: number;
};

export type AlAdhanResponse = {
  code: number;
  status: string;
  data?: {
    timings?: Record<string, string>;
    meta?: {
      timezone?: string;
      method?: {
        id?: number;
        name?: string;
      };
    };
  };
};

const SAUDI_CITY_COORDS: Record<string, Coordinates> = {
  riyadh: { lat: 24.7136, lng: 46.6753 },
  jeddah: { lat: 21.2854, lng: 39.2376 },
  makkah: { lat: 21.3891, lng: 39.8579 },
  madinah: { lat: 24.5247, lng: 39.5692 },
  dammam: { lat: 26.4207, lng: 50.0888 },
  khobar: { lat: 26.2172, lng: 50.1971 },
  dhahran: { lat: 26.2861, lng: 50.1579 },
  taif: { lat: 21.2854, lng: 40.4149 },
  qatif: { lat: 26.5674, lng: 50.0068 },
  jubail: { lat: 27.0117, lng: 49.6584 },
  alhasa: { lat: 25.3798, lng: 49.5896 },
  najran: { lat: 17.4927, lng: 44.1322 },
  jazan: { lat: 16.8892, lng: 42.5511 },
  abha: { lat: 18.2164, lng: 42.5053 },
  hail: { lat: 27.5114, lng: 41.7208 },
  tabuk: { lat: 28.3998, lng: 36.5717 },
  bisha: { lat: 19.9891, lng: 42.5978 },
  rafha: { lat: 29.6199, lng: 43.7329 },
  hofuf: { lat: 25.3798, lng: 49.5896 },
  buraydah: { lat: 26.326, lng: 43.975 },
  unaizah: { lat: 26.0833, lng: 43.9667 },
  arar: { lat: 30.9753, lng: 41.0381 },
  sakaka: { lat: 29.9697, lng: 40.2093 },
};

const PRAYER_CACHE_KEY = "mawaeedak_prayer_cache_v3";
const ALADHAN_TIMEOUT_MS = 9000;

export type PrayerCacheEntry = {
  date: string;
  cityKey: string;
  lat: number | null;
  lng: number | null;
  timings: AlAdhanTimings;
  fetchedAt: string;
  sourceType: "aladhan" | "official";
  isConfirmed: boolean;
};

export function getCityCoordinates(cityKey: string): Coordinates | null {
  const normalizedKey = normalizeCityKey(cityKey);
  return normalizedKey ? SAUDI_CITY_COORDS[normalizedKey] ?? null : null;
}

function hasUsableCoordinates(coordinates?: Partial<Coordinates> | null): coordinates is Coordinates {
  return (
    typeof coordinates?.lat === "number" &&
    typeof coordinates.lng === "number" &&
    Number.isFinite(coordinates.lat) &&
    Number.isFinite(coordinates.lng)
  );
}

function resolveCoordinates(cityKey: string, coordinates?: Partial<Coordinates> | null): Coordinates | null {
  if (hasUsableCoordinates(coordinates)) {
    return coordinates;
  }

  return getCityCoordinates(cityKey);
}

function coordinateMatches(a: number | null, b: number | null): boolean {
  if (a === null || b === null) return a === b;
  return Math.abs(a - b) < 0.0001;
}

function cleanTimeString(timeStr: string | undefined): string {
  if (!timeStr) return "";

  const cleaned = timeStr.replace(/\s*\([^)]*\)\s*/g, "").trim();
  if (/^\d{1,2}:\d{2}$/.test(cleaned)) {
    const [hours, minutes] = cleaned.split(":");
    return `${hours.padStart(2, "0")}:${minutes}`;
  }

  const match = cleaned.match(/(\d{1,2}):(\d{2})/);
  if (match) {
    return `${match[1].padStart(2, "0")}:${match[2]}`;
  }

  return cleaned;
}

function readTiming(timings: Record<string, string>, ...keys: string[]): string {
  for (const key of keys) {
    const value = timings[key] ?? timings[key.toLowerCase()];
    if (value) return cleanTimeString(value);
  }
  return "";
}

function parseAlAdhanTimings(timings: Record<string, string>): AlAdhanTimings | null {
  const parsed = {
    fajr: readTiming(timings, "Fajr", "fajr"),
    sunrise: readTiming(timings, "Sunrise", "sunrise"),
    dhuhr: readTiming(timings, "Dhuhr", "Dhuhr", "dhuhr"),
    asr: readTiming(timings, "Asr", "asr"),
    maghrib: readTiming(timings, "Maghrib", "maghrib"),
    isha: readTiming(timings, "Isha", "isha"),
  };

  return Object.values(parsed).every(Boolean) ? parsed : null;
}

export async function fetchAlAdhanPrayerTimes(
  cityKey: string,
  date = getRiyadhTodayKey(),
  coordinates?: Partial<Coordinates> | null
): Promise<AlAdhanTimings | null> {
  const coords = resolveCoordinates(cityKey, coordinates);
  if (!coords) return null;

  try {
    const [year, month, day] = date.split("-");
    const formattedDate = `${day}-${month}-${year}`;
    const url = new URL(`https://api.aladhan.com/v1/timings/${formattedDate}`);
    url.searchParams.set("latitude", String(coords.lat));
    url.searchParams.set("longitude", String(coords.lng));
    url.searchParams.set("method", "4");
    url.searchParams.set("timezonestring", "Asia/Riyadh");

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), ALADHAN_TIMEOUT_MS);

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });
    window.clearTimeout(timeout);

    if (!response.ok) return null;

    const data: AlAdhanResponse = await response.json();
    if (data.code !== 200 || !data.data?.timings) return null;

    return parseAlAdhanTimings(data.data.timings);
  } catch {
    return null;
  }
}

export function getCachedPrayerTimes(
  cityKey: string,
  date = getRiyadhTodayKey(),
  coordinates?: Partial<Coordinates> | null
): PrayerCacheEntry | null {
  try {
    const cached = localStorage.getItem(PRAYER_CACHE_KEY);
    if (!cached) return null;

    const entry: PrayerCacheEntry = JSON.parse(cached);
    const normalizedCityKey = normalizeCityKey(cityKey);
    const expectedCoords = resolveCoordinates(cityKey, coordinates);
    const expectedLat = expectedCoords?.lat ?? null;
    const expectedLng = expectedCoords?.lng ?? null;

    if (
      !normalizedCityKey ||
      entry.date !== date ||
      entry.cityKey !== normalizedCityKey ||
      !coordinateMatches(entry.lat, expectedLat) ||
      !coordinateMatches(entry.lng, expectedLng)
    ) {
      return null;
    }

    const fetchedAt = new Date(entry.fetchedAt);
    const hoursDiff = (Date.now() - fetchedAt.getTime()) / (1000 * 60 * 60);
    return hoursDiff <= 6 ? entry : null;
  } catch {
    return null;
  }
}

export function cachePrayerTimes(entry: PrayerCacheEntry): void {
  try {
    localStorage.setItem(PRAYER_CACHE_KEY, JSON.stringify(entry));
  } catch {
    // Cache is best effort.
  }
}

export function clearPrayerCache(): void {
  try {
    localStorage.removeItem(PRAYER_CACHE_KEY);
  } catch {
    // Cache is best effort.
  }
}

