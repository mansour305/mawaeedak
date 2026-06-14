import { Router } from "express";
import { requireAdmin } from "../middlewares/requireAdmin";
import { db } from "@workspace/db";
import { jobsTable, auditLogsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { CreateJobBody, UpdateJobBody } from "@workspace/api-zod";

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

router.get("/jobs", async (req, res) => {
  const { city, sector, search } = req.query as Record<string, string>;
  const rows = await db.select().from(jobsTable).orderBy(desc(jobsTable.created_at));
  let result = rows;
  if (city) result = result.filter(r => r.city === city);
  if (sector) result = result.filter(r => r.sector === sector);
  if (search) result = result.filter(r => r.title.includes(search) || r.employer.includes(search));
  return res.json(result);
});

router.post("/jobs", requireAdmin, async (req, res) => {
  const parsed = CreateJobBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error });
  const adminUser = (req as any).adminUser;
  const actorId = adminUser?.id ?? adminUser?.email ?? null;
  const [row] = await db.insert(jobsTable).values(parsed.data).returning();
  await logAudit(actorId, "create", "job", row.id, row.title, `إضافة وظيفة: ${row.title}`);
  return res.status(201).json(row);
});

router.patch("/jobs/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id as string);
  const parsed = UpdateJobBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error });
  const adminUser = (req as any).adminUser;
  const actorId = adminUser?.id ?? adminUser?.email ?? null;
  const [row] = await db.update(jobsTable).set(parsed.data).where(eq(jobsTable.id, id)).returning();
  if (!row) return res.status(404).json({ error: "غير موجود" });
  await logAudit(actorId, "update", "job", row.id, row.title, `تعديل وظيفة: ${row.title}`);
  return res.json(row);
});

router.delete("/jobs/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id as string);
  const adminUser = (req as any).adminUser;
  const actorId = adminUser?.id ?? adminUser?.email ?? null;
  const [deleted] = await db.delete(jobsTable).where(eq(jobsTable.id, id)).returning();
  if (!deleted) return res.status(404).json({ error: "غير موجود" });
  await logAudit(actorId, "delete", "job", id, deleted.title, `حذف وظيفة: ${deleted.title}`);
  return res.status(204).send();
});

export default router;

