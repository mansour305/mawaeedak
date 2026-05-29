import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateInitials(name: string): string {
  if (!name) return "م";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0);
  return parts[0].charAt(0) + parts[parts.length - 1].charAt(0);
}

// كل عروض التاريخ تتبع حدود يوم الرياض (Asia/Riyadh) بصرف النظر عن منطقة الجهاز.
const KSA_TZ = "Asia/Riyadh";

export function formatHijriDate(date: Date = new Date()): string {
  try {
    return new Intl.DateTimeFormat("ar-SA-u-ca-islamic-umalqura", {
      timeZone: KSA_TZ,
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  } catch {
    return "تاريخ هجري غير متاح";
  }
}

export function formatGregorianDate(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("ar-SA-u-ca-gregory", {
    timeZone: KSA_TZ,
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function getDayName(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("ar-SA", { timeZone: KSA_TZ, weekday: "long" }).format(date);
}

// لحظة منتصف ليل يوم معيّن (YYYY-MM-DD) بتوقيت الرياض (UTC+3، بلا توقيت صيفي).
// تُستخدم كهدف ثابت للعدّاد الحي بحيث يصحّ لأي مستخدم مهما كانت منطقته.
export function ksaMidnight(dateStr: string): Date {
  return new Date(String(dateStr).slice(0, 10) + "T00:00:00+03:00");
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function daysUntil(dateStr: string): number {
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function formatCurrency(amount: number | string | null | undefined): string {
  if (amount == null) return "";
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("ar-SA", {
    style: "currency",
    currency: "SAR",
    minimumFractionDigits: 0,
  }).format(num);
}

/**
 * formatAppTime — مركزية تنسيق الوقت (12h / 24h)
 *
 * @param value - وقت بصيغة "HH:mm" (مثل "03:45")، أو null/undefined
 * @param format - "12h" | "24h" (الافتراضي "12h")
 *
 * مثال 12h: "03:45 ص" / "07:08 م"
 * مثال 24h: "03:45"  / "19:08"
 */
export function formatAppTime(
  value: string | null | undefined,
  format: "12h" | "24h" = "12h"
): string {
  if (!value) return "—";
  try {
    const [hStr, mStr] = value.split(":");
    const h = parseInt(hStr, 10);
    const m = parseInt(mStr, 10);
    if (isNaN(h) || isNaN(m)) return value;
    const mm = String(m).padStart(2, "0");
    if (format === "24h") {
      return `${String(h).padStart(2, "0")}:${mm}`;
    }
    const period = h < 12 ? "ص" : "م";
    const h12 = h % 12 || 12;
    return `${String(h12).padStart(2, "0")}:${mm} ${period}`;
  } catch {
    return value;
  }
}
