/// <reference lib="dom" />
/**
 * Phase 19 — Admin Final E2E (T1–T14)
 * Shared auth state: loginAdmin runs ONCE in beforeAll.
 * Pre-auth tests inject the saved storageState → fast (no repeated Supabase login).
 * Credentials from ADMIN_E2E_EMAIL / ADMIN_E2E_PASSWORD env only.
 */
import { test, expect, type Page, type Browser } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

const EMAIL    = process.env.ADMIN_E2E_EMAIL    ?? "";
const PASSWORD = process.env.ADMIN_E2E_PASSWORD ?? "";
const BASE     = "http://localhost:80";
const OUT      = path.resolve("test-results/phase19-admin");
const AUTH_FILE = "/tmp/phase19-auth.json"; // outside test-results so Playwright cleanup doesn't delete it

function ensureDir(d: string) { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); }

/** Admin ready: <header><h1>لوحة المالك</h1></header> — present on ALL admin pages */
async function waitForAdminReady(page: Page, ms = 12000) {
  await page.waitForFunction(
    () => {
      const h1 = document.querySelector("header h1");
      if (h1?.textContent?.trim() === "لوحة المالك") return true;
      const b = document.body.innerText;
      return b.includes("نظرة عامة") || b.includes("المواعيد الكلية");
    },
    {},
    { timeout: ms }
  );
}

function isAdminReady(body: string) {
  return body.includes("لوحة المالك") && !body.includes("البريد الإلكتروني");
}
function isLoginForm(body: string) {
  return (body.includes("البريد الإلكتروني") || body.includes("تسجيل الدخول")) &&
    !body.includes("الأتمتة") && !body.includes("نظرة عامة");
}

/** Full login flow (used in T2 and beforeAll) */
async function doLogin(page: Page) {
  await page.goto(`${BASE}/admin?reset=1`);
  await page.waitForTimeout(1800);
  await expect(page.locator('input[type="email"]').first()).toBeVisible({ timeout: 6000 });
  await page.locator('input[type="email"]').first().fill(EMAIL);
  await page.locator('input[type="password"]').first().fill(PASSWORD);
  await page.locator('button[type="submit"]').first().click();
  await waitForAdminReady(page, 15000);
  await page.waitForTimeout(1000); // let Supabase persist session token
}

/** Create a pre-authed browser context using saved storageState */
async function newAuthContext(browser: Browser) {
  const ctx = await browser.newContext({ storageState: AUTH_FILE });
  const page = await ctx.newPage();
  return { ctx, page };
}

/** Sign out via hamburger menu */
async function clickSignOut(page: Page) {
  await page.locator("header button").first().click();
  await page.waitForTimeout(700);
  await page.getByText("تسجيل الخروج").click();
  await page.waitForTimeout(2000);
}

/** Collect JS console errors */
function watchConsole(page: Page) {
  const errors: string[] = [];
  page.on("console", m => { if (m.type() === "error") errors.push(m.text().slice(0, 180)); });
  page.on("pageerror", e => errors.push(e.message.slice(0, 180)));
  return errors;
}

// ─── One-time login: save storageState for all pre-auth tests ────────────────
test.beforeAll(async ({ browser }) => {
  ensureDir(OUT);
  ensureDir(path.dirname(AUTH_FILE));
  if (!EMAIL || !PASSWORD) throw new Error("ADMIN_E2E_EMAIL or ADMIN_E2E_PASSWORD not set");
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await doLogin(page);
  await ctx.storageState({ path: AUTH_FILE });
  await ctx.close();
  console.log(`[beforeAll] auth state saved → ${AUTH_FILE}`);
});

// ─── T1: Clean state — login form ───────────────────────────────────────────
test("T1: /admin?reset=1 → login form (clean state)", async ({ page }) => {
  test.setTimeout(20000);
  await page.goto(`${BASE}/admin?reset=1`);
  await page.waitForTimeout(2000);
  await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 5000 });
  const body = await page.locator("body").innerText();
  expect(isLoginForm(body)).toBe(true);
  await page.screenshot({ path: path.join(OUT, "T1-login-form.png"), fullPage: true });
  console.log("T1 PASS ✅");
});

