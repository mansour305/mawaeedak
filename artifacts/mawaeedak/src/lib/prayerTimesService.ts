/**
 * Prayer Times Service — مواعيدك
 * 
 * خدمة مواقيت الصلاة
 * يستخدم Asia/Riyadh للتوقيت
 * القراءة حسب city_key
 */

import { supabase, isSupabaseEnabled } from "./supabase";
import { getRiyadhNow, getRiyadhTodayKey, parseTimeToDateToday, formatTimeByPreference } from "./riyadhTime";

export type PrayerTimes = {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
};

export type PrayerTimeRecord = {
  id: string;
  city_key: string;
  city_name_ar: string;
  date_gregorian: string;
  date_hijri: string;
  timezone: string;
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  source_name: string | null;
  source_url: string | null;
  is_official: boolean;
  is_confirmed: boolean;
  approval_status: string;
  last_verified_at: string | null;
};

export type NextPrayer = {
  key: keyof PrayerTimes;
  label: string;
  time: Date;
  countdown: number;
};

const PRAYER_LABELS: Record<keyof PrayerTimes, string> = {
  fajr: "الفجر",
  sunrise: "الشروق",
  dhuhr: "الظهر",
  asr: "العصر",
  maghrib: "المغرب",
  isha: "العشاء",
};

// Saudi cities with their keys
export const SAUDI_CITIES: Record<string, string> = {
  riyadh: "الرياض",
  jeddah: "جدة",
  makkah: "مكة المكرمة",
  madinah: "المدينة المنورة",
  dammam: "الدمام",
  khobar: "الخبر",
  dhahran: "الظهران",
  taif: "الطائف",
  qatif: "القطيف",
  jubail: "الجبيل",
  alkobar: "الخبر",
  alahsa: "الأحساء",
  najran: "نجران",
  jazan: "جازان",
  abha: "أبها",
  hail: "حائل",
  tabuk: "تبوك",
  bisha: "بيشة",
  rafha: "رفحة",
  hofuf: "الهفوف",
  buraydah: "بريدة",
  unaizah: "عنيزة",
  arar: "عرعر",
  sakaka: "سكاكا",
};

const CITY_KEY_ALIASES: Record<string, string> = {
  alkobar: "khobar",
  alkhobar: "khobar",
  al_hasa: "alhasa",
  alahsa: "alhasa",
  ahsa: "alhasa",
  "الأحساء": "alhasa",
  "الاحساء": "alhasa",
  "الخبر": "khobar",
  "الرياض": "riyadh",
  "جدة": "jeddah",
  "مكة المكرمة": "makkah",
  "مكة": "makkah",
  "المدينة المنورة": "madinah",
  "المدينة": "madinah",
  "الدمام": "dammam",
  "الظهران": "dhahran",
  "الطائف": "taif",
  "القطيف": "qatif",
  "الجبيل": "jubail",
  "نجران": "najran",
  "جازان": "jazan",
  "أبها": "abha",
  "ابها": "abha",
  "حائل": "hail",
  "تبوك": "tabuk",
  "بيشة": "bisha",
  "رفحاء": "rafha",
  "الهفوف": "hofuf",
  "بريدة": "buraydah",
  "عنيزة": "unaizah",
  "عرعر": "arar",
  "سكاكا": "sakaka",
};

export function normalizeCityKey(cityKey: string | null | undefined): string | null {
  if (!cityKey) return null;

  const trimmed = cityKey.trim();
  if (!trimmed) return null;

  const canonical = trimmed.toLowerCase().replace(/\s+/g, "_");
  const alias = CITY_KEY_ALIASES[trimmed] || CITY_KEY_ALIASES[canonical] || canonical;
  return SAUDI_CITIES[alias] ? alias : null;
}

/**
 * getPrayerTimesForCity — جلب مواقيت الصلاة للمدينة
 */
export async function getPrayerTimesForCity(cityKey: string): Promise<PrayerTimeRecord | null> {
  if (!isSupabaseEnabled || !supabase) return null;
  
  const normalizedCityKey = normalizeCityKey(cityKey);
  if (!normalizedCityKey) return null;

  const today = getRiyadhTodayKey();
  
  const { data, error } = await supabase
    .from("official_prayer_times")
    .select("*")
    .eq("city_key", normalizedCityKey)
    .eq("date_gregorian", today)
    .eq("is_confirmed", true)
    .single();
  
  if (error) return null;
  return data as PrayerTimeRecord;
}

/**
 * getNextPrayer — حساب الصلاة القادمة
 */
