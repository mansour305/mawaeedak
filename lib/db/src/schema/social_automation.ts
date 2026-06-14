import { pgTable, serial, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

// Singleton-style settings row for X/Twitter daily automation.
export const socialAutomationSettingsTable = pgTable("social_automation_settings", {
  id: serial("id").primaryKey(),
  platform: text("platform").notNull().default("x"),
  is_enabled: boolean("is_enabled").notNull().default(false),
  post_time: text("post_time").notNull().default("00:05"),
  template: text("template").notNull().default(""),
  account_handle: text("account_handle"),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const updateSocialAutomationSettingsSchema = createInsertSchema(socialAutomationSettingsTable)
  .omit({ id: true, updated_at: true })
  .partial();
export type UpdateSocialAutomationSettings = z.infer<typeof updateSocialAutomationSettingsSchema>;
export type SocialAutomationSettings = typeof socialAutomationSettingsTable.$inferSelect;

// Append-only log of automation attempts (preview, manual test, scheduled run).
export const socialAutomationLogsTable = pgTable("social_automation_logs", {
  id: serial("id").primaryKey(),
  platform: text("platform").notNull().default("x"),
  kind: text("kind").notNull(),
  status: text("status").notNull(),
  content: text("content"),
  detail: text("detail"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export type SocialAutomationLog = typeof socialAutomationLogsTable.$inferSelect;

