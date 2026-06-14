import { pgTable, serial, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const newsTable = pgTable("news", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  body: text("body"),
  category: text("category").notNull(),
  source: text("source"),
  image_url: text("image_url"),
  is_published: boolean("is_published").notNull().default(true),
  published_at: timestamp("published_at").defaultNow(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const insertNewsSchema = createInsertSchema(newsTable).omit({ id: true, created_at: true });
export type InsertNews = z.infer<typeof insertNewsSchema>;
export type News = typeof newsTable.$inferSelect;

