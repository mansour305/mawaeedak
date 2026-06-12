/**
 * AlAdhan Prayer Times Service — مواعيدك
 * 
 * Uses AlAdhan API as fallback when official_prayer_times are not available.
 * For Saudi Arabia: uses method=4 (Umm Al-Qura University, Makkah)
 * 
 * API: https://api.aladhan.com/v1/timings
 */

export type AlAdhanTimings = {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
};

export type AlAdhanResponse = {
  code: number;
  status: string;
  data: {
    timings: AlAdhanTimings;
    date: {
      readable: string;
      gregorian: {
        date: string;
        weekday: { en: string };
        month: { en: string };
        year: string;
      };
      hijri: {
        date: string;
        month: { ar: string; en: string };
        year: string;
        day: string;
        weekday: { ar: string; en: string };
      };
    };
    meta: {
      timezone: string;
    };
  };
};

// Saudi city coordinates for AlAdhan
const SAUDI_CITY_COORDS: Record<string, { lat: number; lng: number }> = {
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
  buraydah: { lat: 26.3260, lng: 43.9750 },
  unaizah: { lat: 26.0833, lng: 43.9667 },
  arar: { lat: 30.9753, lng: 41.0381 },
  sakaka: { lat: 29.9697, lng: 40.2093 },
};

/**
 * Get coordinates for a city key
 */
export function getCityCoordinates(cityKey: string): { lat: number; lng: number } {
  const normalizedKey = cityKey.toLowerCase().replace(/\s+/g, "_");
  return SAUDI_CITY_COORDS[normalizedKey] || SAUDI_CITY_COORDS.riyadh;
}

/**
 * Clean time string like "04:12 (+03)" and extract HH:mm
 */
export function cleanTimeString(timeStr: string): string {
  // Remove timezone offset like "(+03)"
  const cleaned = timeStr.replace(/\s*\([^)]*\)\s*/g, "").trim();
  // Validate format HH:mm
  if (/^\d{1,2}:\d{2}$/.test(cleaned)) {
    return cleaned;
  }
  // Try to extract HH:mm from any format
  const match = cleaned.match(/(\d{1,2}):(\d{2})/);
  if (match) {
    return `${match[1].padStart(2, "0")}:${match[2]}`;
  }
  return cleaned;
}

/**
 * Fetch prayer times from AlAdhan API
 * Uses method=4 (Umm Al-Qura, Makkah) for Saudi Arabia
 */
export async function fetchAlAdhanPrayerTimes(
  cityKey: string,
  date?: string
): Promise<AlAdhanTimings | null> {
  try {
    const coords = getCityCoordinates(cityKey);
    const dateParam = date || new Date().toISOString().split("T")[0];
    
    // Format: DD-MM-YYYY
    const [year, month, day] = dateParam.split("-");
    const formattedDate = `${day}-${month}-${year}`;
    
    // AlAdhan API: method=4 for Umm Al-Qura, Makkah
    const url = `https://api.aladhan.com/v1/timings/${formattedDate}?latitude=${coords.lat}&longitude=${coords.lng}&method=4`;
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
    });
    
    if (!response.ok) {
      console.error("AlAdhan API error:", response.status);
      return null;
    }
    
    const data: AlAdhanResponse = await response.json();
    
    if (data.code !== 200 || !data.data?.timings) {
      console.error("AlAdhan API invalid response:", data.status);
      return null;
    }
    
    // Clean all timing strings
    const timings: AlAdhanTimings = {
      fajr: cleanTimeString(data.data.timings.fajr),
      sunrise: cleanTimeString(data.data.timings.sunrise),
      dhuhr: cleanTimeString(data.data.timings.dhuhr),
      asr: cleanTimeString(data.data.timings.asr),
      maghrib: cleanTimeString(data.data.timings.maghrib),
      isha: cleanTimeString(data.data.timings.isha),
    };
    
    return timings;
  } catch (error) {
    console.error("AlAdhan fetch error:", error);
    return null;
  }
}

/**
 * Cache key for prayer times
 */
const PRAYER_CACHE_KEY = "mawaeedak_prayer_cache_v2";

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

/**
 * Get cached prayer times
 */
export function getCachedPrayerTimes(cityKey: string): PrayerCacheEntry | null {
  try {
    const cached = localStorage.getItem(PRAYER_CACHE_KEY);
    if (!cached) return null;
    
    const entry: PrayerCacheEntry = JSON.parse(cached);
    const today = new Date().toISOString().split("T")[0];
    
    // Check if cache is valid
    if (entry.date !== today || entry.cityKey !== cityKey) {
      return null;
    }
    
    // Check cache expiry (6 hours)
    const fetchedAt = new Date(entry.fetchedAt);
    const now = new Date();
    const hoursDiff = (now.getTime() - fetchedAt.getTime()) / (1000 * 60 * 60);
    
    if (hoursDiff > 6) {
      return null;
    }
    
    return entry;
  } catch {
    return null;
  }
}

/**
 * Cache prayer times
 */
export function cachePrayerTimes(entry: PrayerCacheEntry): void {
  try {
    localStorage.setItem(PRAYER_CACHE_KEY, JSON.stringify(entry));
  } catch {
    // Ignore cache errors
  }
}

/**
 * Clear prayer cache
 */
export function clearPrayerCache(): void {
  try {
    localStorage.removeItem(PRAYER_CACHE_KEY);
  } catch {
    // Ignore
  }
}