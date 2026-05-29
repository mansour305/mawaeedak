import { pgTable, serial, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const storyTemplatesTable = pgTable("story_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  template_text: text("template_text").notNull(),
  background_color: text("background_color"),
  text_color: text("text_color"),
  is_active: boolean("is_active").notNull().default(true),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const insertStoryTemplateSchema = createInsertSchema(storyTemplatesTable).omit({ id: true, created_at: true });
export type InsertStoryTemplate = z.infer<typeof insertStoryTemplateSchema>;
export type StoryTemplate = typeof storyTemplatesTable.$inferSelect;
