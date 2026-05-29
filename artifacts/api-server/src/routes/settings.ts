import { Router } from "express";
import { db } from "@workspace/db";
import { appSettingsTable, auditLogsTable, themesTable, DEFAULT_THEME_KEY } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAdmin } from "../middlewares/requireAdmin";

const router = Router();

const DEFAULT_THEME_FALLBACK = "heritage";

function parseSlug(body: unknown): { slug: string } | null {
  if (!body || typeof body !== "object") return null;
  const slug = (body as Record<string, unknown>).slug;
  if (typeof slug !== "string") return null;
  const trimmed = slug.trim();
  if (trimmed.length < 1 || trimmed.length > 64) return null;
  return { slug: trimmed };
}

/**
 * GET /api/settings/default-theme — الثيم الافتراضي العام (عام للقراءة).
 * يعمل في كل أوضاع البيانات لأن Express متاح دائماً.
 */
router.get("/settings/default-theme", async (_req, res) => {
  const [row] = await db
    .select()
    .from(appSettingsTable)
    .where(eq(appSettingsTable.key, DEFAULT_THEME_KEY));
  return res.json({ slug: row?.value ?? DEFAULT_THEME_FALLBACK });
});

/**
 * PUT /api/settings/default-theme — تعيين الثيم الافتراضي العام (للمالك فقط).
 */
router.put("/settings/default-theme", requireAdmin, async (req, res) => {
  const parsed = parseSlug(req.body);
  if (!parsed) return res.status(400).json({ error: "slug غير صالح" });

  const { slug } = parsed;

  const [theme] = await db.select().from(themesTable).where(eq(themesTable.slug, slug));
  if (!theme) return res.status(404).json({ error: "ثيم غير موجود" });
  if (!theme.is_active) return res.status(400).json({ error: "لا يمكن تعيين ثيم معطّل كافتراضي" });

  await db
    .insert(appSettingsTable)
    .values({ key: DEFAULT_THEME_KEY, value: slug, updated_at: new Date() })
    .onConflictDoUpdate({
      target: appSettingsTable.key,
      set: { value: slug, updated_at: new Date() },
    });

  await db.insert(auditLogsTable).values({
    action: "update",
    entity_type: "app_setting",
    entity_id: null,
    entity_name: DEFAULT_THEME_KEY,
    description: `تعيين الثيم الافتراضي العام: ${theme.name}`,
    performed_by: "admin",
    status: "success",
  });

  return res.json({ slug });
});

export default router;
