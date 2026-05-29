import { Router } from "express";
import { db } from "@workspace/db";
import { complaintsTable, auditLogsTable } from "@workspace/db";
import { desc, eq, sql } from "drizzle-orm";
import { CreateComplaintBody, UpdateComplaintBody } from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/requireAdmin";

const router = Router();

async function logAudit(action: string, entityId: number | null, entityName: string, description: string) {
  await db.insert(auditLogsTable).values({
    action,
    entity_type: "complaint",
    entity_id: entityId,
    entity_name: entityName,
    description,
    performed_by: "admin",
    status: "success",
  });
}

// List complaints — admin only (contains user-submitted contact info).
router.get("/complaints", requireAdmin, async (req, res) => {
  const rows = await db.select().from(complaintsTable).orderBy(desc(complaintsTable.created_at));
  return res.json(rows);
});

// Submit complaint — public (guests and users can send).
router.post("/complaints", async (req, res) => {
  const parsed = CreateComplaintBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error });
  const [row] = await db.insert(complaintsTable).values({ ...parsed.data, status: "pending" }).returning();
  return res.status(201).json(row);
});

// Update complaint (status / admin reply) — admin only.
router.patch("/complaints/:id", requireAdmin, async (req, res) => {
  const id = parseInt(String(req.params.id));
  const parsed = UpdateComplaintBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error });
  const [row] = await db
    .update(complaintsTable)
    .set({ ...parsed.data, updated_at: sql`now()` })
    .where(eq(complaintsTable.id, id))
    .returning();
  if (!row) return res.status(404).json({ error: "غير موجود" });
  await logAudit("update", row.id, row.title ?? row.type, `تحديث رسالة: ${row.title ?? row.type}`);
  return res.json(row);
});

// Delete complaint — admin only.
router.delete("/complaints/:id", requireAdmin, async (req, res) => {
  const id = parseInt(String(req.params.id));
  const [deleted] = await db.delete(complaintsTable).where(eq(complaintsTable.id, id)).returning();
  if (!deleted) return res.status(404).json({ error: "غير موجود" });
  await logAudit("delete", id, deleted.title ?? deleted.type, `حذف رسالة: ${deleted.title ?? deleted.type}`);
  return res.status(204).send();
});

export default router;
