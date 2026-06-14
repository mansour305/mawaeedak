import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const appSettingsTable = pgTable("app_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export type AppSetting = typeof appSettingsTable.$inferSelect;

export const DEFAULT_THEME_KEY = "default_theme_slug";

