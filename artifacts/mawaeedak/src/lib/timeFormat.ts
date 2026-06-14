export type TimeFormatPreference = "12h" | "24h";

const POSSIBLE_TIME_KEYS = [
  "mawaeedak-time-format",
  "mawaeedak_time_format",
  "timeFormat",
  "time_format",
  "clockFormat",
  "clock_format",
  "mawaeedak:time-format",
  "mawaeedak:settings",
  "mawaeedak-settings",
  "mawaeedak_settings",
  "user-settings",
  "userSettings",
  "settings",
  "preferences",
  "userPreferences",
];

function normalizePreferenceValue(value: unknown): TimeFormatPreference | null {
  if (value === null || value === undefined) return null;

  if (typeof value === "boolean") {
    return value ? "24h" : "12h";
  }

  if (typeof value === "number") {
    if (value === 12) return "12h";
    if (value === 24) return "24h";
    return null;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (!normalized) return null;

    if (
      normalized === "12" ||
      normalized === "12h" ||
      normalized === "12-hour" ||
      normalized === "12_hour" ||
      normalized === "ampm" ||
      normalized === "am/pm" ||
      normalized.includes("12")
    ) {
      return "12h";
    }

    if (
      normalized === "24" ||
      normalized === "24h" ||
      normalized === "24-hour" ||
      normalized === "24_hour" ||
      normalized.includes("24")
    ) {
      return "24h";
    }
  }

  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const candidateKeys = [
      "timeFormat",
      "time_format",
      "clockFormat",
      "clock_format",
      "hourFormat",
      "hour_format",
      "format",
    ];

    for (const key of candidateKeys) {
      const parsed = normalizePreferenceValue(obj[key]);
      if (parsed) return parsed;
    }

    if (typeof obj.use24Hour === "boolean") return obj.use24Hour ? "24h" : "12h";
    if (typeof obj.is24Hour === "boolean") return obj.is24Hour ? "24h" : "12h";
    if (typeof obj.twentyFourHour === "boolean") return obj.twentyFourHour ? "24h" : "12h";
  }

  return null;
}

export function getPreferredTimeFormat(defaultFormat: TimeFormatPreference = "12h"): TimeFormatPreference {
  if (typeof window === "undefined") return defaultFormat;

  for (const key of POSSIBLE_TIME_KEYS) {
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) continue;

      const direct = normalizePreferenceValue(raw);
      if (direct) return direct;

      try {
        const parsed = JSON.parse(raw);
        const fromJson = normalizePreferenceValue(parsed);
        if (fromJson) return fromJson;
      } catch {
        // Ignore invalid JSON; raw string was already inspected.
      }
    } catch {
      // Ignore inaccessible localStorage keys.
    }
  }

  return defaultFormat;
}

export function toTimeParts(value?: string | null): { hours: number; minutes: number } | null {
  if (!value) return null;
  const raw = String(value).trim();
  if (!raw) return null;

  const clean = raw
    .replace(/[\u200e\u200f]/g, "")
    .replace(/صباحًا|صباحا|صباح|AM/gi, "AM")
    .replace(/مساءً|مساءا|مساء|PM/gi, "PM")
    .trim();

  const match = clean.match(/^(\d{1,2})[:.](\d{2})(?::\d{2})?\s*(AM|PM)?$/i);
  if (!match) return null;

  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const meridiem = match[3]?.toUpperCase();

  if (!Number.isFinite(hours) || !Number.isFinite(minutes) || minutes < 0 || minutes > 59) {
    return null;
  }

  if (meridiem === "AM") {
    if (hours === 12) hours = 0;
  } else if (meridiem === "PM") {
    if (hours < 12) hours += 12;
  }

  if (hours < 0 || hours > 23) return null;
  return { hours, minutes };
}

export function toTwentyFourHour(value?: string | null): string {
  const parts = toTimeParts(value);
  if (!parts) return value ?? "";
  return `${String(parts.hours).padStart(2, "0")}:${String(parts.minutes).padStart(2, "0")}`;
}

export function formatClockTime(
  value?: string | null,
  preference: TimeFormatPreference = getPreferredTimeFormat(),
): string {
  const parts = toTimeParts(value);
  if (!parts) return value ?? "--:--";

  if (preference === "24h") {
    return `${String(parts.hours).padStart(2, "0")}:${String(parts.minutes).padStart(2, "0")}`;
  }

  const period = parts.hours >= 12 ? "م" : "ص";
  const displayHour = parts.hours % 12 || 12;
  return `${displayHour}:${String(parts.minutes).padStart(2, "0")} ${period}`;
}

export function createDateForToday(time?: string | null, baseDate = new Date()): Date | null {
  const parts = toTimeParts(time);
  if (!parts) return null;
  return new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), parts.hours, parts.minutes, 0);
}

export function formatCountdown(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

