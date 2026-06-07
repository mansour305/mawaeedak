import { Router } from "express";
import { db } from "@workspace/db";
import { prayerTimesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

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

const DEFAULT_PRAYER: Record<string, { fajr: string; sunrise: string; dhuhr: string; asr: string; maghrib: string; isha: string }> = {
  riyadh: { fajr: "04:42", sunrise: "06:07", dhuhr: "11:58", asr: "15:26", maghrib: "17:49", isha: "19:19" },
  jeddah: { fajr: "04:51", sunrise: "06:12", dhuhr: "12:08", asr: "15:35", maghrib: "18:00", isha: "19:30" },
  mecca: { fajr: "04:48", sunrise: "06:09", dhuhr: "12:06", asr: "15:32", maghrib: "17:57", isha: "19:27" },
  medina: { fajr: "04:35", sunrise: "06:01", dhuhr: "11:50", asr: "15:18", maghrib: "17:40", isha: "19:10" },
  dammam: { fajr: "04:30", sunrise: "05:55", dhuhr: "11:47", asr: "15:18", maghrib: "17:40", isha: "19:10" },
  khobar: { fajr: "04:31", sunrise: "05:56", dhuhr: "11:47", asr: "15:19", maghrib: "17:41", isha: "19:11" },
  abha: { fajr: "05:00", sunrise: "06:22", dhuhr: "12:12", asr: "15:39", maghrib: "18:03", isha: "19:33" },
  khamis: { fajr: "04:59", sunrise: "06:21", dhuhr: "12:11", asr: "15:38", maghrib: "18:02", isha: "19:32" },
  taif: { fajr: "04:52", sunrise: "06:14", dhuhr: "12:04", asr: "15:31", maghrib: "17:55", isha: "19:25" },
  tabuk: { fajr: "04:48", sunrise: "06:12", dhuhr: "11:59", asr: "15:26", maghrib: "17:48", isha: "19:18" },
  qassim: { fajr: "04:38", sunrise: "06:03", dhuhr: "11:52", asr: "15:20", maghrib: "17:41", isha: "19:11" },
  hail: { fajr: "04:40", sunrise: "06:05", dhuhr: "11:54", asr: "15:22", maghrib: "17:43", isha: "19:13" },
  jouf: { fajr: "04:34", sunrise: "05:59", dhuhr: "11:47", asr: "15:15", maghrib: "17:37", isha: "19:07" },
  jazan: { fajr: "05:05", sunrise: "06:25", dhuhr: "12:17", asr: "15:44", maghrib: "18:09", isha: "19:39" },
  najran: { fajr: "05:02", sunrise: "06:24", dhuhr: "12:13", asr: "15:40", maghrib: "18:05", isha: "19:35" },
  baha: { fajr: "04:58", sunrise: "06:20", dhuhr: "12:10", asr: "15:37", maghrib: "18:01", isha: "19:31" },
  sakaka: { fajr: "04:36", sunrise: "06:01", dhuhr: "11:48", asr: "15:16", maghrib: "17:38", isha: "19:08" },
  arar: { fajr: "04:32", sunrise: "05:57", dhuhr: "11:44", asr: "15:12", maghrib: "17:34", isha: "19:04" },
  yanbu: { fajr: "04:44", sunrise: "06:07", dhuhr: "11:57", asr: "15:24", maghrib: "17:46", isha: "19:16" },
  jubail: { fajr: "04:29", sunrise: "05:54", dhuhr: "11:46", asr: "15:17", maghrib: "17:39", isha: "19:09" },
  ahsa: { fajr: "04:31", sunrise: "05:56", dhuhr: "11:47", asr: "15:18", maghrib: "17:40", isha: "19:10" },
};

function getNextPrayer(times: { fajr: string; sunrise: string; dhuhr: string; asr: string; maghrib: string; isha: string }): { next_prayer: string; time_remaining: string } {
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
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
  const today = new Date().toISOString().split("T")[0];
  const dbRows = await db.select().from(prayerTimesTable).where(eq(prayerTimesTable.city_key, city));
  const dbRow = dbRows[0];
  const times = dbRow ?? { ...(DEFAULT_PRAYER[city] ?? DEFAULT_PRAYER.riyadh), city_key: city };
  const { next_prayer, time_remaining } = getNextPrayer(times);

  return res.json({
    city,
    date: today,
    fajr: times.fajr,
    sunrise: times.sunrise,
    dhuhr: times.dhuhr,
    asr: times.asr,
    maghrib: times.maghrib,
    isha: times.isha,
    next_prayer,
    time_remaining,
  });
});

export default router;
