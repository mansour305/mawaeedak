import { pgTable, serial, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

/**
 * Table storing verified prayer times from official sources. Unlike the
 * `prayer_times` table used for user‑computed or fallback times, this
 * structure is used to store authoritative timings which can be shown
 * directly to users.
 */
export const officialPrayerTimesTable = pgTable("official_prayer_times", {
  id: serial("id").primaryKey(),
  city_key: text("city_key").notNull(),
  city_name_ar: text("city_name_ar").notNull(),
  date_gregorian: text("date_gregorian").notNull(),
  date_hijri: text("date_hijri"),
  fajr: text("fajr").notNull(),
  sunrise: text("sunrise").notNull(),
  dhuhr: text("dhuhr").notNull(),
  asr: text("asr").notNull(),
  maghrib: text("maghrib").notNull(),
  isha: text("isha").notNull(),
  /**
   * Name of the official authority providing this timing (e.g. "وزارة الشؤون الإسلامية").
   */
  source_authority: text("source_authority").notNull(),
  /**
   * Optional URL referencing the source document or API.
   */
  source_url: text("source_url"),
  verified_at: timestamp("verified_at").notNull(),
  is_confirmed: boolean("is_confirmed").notNull().default(false),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const insertOfficialPrayerTimesSchema = createInsertSchema(officialPrayerTimesTable).omit({
  id: true,
  created_at: true,
});
export type InsertOfficialPrayerTimes = z.infer<typeof insertOfficialPrayerTimesSchema>;
export type OfficialPrayerTimes = typeof officialPrayerTimesTable.$inferSelect;
