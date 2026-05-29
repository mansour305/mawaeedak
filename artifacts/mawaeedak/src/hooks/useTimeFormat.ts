/**
 * useTimeFormat — hook لإدارة صيغة عرض الوقت (12h / 24h)
 * localStorage key: mawaeedak_time_format_v1
 * الافتراضي: "12h"
 */
import { useState, useEffect } from "react";

const KEY = "mawaeedak_time_format_v1";

function readFormat(): "12h" | "24h" {
  try {
    const v = localStorage.getItem(KEY);
    return v === "24h" ? "24h" : "12h";
  } catch {
    return "12h";
  }
}

export function useTimeFormat() {
  const [format, setFormatState] = useState<"12h" | "24h">(readFormat);

  useEffect(() => {
    const handler = () => setFormatState(readFormat());
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const setFormat = (fmt: "12h" | "24h") => {
    setFormatState(fmt);
    try {
      localStorage.setItem(KEY, fmt);
      window.dispatchEvent(new StorageEvent("storage", { key: KEY, newValue: fmt }));
    } catch { /* silent */ }
  };

  return { format, setFormat };
}