export function getNextPrayer(prayers: PrayerTimes): NextPrayer | null {
  const now = getRiyadhNow();
  const prayerOrder: (keyof PrayerTimes)[] = ["fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha"];
  
  for (const key of prayerOrder) {
    const prayerTime = parseTimeToDateToday(prayers[key]);
    if (prayerTime && prayerTime > now) {
      return {
        key,
        label: PRAYER_LABELS[key],
        time: prayerTime,
        countdown: prayerTime.getTime() - now.getTime(),
      };
    }
  }
  
  // All prayers passed, return fajr of next day
  const fajrTime = parseTimeToDateToday(prayers.fajr);
  if (fajrTime) {
    fajrTime.setDate(fajrTime.getDate() + 1);
    return {
      key: "fajr",
      label: PRAYER_LABELS.fajr,
      time: fajrTime,
      countdown: fajrTime.getTime() - now.getTime(),
    };
  }
  
  return null;
}

/**
 * getPrayerCountdown — حساب العد التنازلي للصلاة القادمة
 */
export function getPrayerCountdown(prayers: PrayerTimes): number | null {
  const next = getNextPrayer(prayers);
  return next ? next.countdown : null;
}

/**
 * formatCountdown — تنسيق العد التنازلي
 */
export function formatCountdown(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

/**
 * formatPrayerTime — تنسيق وقت الصلاة
 */
export function formatPrayerTime(time: string, preference: "12h" | "24h" = "24h"): string {
  return formatTimeByPreference(time, preference);
}

/**
 * getPrayerStatus — حالة الصلاة الحالية
 */
export function getPrayerStatus(prayers: PrayerTimes): {
  current: string | null;
  next: NextPrayer | null;
  isBetweenPrayers: boolean;
} {
  const now = getRiyadhNow();
  const prayerOrder: (keyof PrayerTimes)[] = ["fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha"];
  
  let currentPrayer: string | null = null;
  let nextPrayer: NextPrayer | null = null;
  let isBetweenPrayers = false;
  
  for (let i = 0; i < prayerOrder.length; i++) {
    const key = prayerOrder[i];
    const prayerTime = parseTimeToDateToday(prayers[key]);
    
    if (prayerTime && prayerTime <= now) {
      currentPrayer = PRAYER_LABELS[key];
      
      // Check if next prayer is after now
      for (let j = i + 1; j < prayerOrder.length; j++) {
        const nextKey = prayerOrder[j];
        const nextTime = parseTimeToDateToday(prayers[nextKey]);
        if (nextTime && nextTime > now) {
          nextPrayer = {
            key: nextKey,
            label: PRAYER_LABELS[nextKey],
            time: nextTime,
            countdown: nextTime.getTime() - now.getTime(),
          };
          break;
        }
      }
      
      // Check if we're between prayers (within 30 minutes after prayer time)
      if (i < prayerOrder.length - 1) {
        const nextKey = prayerOrder[i + 1];
        const nextTime = parseTimeToDateToday(prayers[nextKey]);
        if (nextTime && nextTime > now) {
          isBetweenPrayers = true;
        }
      }
    }
  }
  
  return { current: currentPrayer, next: nextPrayer, isBetweenPrayers };
}

/**
 * getAllCities — جلب كل المدن المدعومة
 */
export function getAllCities(): { key: string; name: string }[] {
  return Object.entries(SAUDI_CITIES).map(([key, name]) => ({ key, name }));
}

/**
 * getCityName — الحصول على اسم المدينة من key
 */
export function getCityName(cityKey: string): string {
  const normalizedCityKey = normalizeCityKey(cityKey);
  return normalizedCityKey ? SAUDI_CITIES[normalizedCityKey] : cityKey;
}

/**
 * createPrayerTimeRecord — إنشاء سجل مواقيت (للأدمن)
 */
export async function createPrayerTimeRecord(
  record: Omit<PrayerTimeRecord, "id" | "created_at" | "updated_at">
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseEnabled || !supabase) {
    return { success: false, error: "Supabase غير مهيأ" };
  }
  
  const { error } = await supabase
    .from("official_prayer_times")
    .insert({
      ...record,
      is_confirmed: false,
      approval_status: "pending",
    });
  
  if (error) return { success: false, error: error.message };
  return { success: true };
}

/**
 * updatePrayerTimeRecord — تحديث سجل مواقيت (للأدمن)
 */
export async function updatePrayerTimeRecord(
  id: string,
  updates: Partial<PrayerTimeRecord>
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseEnabled || !supabase) {
    return { success: false, error: "Supabase غير مهيأ" };
  }
  
  const { error } = await supabase
    .from("official_prayer_times")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id);
  
  if (error) return { success: false, error: error.message };
  return { success: true };
}

/**
 * confirmPrayerTime — اعتماد مواقيت الصلاة (للأدمن)
 */
export async function confirmPrayerTime(id: string): Promise<{ success: boolean; error?: string }> {
  return updatePrayerTimeRecord(id, {
    is_confirmed: true,
    approval_status: "approved",
    last_verified_at: new Date().toISOString(),
  });
}

