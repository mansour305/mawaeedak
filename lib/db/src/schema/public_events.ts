import { pgTable, serial, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const publicEventsTable = pgTable("public_events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  event_date: text("event_date").notNull(),
  category: text("category").notNull(),
  is_active: boolean("is_active").notNull().default(true),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const insertPublicEventSchema = createInsertSchema(publicEventsTable).omit({ id: true, created_at: true });
export type InsertPublicEvent = z.infer<typeof insertPublicEventSchema>;
export type PublicEvent = typeof publicEventsTable.$inferSelect;