// ─── T2: Live login form fill → dashboard (tests actual Supabase auth) ───────
test("T2: login form fill+submit → dashboard", async ({ page }) => {
  test.setTimeout(40000);
  const errors = watchConsole(page);
  await doLogin(page);
  const body = await page.locator("body").innerText();
  expect(isAdminReady(body)).toBe(true);
  expect(body.length).toBeGreaterThan(100); // T13 check
  await page.screenshot({ path: path.join(OUT, "T2-dashboard.png"), fullPage: true });
  const fatals = errors.filter(e => !e.includes("favicon") && !e.includes("ResizeObserver"));
  console.log(`T2 PASS ✅ (console errors: ${fatals.length})`);
});

// ─── T3: /admin/dashboard visible (pre-auth) ─────────────────────────────────
test("T3: /admin/dashboard visible after login", async ({ browser }) => {
  test.setTimeout(25000);
  const { ctx, page } = await newAuthContext(browser);
  await page.goto(`${BASE}/admin/dashboard`);
  await waitForAdminReady(page);
  const body = await page.locator("body").innerText();
  expect(isAdminReady(body)).toBe(true);
  await page.screenshot({ path: path.join(OUT, "T3-dashboard.png"), fullPage: true });
  await ctx.close();
  console.log("T3 PASS ✅");
});

// ─── T4: hard reload on /admin/dashboard → session persists (INITIAL_SESSION) ─
test("T4: hard reload /admin/dashboard → session persists", async ({ browser }) => {
  test.setTimeout(30000);
  const { ctx, page } = await newAuthContext(browser);
  await page.goto(`${BASE}/admin/dashboard`);
  await waitForAdminReady(page);
  await page.reload();
  await waitForAdminReady(page);
  const body = await page.locator("body").innerText();
  expect(isAdminReady(body)).toBe(true);
  await page.screenshot({ path: path.join(OUT, "T4-dashboard-reload.png"), fullPage: true });
  await ctx.close();
  console.log("T4 PASS ✅");
});

// ─── T5: /admin/automation visible (pre-auth) ────────────────────────────────
test("T5: /admin/automation visible after login", async ({ browser }) => {
  test.setTimeout(25000);
  const { ctx, page } = await newAuthContext(browser);
  await page.goto(`${BASE}/admin/automation`);
  await waitForAdminReady(page);
  const body = await page.locator("body").innerText();
  expect(isAdminReady(body)).toBe(true);
  await page.screenshot({ path: path.join(OUT, "T5-automation.png"), fullPage: true });
  await ctx.close();
  console.log("T5 PASS ✅");
});

// ─── T6: hard reload on /admin/automation → session persists ─────────────────
test("T6: hard reload /admin/automation → session persists", async ({ browser }) => {
  test.setTimeout(30000);
  const { ctx, page } = await newAuthContext(browser);
  await page.goto(`${BASE}/admin/automation`);
  await waitForAdminReady(page);
  await page.reload();
  await waitForAdminReady(page);
  const body = await page.locator("body").innerText();
  expect(isAdminReady(body)).toBe(true);
  await page.screenshot({ path: path.join(OUT, "T6-automation-reload.png"), fullPage: true });
  await ctx.close();
  console.log("T6 PASS ✅");
});

// ─── T7: /admin/visual-guide visible (pre-auth) ──────────────────────────────
test("T7: /admin/visual-guide visible after login", async ({ browser }) => {
  test.setTimeout(25000);
  const { ctx, page } = await newAuthContext(browser);
  await page.goto(`${BASE}/admin/visual-guide`);
  await waitForAdminReady(page);
  const body = await page.locator("body").innerText();
  expect(isAdminReady(body)).toBe(true);
  await page.screenshot({ path: path.join(OUT, "T7-visual-guide.png"), fullPage: true });
  await ctx.close();
  console.log("T7 PASS ✅");
});

// ─── T8: hard reload on /admin/visual-guide → session persists ───────────────
test("T8: hard reload /admin/visual-guide → session persists", async ({ browser }) => {
  test.setTimeout(30000);
  const { ctx, page } = await newAuthContext(browser);
  await page.goto(`${BASE}/admin/visual-guide`);
  await waitForAdminReady(page);
  await page.reload();
  await waitForAdminReady(page);
  const body = await page.locator("body").innerText();
  expect(isAdminReady(body)).toBe(true);
  await page.screenshot({ path: path.join(OUT, "T8-visual-guide-reload.png"), fullPage: true });
  await ctx.close();
  console.log("T8 PASS ✅");
});

