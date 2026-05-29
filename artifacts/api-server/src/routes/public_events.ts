import { Router } from "express";
import { requireAdmin } from "../middlewares/requireAdmin";
import { db } from "@workspace/db";
import { publicEventsTable, auditLogsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { CreatePublicEventBody, UpdatePublicEventBody } from "@workspace/api-zod";

const router = Router();

async function logAudit(action: string, entityType: string, entityId: number | null, entityName: string, description: string) {
  await db.insert(auditLogsTable).values({ action, entity_type: entityType, entity_id: entityId, entity_name: entityName, description, performed_by: "admin", status: "success" });
}

router.get("/public-events", async (req, res) => {
  const { category } = req.query as Record<string, string>;
  const rows = await db.select().from(publicEventsTable).orderBy(publicEventsTable.event_date);
  if (category) return res.json(rows.filter(r => r.category === category));
  return res.json(rows);
});

router.post("/public-events", requireAdmin, async (req, res) => {
  const parsed = CreatePublicEventBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error });
  const [row] = await db.insert(publicEventsTable).values(parsed.data).returning();
  await logAudit("create", "public_event", row.id, row.title, `إضافة فعالية عامة: ${row.title}`);
  return res.status(201).json(row);
});

router.patch("/public-events/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id as string);
  const parsed = UpdatePublicEventBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error });
  const [row] = await db.update(publicEventsTable).set(parsed.data).where(eq(publicEventsTable.id, id)).returning();
  if (!row) return res.status(404).json({ error: "غير موجود" });
  await logAudit("update", "public_event", row.id, row.title, `تعديل فعالية عامة: ${row.title}`);
  return res.json(row);
});

router.delete("/public-events/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id as string);
  const [deleted] = await db.delete(publicEventsTable).where(eq(publicEventsTable.id, id)).returning();
  if (!deleted) return res.status(404).json({ error: "غير موجود" });
  await logAudit("delete", "public_event", id, deleted.title, `حذف فعالية عامة: ${deleted.title}`);
  return res.status(204).send();
});

export default router;
