import { pgTable, serial, text, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const themesTable = pgTable("themes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  colors: jsonb("colors"),
  is_active: boolean("is_active").notNull().default(true),
  is_available: boolean("is_available").notNull().default(true),
  tier: text("tier").notNull().default("free"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const insertThemeSchema = createInsertSchema(themesTable).omit({ id: true, created_at: true });
export type InsertTheme = z.infer<typeof insertThemeSchema>;
export type Theme = typeof themesTable.$inferSelect;
