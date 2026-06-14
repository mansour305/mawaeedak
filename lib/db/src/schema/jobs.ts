import { pgTable, serial, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const jobsTable = pgTable("jobs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  employer: text("employer").notNull(),
  sector: text("sector").notNull(),
  city: text("city").notNull(),
  description: text("description"),
  apply_url: text("apply_url"),
  deadline: text("deadline"),
  is_active: boolean("is_active").notNull().default(true),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const insertJobSchema = createInsertSchema(jobsTable).omit({ id: true, created_at: true });
export type InsertJob = z.infer<typeof insertJobSchema>;
export type Job = typeof jobsTable.$inferSelect;

