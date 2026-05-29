import { pgTable, serial, text, timestamp, boolean, integer, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const financialEventsTable = pgTable("financial_events", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  next_date: text("next_date").notNull(),
  amount: numeric("amount"),
  notes: text("notes"),
  is_active: boolean("is_active").notNull().default(true),
  reminder_days_before: integer("reminder_days_before").notNull().default(3),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const insertFinancialEventSchema = createInsertSchema(financialEventsTable).omit({ id: true, created_at: true });
export type InsertFinancialEvent = z.infer<typeof insertFinancialEventSchema>;
export type FinancialEvent = typeof financialEventsTable.$inferSelect;
