import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const complaintsTable = pgTable("complaints", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  category: text("category"),
  title: text("title"),
  message: text("message").notNull(),
  contact: text("contact"),
  user_id: text("user_id"),
  status: text("status").notNull().default("pending"),
  admin_reply: text("admin_reply"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const insertComplaintSchema = createInsertSchema(complaintsTable).omit({
  id: true,
  created_at: true,
  updated_at: true,
  status: true,
  admin_reply: true,
});
export type InsertComplaint = z.infer<typeof insertComplaintSchema>;
export type Complaint = typeof complaintsTable.$inferSelect;
