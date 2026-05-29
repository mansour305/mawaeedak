/// <reference lib="dom" />
/**
 * Phase 19 — Full Screenshot Package
 * User pages (no auth) + Admin pages (shared auth from phase19-auth.json).
 */
import { test, type Page, type Browser } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

const BASE      = "http://localhost:80";
const OUT_USER  = "/tmp/phase19-user";  // outside outputDir so playwright cleanup doesn't remove them
const OUT_ADMIN = "/tmp/phase19-admin"; // outside outputDir so playwright cleanup doesn't remove them
const AUTH_FILE = "/tmp/phase19-auth.json"; // outside test-results — persists across Playwright runs

function ensureDir(d: string) { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); }

async function waitForAdminReady(page: Page, ms = 10000) {
  await page.waitForFunction(
    () => !!document.querySelector("header h1"),
    {},
    { timeout: ms }
  );
}

async function newAuthPage(browser: Browser) {
  const ctx = await browser.newContext({ storageState: AUTH_FILE });
  const pg = await ctx.newPage();
  return { ctx, page: pg };
}

test.beforeAll(() => {
  ensureDir(OUT_USER);
  ensureDir(OUT_ADMIN);
  if (!fs.existsSync(AUTH_FILE)) {
    throw new Error(`Auth file not found: ${AUTH_FILE} — run admin-session-e2e.spec.ts first`);
  }
});

// ── User Pages ────────────────────────────────────────────────────────────────
const USER_PAGES = [
  { slug: "01-home",                route: "/",                        label: "الرئيسية" },
  { slug: "02-calendar",            route: "/calendar",                label: "التقويم" },
  { slug: "03-finance",             route: "/finance",                 label: "المال" },
  { slug: "04-finance-calc",        route: "/finance?tab=calculators", label: "الحاسبات" },
  { slug: "05-finance-scale",       route: "/finance?tab=scale",       label: "سلم الرواتب" },
  { slug: "06-centers",             route: "/centers",                 label: "المراكز" },
  { slug: "07-story",               route: "/story",                   label: "ستوري اليوم" },
  { slug: "08-account",             route: "/account",                 label: "حسابي" },
  { slug: "09-notifications",       route: "/notifications",           label: "الإشعارات" },
  { slug: "10-support",             route: "/support",                 label: "الدعم" },
  { slug: "11-privacy",             route: "/privacy",                 label: "الخصوصية" },
  { slug: "12-terms",               route: "/terms",                   label: "الشروط" },
  { slug: "13-visual-reference",    route: "/visual-reference-clone",  label: "مرجع التصميم" },
  { slug: "14-admin-self-test",     route: "/admin-self-test",         label: "اختبار ذاتي" },
];

for (const pg of USER_PAGES) {
  test(`U: ${pg.label}`, async ({ page }) => {
    test.setTimeout(18000);
    await page.goto(`${BASE}${pg.route}`);
    await page.waitForTimeout(2200);
    const body = await page.locator("body").innerText();
    await page.screenshot({ path: path.join(OUT_USER, `${pg.slug}.png`), fullPage: true });
    console.log(`U ✅ ${pg.label} (${body.length} chars)`);
    if (body.length < 50) console.warn(`⚠️ Possible white screen on ${pg.route}`);
  });
}

// ── Admin Pages ───────────────────────────────────────────────────────────────
const ADMIN_PAGES = [
  { slug: "A01-dashboard",     route: "/admin/dashboard",     label: "لوحة التحكم" },
  { slug: "A02-automation",    route: "/admin/automation",    label: "الأتمتة" },
  { slug: "A03-visual-guide",  route: "/admin/visual-guide",  label: "دليل التصميم" },
  { slug: "A04-data-layer",    route: "/admin/data-layer",    label: "طبقة البيانات" },
  { slug: "A05-notifications", route: "/admin/notifications", label: "الإشعارات" },
  { slug: "A06-messages",      route: "/admin/messages",      label: "الرسائل اليومية" },
  { slug: "A07-themes",        route: "/admin/themes",        label: "الثيمات" },
  { slug: "A08-story",         route: "/admin/story",         label: "ستوري اليوم" },
  { slug: "A09-news-jobs",     route: "/admin/news-jobs",     label: "الأخبار والوظائف" },
  { slug: "A10-reports",       route: "/admin/reports",       label: "التقارير" },
];

for (const pg of ADMIN_PAGES) {
  test(`A: ${pg.label}`, async ({ browser }) => {
    test.setTimeout(22000);
    const { ctx, page } = await newAuthPage(browser);
    await page.goto(`${BASE}${pg.route}`);
    await waitForAdminReady(page);
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(OUT_ADMIN, `${pg.slug}.png`), fullPage: true });
    const body = await page.locator("body").innerText();
    console.log(`A ✅ ${pg.label} (${body.length} chars)`);
    await ctx.close();
  });
}
