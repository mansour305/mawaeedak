import { Router } from "express";
import { requireAdmin } from "../middlewares/requireAdmin";
import { db } from "@workspace/db";
import { notificationsTable, auditLogsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { CreateNotificationBody } from "@workspace/api-zod";

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

router.get("/notifications", async (req, res) => {
  const unreadOnly = req.query.unread_only === "true";
  const rows = await db.select().from(notificationsTable).orderBy(desc(notificationsTable.created_at));
  if (unreadOnly) return res.json(rows.filter(r => !r.is_read));
  return res.json(rows);
});

router.get("/notifications/unread-count", async (req, res) => {
  const rows = await db.select().from(notificationsTable).where(eq(notificationsTable.is_read, false));
  return res.json({ count: rows.length });
});

router.post("/notifications", requireAdmin, async (req, res) => {
  const parsed = CreateNotificationBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error });
  const adminUser = (req as any).adminUser;
  const actorId = adminUser?.id ?? adminUser?.email ?? null;
  const [row] = await db.insert(notificationsTable).values({ ...parsed.data, is_read: false }).returning();
  await logAudit(actorId, "create", "notification", row.id, row.title, `إرسال إشعار: ${row.title}`);
  return res.status(201).json(row);
});

router.patch("/notifications/:id/read", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id as string);
  const [row] = await db.update(notificationsTable).set({ is_read: true }).where(eq(notificationsTable.id, id)).returning();
  if (!row) return res.status(404).json({ error: "غير موجود" });
  return res.json(row);
});

router.patch("/notifications/read-all", requireAdmin, async (req, res) => {
  await db.update(notificationsTable).set({ is_read: true });
  return res.json({ success: true, message: "تم تحديد الكل كمقروء" });
});

router.delete("/notifications/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id as string);
  const adminUser = (req as any).adminUser;
  const actorId = adminUser?.id ?? adminUser?.email ?? null;
  const [row] = await db.delete(notificationsTable).where(eq(notificationsTable.id, id)).returning();
  if (!row) return res.status(404).json({ error: "غير موجود" });
  await logAudit(actorId, "delete", "notification", row.id, row.title, `حذف إشعار: ${row.title}`);
  return res.status(204).send();
});

export default router;
