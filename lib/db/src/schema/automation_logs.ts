import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const automationLogsTable = pgTable("automation_logs", {
  id: serial("id").primaryKey(),
  job_name: text("job_name").notNull(),
  status: text("status").notNull().default("success"),
  details: text("details"),
  items_created: integer("items_created").notNull().default(0),
  run_at: text("run_at").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const insertAutomationLogSchema = createInsertSchema(automationLogsTable).omit({ id: true, created_at: true });
export type InsertAutomationLog = z.infer<typeof insertAutomationLogSchema>;
export type AutomationLog = typeof automationLogsTable.$inferSelect;
