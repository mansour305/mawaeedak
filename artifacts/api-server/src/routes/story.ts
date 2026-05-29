import { Router } from "express";
import { requireAdmin } from "../middlewares/requireAdmin";
import { db } from "@workspace/db";
import { storyTemplatesTable, auditLogsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { CreateStoryTemplateBody, UpdateStoryTemplateBody } from "@workspace/api-zod";

const router = Router();

async function logAudit(action: string, entityType: string, entityId: number | null, entityName: string, description: string) {
  await db.insert(auditLogsTable).values({ action, entity_type: entityType, entity_id: entityId, entity_name: entityName, description, performed_by: "admin", status: "success" });
}

router.get("/story-templates", async (req, res) => {
  const rows = await db.select().from(storyTemplatesTable).orderBy(storyTemplatesTable.id);
  return res.json(rows);
});

router.post("/story-templates", requireAdmin, async (req, res) => {
  const parsed = CreateStoryTemplateBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error });
  const [row] = await db.insert(storyTemplatesTable).values(parsed.data).returning();
  await logAudit("create", "story_template", row.id, row.name, `إضافة قالب ستوري: ${row.name}`);
  return res.status(201).json(row);
});

router.patch("/story-templates/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id as string);
  const parsed = UpdateStoryTemplateBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error });
  const [row] = await db.update(storyTemplatesTable).set(parsed.data).where(eq(storyTemplatesTable.id, id)).returning();
  if (!row) return res.status(404).json({ error: "غير موجود" });
  await logAudit("update", "story_template", row.id, row.name, `تعديل قالب ستوري: ${row.name}`);
  return res.json(row);
});

router.delete("/story-templates/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id as string);
  const [deleted] = await db.delete(storyTemplatesTable).where(eq(storyTemplatesTable.id, id)).returning();
  if (!deleted) return res.status(404).json({ error: "غير موجود" });
  await logAudit("delete", "story_template", id, deleted.name, `حذف قالب ستوري: ${deleted.name}`);
  return res.status(204).send();
});

export default router;
