import { pgTable, serial, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const dailyMessagesTable = pgTable("daily_messages", {
  id: serial("id").primaryKey(),
  message: text("message").notNull(),
  display_date: text("display_date"),
  is_active: boolean("is_active").notNull().default(true),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const insertDailyMessageSchema = createInsertSchema(dailyMessagesTable).omit({ id: true, created_at: true });
export type InsertDailyMessage = z.infer<typeof insertDailyMessageSchema>;
export type DailyMessage = typeof dailyMessagesTable.$inferSelect;
