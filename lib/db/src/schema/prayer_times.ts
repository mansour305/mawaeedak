import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

/**
 * Prayer times table.
 *
 * This schema extends the original by including a `date` field (ISO
 * YYYY-MM-DD), a `city_key` to identify the locality, and `source` / `method`
 * fields to describe how the times were obtained (e.g. official data from
 * وزارة الشؤون الإسلامية or calculations based on the Umm Al‑Qura calendar).
 */
export const prayerTimesTable = pgTable("prayer_times", {
  id: serial("id").primaryKey(),
  /**
   * Key of the city, e.g. "riyadh", which should map to an entry in a
   * separate cities table or configuration.
   */
  city_key: text("city_key").notNull(),
  /**
   * Arabic name of the city for display purposes.
   */
  city_name_ar: text("city_name_ar").notNull(),
  /**
   * Gregorian date for these prayer times (YYYY-MM-DD).
   */
  date_gregorian: text("date_gregorian").notNull(),
  /**
   * Hijri date for these prayer times (DD‑MM‑YYYY), if available.
   */
  date_hijri: text("date_hijri"),
  fajr: text("fajr").notNull(),
  sunrise: text("sunrise").notNull(),
  dhuhr: text("dhuhr").notNull(),
  asr: text("asr").notNull(),
  maghrib: text("maghrib").notNull(),
  isha: text("isha").notNull(),
  /**
   * Optional description of the authority or method used to compute these
   * prayer times, e.g. "تقويم أم القرى" or "وزارة الشؤون الإسلامية".
   */
  source: text("source"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const insertPrayerTimesSchema = createInsertSchema(prayerTimesTable).omit({
  id: true,
  created_at: true,
});
export type InsertPrayerTimes = z.infer<typeof insertPrayerTimesSchema>;
export type PrayerTimes = typeof prayerTimesTable.$inferSelect;