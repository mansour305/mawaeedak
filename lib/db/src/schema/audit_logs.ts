import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const auditLogsTable = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  action: text("action").notNull(),
  entity_type: text("entity_type").notNull(),
  entity_id: integer("entity_id"),
  entity_name: text("entity_name"),
  description: text("description"),
  performed_by: text("performed_by").notNull().default("admin"),
  status: text("status").notNull().default("success"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const insertAuditLogSchema = createInsertSchema(auditLogsTable).omit({ id: true, created_at: true });
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type AuditLog = typeof auditLogsTable.$inferSelect;

