import { useCallback, useEffect, useState } from "react";
import {
  formatClockTime,
  getPreferredTimeFormat,
  type TimeFormatPreference,
} from "@/lib/timeFormat";

export function useTimeFormat() {
  const [format, setFormatState] = useState<TimeFormatPreference>(() => getPreferredTimeFormat("12h"));

  useEffect(() => {
    const refresh = () => setFormatState(getPreferredTimeFormat("12h"));
    window.addEventListener("storage", refresh);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);

    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, []);

  const setFormat = useCallback((nextFormat: TimeFormatPreference) => {
    setFormatState(nextFormat);
    try {
      window.localStorage.setItem("mawaeedak-time-format", nextFormat);
      window.localStorage.setItem("timeFormat", nextFormat);
    } catch {
      // Ignore storage failures.
    }
  }, []);

  const formatTime = useCallback((value?: string | null) => formatClockTime(value, format), [format]);

  return {
    format,
    timeFormat: format,
    is24Hour: format === "24h",
    is12Hour: format === "12h",
    setFormat,
    setTimeFormat: setFormat,
    formatTime,
  };
}
