import { pgTable, serial, text, date, timestamp, boolean, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

/**
 * Table storing authoritative information about financial events such as
 * salary deposits and social support programmes. These records are
 * maintained by administrators and referenced by user-level `financial_events`.
 */
export const officialFinancialDatesTable = pgTable("official_financial_dates", {
  id: serial("id").primaryKey(),
  /**
   * Unique key representing the type of event, e.g. "gov_salary", "citizen_account".
   */
  event_key: text("event_key").notNull(),
  /**
   * Human‑readable name in Arabic.
   */
  event_name_ar: text("event_name_ar").notNull(),
  /**
   * Gregorian date of the occurrence (YYYY-MM-DD).
   */
  occurrence_date_gregorian: text("occurrence_date_gregorian").notNull(),
  /**
   * Hijri date of the occurrence if available.
   */
  occurrence_date_hijri: text("occurrence_date_hijri"),
  /**
   * Name of the authority or source from which this date was taken.
   */
  source_authority: text("source_authority").notNull(),
  /**
   * Optional URL pointing to the official announcement or document.
   */
  source_url: text("source_url"),
  /**
   * Timestamp when this record was verified by an administrator.
   */
  verified_at: timestamp("verified_at").notNull(),
  /**
   * Whether the date has been confirmed by the authority. Unconfirmed dates
   * should not be displayed to end users.
   */
  is_confirmed: boolean("is_confirmed").notNull().default(false),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const insertOfficialFinancialDateSchema = createInsertSchema(officialFinancialDatesTable).omit({
  id: true,
  created_at: true,
});
export type InsertOfficialFinancialDate = z.infer<typeof insertOfficialFinancialDateSchema>;
export type OfficialFinancialDate = typeof officialFinancialDatesTable.$inferSelect;
