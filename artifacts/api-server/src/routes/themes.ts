import { Router } from "express";
import { db } from "@workspace/db";
import { themesTable, auditLogsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { UpdateThemeBody } from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/requireAdmin";

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

router.get("/themes", async (req, res) => {
  const rows = await db.select().from(themesTable).orderBy(themesTable.id);
  return res.json(rows);
});

router.patch("/themes/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id as string);
  const parsed = UpdateThemeBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error });
  const adminUser = (req as any).adminUser;
  const actorId = adminUser?.id ?? adminUser?.email ?? null;
  const [row] = await db.update(themesTable).set(parsed.data).where(eq(themesTable.id, id)).returning();
  if (!row) return res.status(404).json({ error: "غير موجود" });
  await logAudit(actorId, "update", "theme", row.id, row.name, `تعديل ثيم: ${row.name}`);
  return res.json(row);
});

export default router;

