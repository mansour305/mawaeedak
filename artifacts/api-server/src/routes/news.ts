import { Router } from "express";
import { requireAdmin } from "../middlewares/requireAdmin";
import { db } from "@workspace/db";
import { newsTable, auditLogsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { CreateNewsBody, UpdateNewsBody } from "@workspace/api-zod";

const router = Router();

async function logAudit(actor: string | null, action: string, entityType: string, entityId: number | null, entityName: string, description: string) {
  await db.insert(auditLogsTable).values({ 
    action, 
    entity_type: entityType, 
    entity_id: entityId, 
    entity_name: entityName, 
    description, 
    performed_by: actor ?? "system", 
    status: "success" 
  });
}

router.get("/news", async (req, res) => {
  const { category, search } = req.query as Record<string, string>;
  const rows = await db.select().from(newsTable).orderBy(desc(newsTable.created_at));
  let result = rows;
  if (category) result = result.filter(r => r.category === category);
  if (search) result = result.filter(r => r.title.includes(search) || (r.body ?? "").includes(search));
  return res.json(result);
});

router.post("/news", requireAdmin, async (req, res) => {
  const parsed = CreateNewsBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error });
  const adminUser = (req as any).adminUser;
  const actorId = adminUser?.id ?? adminUser?.email ?? null;
  const [row] = await db.insert(newsTable).values(parsed.data).returning();
  await logAudit(actorId, "create", "news", row.id, row.title, `إضافة خبر: ${row.title}`);
  return res.status(201).json(row);
});

router.patch("/news/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id as string);
  const parsed = UpdateNewsBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error });
  const adminUser = (req as any).adminUser;
  const actorId = adminUser?.id ?? adminUser?.email ?? null;
  const [row] = await db.update(newsTable).set(parsed.data).where(eq(newsTable.id, id)).returning();
  if (!row) return res.status(404).json({ error: "غير موجود" });
  await logAudit(actorId, "update", "news", row.id, row.title, `تعديل خبر: ${row.title}`);
  return res.json(row);
});

router.delete("/news/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id as string);
  const adminUser = (req as any).adminUser;
  const actorId = adminUser?.id ?? adminUser?.email ?? null;
  const [deleted] = await db.delete(newsTable).where(eq(newsTable.id, id)).returning();
  if (!deleted) return res.status(404).json({ error: "غير موجود" });
  await logAudit(actorId, "delete", "news", id, deleted.title, `حذف خبر: ${deleted.title}`);
  return res.status(204).send();
});

export default router;

