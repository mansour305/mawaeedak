import { Router } from "express";
import { requireAdmin } from "../middlewares/requireAdmin";
import { db } from "@workspace/db";
import { appointmentsTable } from "@workspace/db";
import { eq, desc, gte, and } from "drizzle-orm";
import { CreateAppointmentBody, UpdateAppointmentBody } from "@workspace/api-zod";
import { auditLogsTable } from "@workspace/db";

const router = Router();

function riyadhTodayKey(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Riyadh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

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

router.get("/appointments", async (req, res) => {
  const { category, search } = req.query as Record<string, string>;
  // Only return public appointments - private appointments require user context
  const rows = await db.select().from(appointmentsTable).where(eq(appointmentsTable.is_public, true)).orderBy(desc(appointmentsTable.date));
  let result = rows;
  if (category) result = result.filter(r => r.category === category);
  if (search) result = result.filter(r => r.title.includes(search) || (r.description ?? "").includes(search));
  return res.json(result);
});

router.get("/appointments/upcoming", async (req, res) => {
  const limit = parseInt((req.query.limit as string) ?? "10");
  const today = riyadhTodayKey();
  // Only return upcoming public appointments
  const rows = await db.select().from(appointmentsTable)
    .where(and(eq(appointmentsTable.is_public, true), gte(appointmentsTable.date, today)))
    .orderBy(appointmentsTable.date)
    .limit(limit);
  return res.json(rows);
});

router.get("/appointments/:id", async (req, res) => {
  const id = parseInt(req.params.id as string);
  // Only return public appointments by ID
  const [row] = await db.select().from(appointmentsTable).where(and(eq(appointmentsTable.id, id), eq(appointmentsTable.is_public, true)));
  if (!row) return res.status(404).json({ error: "غير موجود" });
  return res.json(row);
});

router.post("/appointments", requireAdmin, async (req, res) => {
  const parsed = CreateAppointmentBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error });
  // Admin creates appointments - user_id is optional (null for global events)
  const adminUser = (req as any).adminUser;
  const actorId = adminUser?.id ?? adminUser?.email ?? null;
  const [row] = await db.insert(appointmentsTable).values(parsed.data).returning();
  await logAudit(actorId, "create", "appointment", row.id, row.title, `إضافة موعد: ${row.title}`);
  return res.status(201).json(row);
});

router.patch("/appointments/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id as string);
  const parsed = UpdateAppointmentBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error });
  const adminUser = (req as any).adminUser;
  const actorId = adminUser?.id ?? adminUser?.email ?? null;
  const [row] = await db.update(appointmentsTable).set(parsed.data).where(eq(appointmentsTable.id, id)).returning();
  if (!row) return res.status(404).json({ error: "غير موجود" });
  await logAudit(actorId, "update", "appointment", row.id, row.title, `تعديل موعد: ${row.title}`);
  return res.json(row);
});

router.delete("/appointments/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id as string);
  const adminUser = (req as any).adminUser;
  const actorId = adminUser?.id ?? adminUser?.email ?? null;
  const [deleted] = await db.delete(appointmentsTable).where(eq(appointmentsTable.id, id)).returning();
  if (!deleted) return res.status(404).json({ error: "غير موجود" });
  await logAudit(actorId, "delete", "appointment", id, deleted.title, `حذف موعد: ${deleted.title}`);
  return res.status(204).send();
});

export default router;

