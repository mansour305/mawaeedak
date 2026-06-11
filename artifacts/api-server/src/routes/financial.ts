import { Router } from "express";
import { requireAdmin } from "../middlewares/requireAdmin";
import { db } from "@workspace/db";
import { financialEventsTable, auditLogsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { CreateFinancialEventBody, UpdateFinancialEventBody } from "@workspace/api-zod";
import type { InferInsertModel } from "drizzle-orm";

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

router.get("/financial-events", async (req, res) => {
  const { type } = req.query as Record<string, string>;
  const rows = await db.select().from(financialEventsTable).orderBy(financialEventsTable.next_date);
  if (type) return res.json(rows.filter(r => r.type === type));
  return res.json(rows);
});

// Asia/Riyadh "today" as a local-midnight Date (date boundaries follow KSA).
function riyadhToday(): Date {
  const s = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Riyadh", year: "numeric", month: "2-digit", day: "2-digit",
  }).format(new Date());
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

// Roll a recurring monthly event forward to its next occurrence relative to
// today. Past-due dates advance by whole months (day-of-month preserved and
// clamped to month length) until >= today; future dates are returned unchanged.
function nextRecurringOccurrence(storedDate: string, today: Date): string {
  const parts = String(storedDate).slice(0, 10).split("-").map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return String(storedDate).slice(0, 10);
  let [y, m] = parts;
  const d = parts[2];
  const clampDay = (yy: number, mm: number, dd: number) =>
    Math.min(dd, new Date(yy, mm, 0).getDate());
  let candidate = new Date(y, m - 1, clampDay(y, m, d));
  while (candidate.getTime() < today.getTime()) {
    m += 1;
    if (m > 12) { m = 1; y += 1; }
    candidate = new Date(y, m - 1, clampDay(y, m, d));
  }
  const mm = String(candidate.getMonth() + 1).padStart(2, "0");
  const dd = String(candidate.getDate()).padStart(2, "0");
  return `${candidate.getFullYear()}-${mm}-${dd}`;
}

router.get("/financial-events/countdown", async (req, res) => {
  const rows = await db.select().from(financialEventsTable).where(eq(financialEventsTable.is_active, true)).orderBy(financialEventsTable.next_date);
  const today = riyadhToday();
  const countdown = rows.map(r => {
    const nextDate = nextRecurringOccurrence(r.next_date, today);
    const diffMs = new Date(nextDate + "T00:00:00").getTime() - today.getTime();
    const daysRemaining = Math.round(diffMs / (1000 * 60 * 60 * 24));
    return { id: r.id, name: r.name, type: r.type, next_date: nextDate, days_remaining: daysRemaining, amount: r.amount ? parseFloat(r.amount) : null };
  });
  countdown.sort((a, b) =>
    a.next_date < b.next_date ? -1 :
    a.next_date > b.next_date ? 1 :
    (a.type === "salary" ? -1 : b.type === "salary" ? 1 : 0)
  );
  return res.json(countdown);
});

router.post("/financial-events", requireAdmin, async (req, res) => {
  const parsed = CreateFinancialEventBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error });
  // Admin creates global financial events - user_id is optional (null for global events)
  const adminUser = (req as any).adminUser;
  const actorId = adminUser?.id ?? adminUser?.email ?? null;
  const dataWithAmount = { ...parsed.data, amount: parsed.data.amount != null ? String(parsed.data.amount) : undefined };
  const [row] = await db.insert(financialEventsTable).values(dataWithAmount).returning();
  await logAudit(actorId, "create", "financial_event", row.id, row.name, `إضافة حدث مالي: ${row.name}`);
  return res.status(201).json(row);
});

router.patch("/financial-events/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id as string);
  const parsed = UpdateFinancialEventBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error });
  const adminUser = (req as any).adminUser;
  const actorId = adminUser?.id ?? adminUser?.email ?? null;
  const updateData = { ...parsed.data, amount: parsed.data.amount != null ? String(parsed.data.amount) : undefined };
  const [row] = await db.update(financialEventsTable).set(updateData).where(eq(financialEventsTable.id, id)).returning();
  if (!row) return res.status(404).json({ error: "غير موجود" });
  await logAudit(actorId, "update", "financial_event", row.id, row.name, `تعديل حدث مالي: ${row.name}`);
  return res.json(row);
});

router.delete("/financial-events/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id as string);
  const adminUser = (req as any).adminUser;
  const actorId = adminUser?.id ?? adminUser?.email ?? null;
  const [deleted] = await db.delete(financialEventsTable).where(eq(financialEventsTable.id, id)).returning();
  if (!deleted) return res.status(404).json({ error: "غير موجود" });
  await logAudit(actorId, "delete", "financial_event", id, deleted.name, `حذف حدث مالي: ${deleted.name}`);
  return res.status(204).send();
});

export default router;
