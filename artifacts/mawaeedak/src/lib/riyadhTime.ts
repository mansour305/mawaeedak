export const RIYADH_TIMEZONE = "Asia/Riyadh";

export type RiyadhDateParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};

const riyadhFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: RIYADH_TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
  hourCycle: "h23",
});

function readPart(parts: Intl.DateTimeFormatPart[], type: Intl.DateTimeFormatPartTypes): number {
  const value = parts.find((part) => part.type === type)?.value;
  return value ? Number(value) : 0;
}

export function getRiyadhDateParts(date = new Date()): RiyadhDateParts {
  const parts = riyadhFormatter.formatToParts(date);
  const hour = readPart(parts, "hour");

  return {
    year: readPart(parts, "year"),
    month: readPart(parts, "month"),
    day: readPart(parts, "day"),
    hour: hour === 24 ? 0 : hour,
    minute: readPart(parts, "minute"),
    second: readPart(parts, "second"),
  };
}

export function formatRiyadhDateKey(parts: Pick<RiyadhDateParts, "year" | "month" | "day">): string {
  return [
    String(parts.year).padStart(4, "0"),
    String(parts.month).padStart(2, "0"),
    String(parts.day).padStart(2, "0"),
  ].join("-");
}

export function getRiyadhDateKey(date = new Date()): string {
  return formatRiyadhDateKey(getRiyadhDateParts(date));
}

export function getRiyadhTodayKey(): string {
  return getRiyadhDateKey();
}

export function parseRiyadhDateKey(dateKey: string): Date {
  const match = dateKey.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    return new Date(dateKey);
  }

  const [, year, month, day] = match;
  return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), 0, 0, 0, 0));
}

export function getRiyadhNow(date = new Date()): Date {
  const parts = getRiyadhDateParts(date);
  return new Date(Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second, 0));
}

export function getRiyadhStartOfDay(dateKey = getRiyadhTodayKey()): Date {
  return parseRiyadhDateKey(dateKey);
}

export function getNextMidnightRiyadh(): Date {
  const today = parseRiyadhDateKey(getRiyadhTodayKey());
  return new Date(today.getTime() + 24 * 60 * 60 * 1000);
}

export function shouldRolloverToday(storageKey = "mawaeedak_riyadh_day"): boolean {
  const todayKey = getRiyadhTodayKey();
  try {
    const stored = localStorage.getItem(storageKey);
    if (stored !== todayKey) {
      localStorage.setItem(storageKey, todayKey);
      return true;
    }
  } catch {
    // Storage may be unavailable in restricted browser modes.
  }
  return false;
}

export function getTimeUntilMidnightRiyadh(): number {
  return Math.max(0, getNextMidnightRiyadh().getTime() - getRiyadhNow().getTime());
}

export function formatTimeByPreference(
  time: string | null | undefined,
  preference: "12h" | "24h" = "24h"
): string {
  if (!time) return "--:--";

  const match = time.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (!match) return time;

  let hours = parseInt(match[1], 10);
  const minutes = match[2];

  if (preference === "24h") {
    return `${String(hours).padStart(2, "0")}:${minutes}`;
  }

  const period = hours >= 12 ? "م" : "ص";
  const displayHour = hours % 12 || 12;
  return `${displayHour}:${minutes} ${period}`;
}

export function calculateDaysRemaining(targetDate: string | Date): number {
  const today = getRiyadhStartOfDay();
  const target =
    typeof targetDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(targetDate)
      ? parseRiyadhDateKey(targetDate)
      : new Date(targetDate);
  const diffMs = target.getTime() - today.getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

export function calculateCountdownToDate(targetDate: string | Date): number {
  const now = getRiyadhNow().getTime();
  const target =
    typeof targetDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(targetDate)
      ? parseRiyadhDateKey(targetDate).getTime()
      : new Date(targetDate).getTime();
  return Math.max(0, target - now);
}

export function parseTimeToDateToday(time: string | null | undefined, dateKey = getRiyadhTodayKey()): Date | null {
  if (!time) return null;

  const match = time.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (!match) return null;

  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const date = parseRiyadhDateKey(dateKey);
  date.setUTCHours(hours, minutes, 0, 0);
  return date;
}

export function getNextPrayerTime(prayers: {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
}): { key: string; label: string; time: Date } | null {
  const now = getRiyadhNow();
  const prayerKeys = [
    { key: "fajr", label: "الفجر", timeKey: "fajr" },
    { key: "sunrise", label: "الشروق", timeKey: "sunrise" },
    { key: "dhuhr", label: "الظهر", timeKey: "dhuhr" },
    { key: "asr", label: "العصر", timeKey: "asr" },
    { key: "maghrib", label: "المغرب", timeKey: "maghrib" },
    { key: "isha", label: "العشاء", timeKey: "isha" },
  ];

  for (const prayer of prayerKeys) {
    const prayerTime = parseTimeToDateToday(prayers[prayer.timeKey as keyof typeof prayers]);
    if (prayerTime && prayerTime > now) {
      return { key: prayer.key, label: prayer.label, time: prayerTime };
    }
  }

  const fajrTime = parseTimeToDateToday(prayers.fajr);
  if (fajrTime) {
    fajrTime.setUTCDate(fajrTime.getUTCDate() + 1);
    return { key: "fajr", label: "الفجر", time: fajrTime };
  }

  return null;
}

export function getPrayerCountdown(prayers: {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
}): number | null {
  const nextPrayer = getNextPrayerTime(prayers);
  if (!nextPrayer) return null;

  return Math.max(0, nextPrayer.time.getTime() - getRiyadhNow().getTime());
}

