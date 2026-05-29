import { Router } from "express";
import { db } from "@workspace/db";
import { appointmentsTable } from "@workspace/db";
import { eq, desc, gte, sql } from "drizzle-orm";
import { CreateAppointmentBody, UpdateAppointmentBody } from "@workspace/api-zod";
import { auditLogsTable } from "@workspace/db";

const router = Router();

async function logAudit(action: string, entityType: string, entityId: number | null, entityName: string, description: string) {
  await db.insert(auditLogsTable).values({ action, entity_type: entityType, entity_id: entityId, entity_name: entityName, description, performed_by: "admin", status: "success" });
}

router.get("/appointments", async (req, res) => {
  const { category, search } = req.query as Record<string, string>;
  let query = db.select().from(appointmentsTable).orderBy(desc(appointmentsTable.date));
  const rows = await query;
  let result = rows;
  if (category) result = result.filter(r => r.category === category);
  if (search) result = result.filter(r => r.title.includes(search) || (r.description ?? "").includes(search));
  return res.json(result);
});

router.get("/appointments/upcoming", async (req, res) => {
  const limit = parseInt((req.query.limit as string) ?? "10");
  const today = new Date().toISOString().split("T")[0];
  const rows = await db.select().from(appointmentsTable)
    .where(gte(appointmentsTable.date, today))
    .orderBy(appointmentsTable.date)
    .limit(limit);
  return res.json(rows);
});

router.get("/appointments/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const [row] = await db.select().from(appointmentsTable).where(eq(appointmentsTable.id, id));
  if (!row) return res.status(404).json({ error: "غير موجود" });
  return res.json(row);
});

router.post("/appointments", async (req, res) => {
  const parsed = CreateAppointmentBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error });
  const [row] = await db.insert(appointmentsTable).values(parsed.data).returning();
  return res.status(201).json(row);
});

router.patch("/appointments/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const parsed = UpdateAppointmentBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error });
  const [row] = await db.update(appointmentsTable).set(parsed.data).where(eq(appointmentsTable.id, id)).returning();
  if (!row) return res.status(404).json({ error: "غير موجود" });
  return res.json(row);
});

router.delete("/appointments/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const [deleted] = await db.delete(appointmentsTable).where(eq(appointmentsTable.id, id)).returning();
  if (!deleted) return res.status(404).json({ error: "غير موجود" });
  return res.status(204).send();
});

export default router;
