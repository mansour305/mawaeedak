import { Router } from "express";
import { db } from "@workspace/db";
import { prayerTimesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const router = Router();

const CITIES = [
  { value: "riyadh",        label: "الرياض" },
  { value: "jeddah",        label: "جدة" },
  { value: "mecca",         label: "مكة المكرمة" },
  { value: "medina",        label: "المدينة المنورة" },
  { value: "dammam",        label: "الدمام" },
  { value: "khobar",        label: "الخبر" },
  { value: "abha",          label: "أبها" },
  { value: "khamis",        label: "خميس مشيط" },
  { value: "taif",          label: "الطائف" },
  { value: "tabuk",         label: "تبوك" },
  { value: "qassim",        label: "القصيم" },
  { value: "hail",          label: "حائل" },
  { value: "jouf",          label: "الجوف" },
  { value: "jazan",         label: "جيزان" },
  { value: "najran",        label: "نجران" },
  { value: "baha",          label: "الباحة" },
  { value: "sakaka",        label: "سكاكا" },
  { value: "arar",          label: "عرعر" },
  { value: "yanbu",         label: "ينبع" },
  { value: "jubail",        label: "الجبيل" },
  { value: "ahsa",          label: "الأحساء" },
];

const ARABIC_TO_KEY: Record<string, string> = {
  "الرياض": "riyadh",
  "جدة": "jeddah",
  "مكة المكرمة": "mecca",
  "مكة": "mecca",
  "المدينة المنورة": "medina",
  "المدينة": "medina",
  "الدمام": "dammam",
  "الخبر": "khobar",
  "أبها": "abha",
  "خميس مشيط": "khamis",
  "الطائف": "taif",
  "تبوك": "tabuk",
  "بريدة": "qassim",
  "القصيم": "qassim",
  "حائل": "hail",
  "الجوف": "jouf",
  "سكاكا": "sakaka",
  "جيزان": "jazan",
  "جازان": "jazan",
  "نجران": "najran",
  "الباحة": "baha",
  "عرعر": "arar",
  "ينبع": "yanbu",
  "الجبيل": "jubail",
  "الأحساء": "ahsa",
};

function resolveCity(raw: string): string {
  const trimmed = raw.trim();
  return ARABIC_TO_KEY[trimmed] ?? trimmed.toLowerCase();
}

function riyadhDateParts(): { dateKey: string; hour: number; minute: number } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Riyadh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    hourCycle: "h23",
  }).formatToParts(new Date());
  const read = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((part) => part.type === type)?.value ?? 0);
  const dateKey = `${String(read("year")).padStart(4, "0")}-${String(read("month")).padStart(2, "0")}-${String(read("day")).padStart(2, "0")}`;
  const hour = read("hour");
  return { dateKey, hour: hour === 24 ? 0 : hour, minute: read("minute") };
}

function getNextPrayer(times: { fajr: string; sunrise: string; dhuhr: string; asr: string; maghrib: string; isha: string }): { next_prayer: string; time_remaining: string } {
  const now = riyadhDateParts();
  const currentTime = now.hour * 60 + now.minute;
  const prayers = [
    { name: "الفجر", time: times.fajr },
    { name: "الشروق", time: times.sunrise },
    { name: "الظهر", time: times.dhuhr },
    { name: "العصر", time: times.asr },
    { name: "المغرب", time: times.maghrib },
    { name: "العشاء", time: times.isha },
  ];

  for (const prayer of prayers) {
    const [h, m] = prayer.time.split(":").map(Number);
    const prayerMinutes = h * 60 + m;
    if (prayerMinutes > currentTime) {
      const diff = prayerMinutes - currentTime;
      const hours = Math.floor(diff / 60);
      const minutes = diff % 60;
      const timeStr = hours > 0 ? `${hours} ساعة ${minutes} دقيقة` : `${minutes} دقيقة`;
      return { next_prayer: prayer.name, time_remaining: timeStr };
    }
  }

  const [h, m] = times.fajr.split(":").map(Number);
  const fajrMinutes = h * 60 + m;
  const diff = 24 * 60 - currentTime + fajrMinutes;
  const hours = Math.floor(diff / 60);
  const minutes = diff % 60;
  return { next_prayer: "الفجر", time_remaining: `${hours} ساعة ${minutes} دقيقة` };
}

router.get("/prayer-times/cities", (_req, res) => {
  return res.json(CITIES);
});

router.get("/prayer-times", async (req, res) => {
  const rawCity = (req.query.city as string) ?? "riyadh";
  const city = resolveCity(rawCity);
  const today = riyadhDateParts().dateKey;
  
  // Query official prayer times for today from DB
  const dbRows = await db.select().from(prayerTimesTable).where(
    and(
      eq(prayerTimesTable.city_key, city),
      eq(prayerTimesTable.date_gregorian, today)
    )
  );
  
  const dbRow = dbRows[0];
  
  // No built-in fallback values: return error if no official data.
  if (!dbRow) {
    return res.status(404).json({
      error: "لا تتوفر مواقيت الصلاة الرسمية لهذا اليوم والمدينة",
      city,
      date: today,
      available: false,
      message: "يرجى إضافة مواقيت الصلاة الرسمية من خلال لوحة المالك أو الاتصال بمسؤول النظام",
    });
  }
  
  const { next_prayer, time_remaining } = getNextPrayer(dbRow);

  return res.json({
    city,
    date: today,
    fajr: dbRow.fajr,
    sunrise: dbRow.sunrise,
    dhuhr: dbRow.dhuhr,
    asr: dbRow.asr,
    maghrib: dbRow.maghrib,
    isha: dbRow.isha,
    next_prayer,
    time_remaining,
    source: dbRow.source ?? null,
    is_official: true,
  });
});

export default router;

