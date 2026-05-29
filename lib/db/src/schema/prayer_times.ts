import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const prayerTimesTable = pgTable("prayer_times", {
  id: serial("id").primaryKey(),
  city: text("city").notNull(),
  fajr: text("fajr").notNull(),
  sunrise: text("sunrise").notNull(),
  dhuhr: text("dhuhr").notNull(),
  asr: text("asr").notNull(),
  maghrib: text("maghrib").notNull(),
  isha: text("isha").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const insertPrayerTimesSchema = createInsertSchema(prayerTimesTable).omit({ id: true, created_at: true });
export type InsertPrayerTimes = z.infer<typeof insertPrayerTimesSchema>;
export type PrayerTimes = typeof prayerTimesTable.$inferSelect;
