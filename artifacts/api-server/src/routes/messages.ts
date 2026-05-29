import { Router } from "express";
import { requireAdmin } from "../middlewares/requireAdmin";
import { db } from "@workspace/db";
import { dailyMessagesTable, auditLogsTable } from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";
import { CreateDailyMessageBody, UpdateDailyMessageBody } from "@workspace/api-zod";

const router = Router();

async function logAudit(action: string, entityType: string, entityId: number | null, entityName: string, description: string) {
  await db.insert(auditLogsTable).values({ action, entity_type: entityType, entity_id: entityId, entity_name: entityName, description, performed_by: "admin", status: "success" });
}

router.get("/daily-messages", async (req, res) => {
  const rows = await db.select().from(dailyMessagesTable).orderBy(desc(dailyMessagesTable.created_at));
  return res.json(rows);
});

router.get("/daily-messages/today", async (req, res) => {
  const today = new Date().toISOString().split("T")[0];
  const rows = await db.select().from(dailyMessagesTable).where(eq(dailyMessagesTable.is_active, true)).orderBy(desc(dailyMessagesTable.created_at));
  // First try to find one with today's date
  const todayMsg = rows.find(r => r.display_date === today);
  if (todayMsg) return res.json(todayMsg);
  // Otherwise return first active message (rotating)
  if (rows.length > 0) {
    const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    return res.json(rows[dayOfYear % rows.length]);
  }
  return res.status(404).json({ error: "لا توجد رسالة اليوم" });
});

router.post("/daily-messages", requireAdmin, async (req, res) => {
  const parsed = CreateDailyMessageBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error });
  const [row] = await db.insert(dailyMessagesTable).values(parsed.data).returning();
  await logAudit("create", "daily_message", row.id, row.message.substring(0, 50), `إضافة رسالة يومية`);
  return res.status(201).json(row);
});

router.patch("/daily-messages/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id as string);
  const parsed = UpdateDailyMessageBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error });
  const [row] = await db.update(dailyMessagesTable).set(parsed.data).where(eq(dailyMessagesTable.id, id)).returning();
  if (!row) return res.status(404).json({ error: "غير موجود" });
  await logAudit("update", "daily_message", row.id, row.message.substring(0, 50), `تعديل رسالة يومية`);
  return res.json(row);
});

router.delete("/daily-messages/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id as string);
  const [deleted] = await db.delete(dailyMessagesTable).where(eq(dailyMessagesTable.id, id)).returning();
  if (!deleted) return res.status(404).json({ error: "غير موجود" });
  await logAudit("delete", "daily_message", id, deleted.message.substring(0, 50), `حذف رسالة يومية`);
  return res.status(204).send();
});

export default router;
