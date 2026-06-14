import { Router } from "express";
import { db } from "@workspace/db";
import { auditLogsTable, notificationsTable, newsTable, jobsTable, complaintsTable, appointmentsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { ListAuditLogsQueryParams } from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/requireAdmin";

const router = Router();

router.get("/audit-logs", requireAdmin, async (req, res) => {
  const limit = parseInt((req.query.limit as string) ?? "50");
  const rows = await db.select().from(auditLogsTable).orderBy(desc(auditLogsTable.created_at)).limit(limit);
  return res.json(rows);
});

router.get("/admin/stats", requireAdmin, async (req, res) => {
  const [appointments, notifications, news, jobs, complaints] = await Promise.all([
    db.select().from(appointmentsTable),
    db.select().from(notificationsTable),
    db.select().from(newsTable),
    db.select().from(jobsTable),
    db.select().from(complaintsTable),
  ]);

  const unread = notifications.filter(n => !n.is_read).length;
  const pending = complaints.filter(c => c.status === "pending").length;
  const suggestions = complaints.filter(c => c.type === "اقتراح" || c.category === "اقتراح").length;
  const awaitingReply = complaints.filter(c => !c.admin_reply && c.status !== "closed").length;
  const resolved = complaints.filter(c => c.status === "resolved").length;

  return res.json({
    total_appointments: appointments.length,
    total_notifications: notifications.length,
    unread_notifications: unread,
    total_news: news.length,
    total_jobs: jobs.length,
    total_complaints: complaints.length,
    pending_complaints: pending,
    total_suggestions: suggestions,
    awaiting_reply: awaitingReply,
    resolved_complaints: resolved,
  });
});

export default router;

