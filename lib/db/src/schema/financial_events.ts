import { pgTable, serial, text, timestamp, boolean, integer, numeric, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

/**
 * Financial events represent salary payments, support deposits or other
 * recurring financial transactions. This schema introduces a `user_id`
 * column so that events can be scoped per user. It also adds `confirmed`
 * and `source` fields to indicate whether the date is official and where
 * it originated.
 */
export const financialEventsTable = pgTable("financial_events", {
  id: serial("id").primaryKey(),
  /**
   * The unique identifier of the user this event belongs to. Use the UUID
   * from `auth.users.id` in Supabase. For global events (e.g. official
   * announcements applicable to all users) you can set this to null and
   * handle it separately in your queries.
   */
  user_id: uuid("user_id").notNull(),
  /**
   * Human‑readable name of the event (e.g. "راتب شهر ذو الحجة 1447").
   */
  name: text("name").notNull(),
  /**
   * Event type such as "salary", "support", or custom categories defined
   * by the system.
   */
  type: text("type").notNull(),
  /**
   * The next expected occurrence date (YYYY-MM-DD). Use ISO format.
   */
  next_date: text("next_date").notNull(),
  amount: numeric("amount"),
  notes: text("notes"),
  /**
   * Flag indicating whether this event is active and should appear in
   * reminders and countdowns.
   */
  is_active: boolean("is_active").notNull().default(true),
  /**
   * Number of days before `next_date` when a reminder should be sent.
   */
  reminder_days_before: integer("reminder_days_before").notNull().default(3),
  /**
   * Whether the date has been verified by an official authority (e.g.
   * Ministry of Finance). When false, the event is considered tentative.
   */
  confirmed: boolean("confirmed").notNull().default(false),
  /**
   * Textual source or authority from which this event was obtained
   * (e.g. "وزارة المالية", "برنامج حساب المواطن").
   */
  source: text("source"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const insertFinancialEventSchema = createInsertSchema(financialEventsTable).omit({
  id: true,
  created_at: true,
});

export type InsertFinancialEvent = z.infer<typeof insertFinancialEventSchema>;
export type FinancialEvent = typeof financialEventsTable.$inferSelect;