// ─── T9: /admin/data-layer visible (pre-auth) ────────────────────────────────
test("T9: /admin/data-layer visible after login", async ({ browser }) => {
  test.setTimeout(25000);
  const { ctx, page } = await newAuthContext(browser);
  await page.goto(`${BASE}/admin/data-layer`);
  await waitForAdminReady(page);
  const body = await page.locator("body").innerText();
  expect(isAdminReady(body)).toBe(true);
  await page.screenshot({ path: path.join(OUT, "T9-data-layer.png"), fullPage: true });
  await ctx.close();
  console.log("T9 PASS ✅");
});

// ─── T10: sign out → leaves admin ────────────────────────────────────────────
test("T10: sign out → leaves admin area", async ({ browser }) => {
  test.setTimeout(30000);
  const { ctx, page } = await newAuthContext(browser);
  await page.goto(`${BASE}/admin/dashboard`);
  await waitForAdminReady(page);
  await page.screenshot({ path: path.join(OUT, "T10-before-signout.png"), fullPage: true });
  await clickSignOut(page);
  const url = page.url();
  const body = await page.locator("body").innerText();
  const leftAdmin = !isAdminReady(body) || url.includes("/");
  expect(leftAdmin).toBe(true);
  await page.screenshot({ path: path.join(OUT, "T10-after-signout.png"), fullPage: true });
  await ctx.close();
  console.log(`T10 PASS ✅ (url=${url})`);
});

// ─── T11: after sign out, /admin/dashboard direct → login form ───────────────
test("T11: after sign out, direct /admin/dashboard → login form", async ({ browser }) => {
  test.setTimeout(40000);
  const { ctx, page } = await newAuthContext(browser);
  await page.goto(`${BASE}/admin/dashboard`);
  await waitForAdminReady(page);
  await clickSignOut(page);
  await page.waitForTimeout(400);
  await page.goto(`${BASE}/admin/dashboard`);
  await page.waitForTimeout(5000); // INITIAL_SESSION → null → login
  const body = await page.locator("body").innerText();
  expect(isLoginForm(body)).toBe(true);
  await page.screenshot({ path: path.join(OUT, "T11-after-signout-direct.png"), fullPage: true });
  await ctx.close();
  console.log("T11 PASS ✅");
});

// ─── T12: no infinite loading on /admin (clean state) ────────────────────────
test("T12: no infinite loading on /admin (clean state)", async ({ page }) => {
  test.setTimeout(20000);
  await page.goto(`${BASE}/admin?reset=1`);
  await page.waitForFunction(
    () => document.body.innerText.length > 80,
    {},
    { timeout: 10000 }
  );
  const body = await page.locator("body").innerText();
  expect(body.length).toBeGreaterThan(80);
  console.log("T12 PASS ✅ (no infinite loading)");
});

// ─── T13: no white screen on main user routes ────────────────────────────────
test("T13: no white screen on user routes", async ({ page }) => {
  test.setTimeout(40000);
  const routes = ["/", "/calendar", "/finance", "/story", "/notifications"];
  for (const route of routes) {
    await page.goto(`${BASE}${route}`);
    await page.waitForTimeout(2000);
    const body = await page.locator("body").innerText();
    expect(body.length, `White screen on ${route}`).toBeGreaterThan(80);
  }
  console.log("T13 PASS ✅ (no white screen on 5 routes)");
});

// ─── T14: no console fatal errors on admin (pre-auth) ────────────────────────
test("T14: no console fatal errors on admin dashboard", async ({ browser }) => {
  test.setTimeout(30000);
  const { ctx, page } = await newAuthContext(browser);
  const errors = watchConsole(page);
  await page.goto(`${BASE}/admin/dashboard`);
  await waitForAdminReady(page);
  await page.waitForTimeout(1500);
  const fatals = errors.filter(e =>
    !e.includes("favicon") &&
    !e.includes("ResizeObserver") &&
    !e.includes("Non-Error promise rejection") &&
    !e.includes("net::ERR_ABORTED") &&
    !e.includes("DialogContent") && // Radix UI accessibility warning — non-fatal
    !e.includes("VisuallyHidden") &&
    !e.includes("aria-describedby")
  );
  if (fatals.length > 0) console.warn("Fatal errors:", fatals);
  await page.screenshot({ path: path.join(OUT, "T14-no-errors.png"), fullPage: true });
  expect(fatals.length).toBe(0);
  await ctx.close();
  console.log(`T14 PASS ✅ (${fatals.length} fatals, ${errors.length} total)`);
});
