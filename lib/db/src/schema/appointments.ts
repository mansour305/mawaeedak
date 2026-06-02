import { pgTable, serial, text, timestamp, boolean, integer, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

/**
 * Appointments table schema.
 *
 * This version extends the original schema by adding a `user_id` column.
 * Each appointment record is now associated with the authenticated user who
 * created it. The `user_id` should reference the `auth.users.id` column in
 * Supabase which is a UUID. When migrating an existing database, you must
 * add a corresponding column and backfill with a default user or implement
 * a migration script to assign appointments to users.
 */
export const appointmentsTable = pgTable("appointments", {
  id: serial("id").primaryKey(),
  /**
   * The unique identifier of the user who owns this appointment.
   * In Supabase this should be a UUID referencing `auth.users.id`.
   */
  user_id: uuid("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  /**
   * The date of the appointment in ISO-8601 format (YYYY-MM-DD).
   */
  date: text("date").notNull(),
  /**
   * The time of the appointment (HH:mm format). Optional.
   */
  time: text("time"),
  category: text("category").notNull().default("شخصي"),
  color: text("color"),
  priority: text("priority"),
  reminder_enabled: boolean("reminder_enabled").notNull().default(false),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const insertAppointmentSchema = createInsertSchema(appointmentsTable).omit({
  id: true,
  created_at: true,
});

export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Appointment = typeof appointmentsTable.$inferSelect;