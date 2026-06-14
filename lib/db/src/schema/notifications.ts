import { pgTable, serial, text, timestamp, boolean, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

/**
 * Notifications table. Each notification is now associated with a user via
 * `user_id`. You may also leave `user_id` null for broadcast messages
 * delivered to all users.
 */
export const notificationsTable = pgTable("notifications", {
  id: serial("id").primaryKey(),
  /**
   * The user this notification belongs to. Use `null` for global
   * notifications intended for all users.
   */
  user_id: uuid("user_id"),
  title: text("title").notNull(),
  body: text("body"),
  type: text("type").notNull().default("general"),
  is_read: boolean("is_read").notNull().default(false),
  source_key: text("source_key"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const insertNotificationSchema = createInsertSchema(notificationsTable).omit({
  id: true,
  created_at: true,
});

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notificationsTable.$inferSelect;
