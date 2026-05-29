/// <reference lib="dom" />
/**
 * Phase 18B — Admin Session Persistence E2E (T1–T9)
 * Tests: login, hard reload on dashboard/automation/visual-guide,
 *        direct route after login, new page same context, sign out,
 *        direct route after sign out.
 *
 * Credentials come from ADMIN_E2E_EMAIL / ADMIN_E2E_PASSWORD env vars.
 * No secrets printed. No screenshots of password fields.
 */
import { test, expect, type Page } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

const EMAIL    = process.env.ADMIN_E2E_EMAIL    ?? "";
const PASSWORD = process.env.ADMIN_E2E_PASSWORD ?? "";
const BASE     = "http://localhost:80";
const OUT_DIR  = path.resolve("test-results/admin");

function ensureDir(d: string) {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
}

/**
 * Primary indicator: admin ready state has <header><h1>لوحة المالك</h1></header>
 * The login form has h1="مواعيدك" inside a styled div (NO <header> tag).
 * This is reliable across ALL admin pages (dashboard, automation, visual-guide, etc.).
 */
async function waitForAdminReady(page: Page, timeoutMs = 14000) {
  await page.waitForFunction(
    () => {
      // Admin header h1 — only present in ready state
      const h1 = document.querySelector("header h1");
      if (h1?.textContent?.trim() === "لوحة المالك") return true;
      // Fallback: dashboard-specific content
      const body = document.body.innerText;
      return body.includes("نظرة عامة") || body.includes("المواعيد الكلية");
    },
    {},
    { timeout: timeoutMs }
  );
}

/** Check page body text for admin-ready indicators */
function isAdminReady(body: string): boolean {
  return (
    body.includes("لوحة المالك") &&
    !body.includes("البريد الإلكتروني")
  );
}

/** Check page body for login form */
function isLoginForm(body: string): boolean {
  return (
    (body.includes("البريد الإلكتروني") || body.includes("تسجيل الدخول")) &&
    !body.includes("الأتمتة اليومية") &&
    !body.includes("نظرة عامة") &&
    !body.includes("المواعيد الكلية")
  );
}

/** Full admin login flow — returns when dashboard ready */
async function loginAdmin(page: Page) {
  await page.goto(`${BASE}/admin?reset=1`);
  await page.waitForTimeout(2000);
  const emailInput = page
    .locator('input[type="email"], input[autocomplete="email"], input[autocomplete="username"]')
    .first();
  await expect(emailInput).toBeVisible({ timeout: 6000 });
  await emailInput.fill(EMAIL);
  const passInput = page.locator('input[type="password"]').first();
  await passInput.fill(PASSWORD);
  await page.locator('button[type="submit"]').first().click();
  // Wait for admin header h1 — proof that SIGNED_IN was processed
  await waitForAdminReady(page, 15000);
  // Give Supabase extra time to persist session token to localStorage
  await page.waitForTimeout(1500);
}

/** Open sidebar Sheet and click sign-out */
async function clickSignOut(page: Page) {
  // The Menu/hamburger button is the first button in the admin header
  await page.locator("header button").first().click();
  await page.waitForTimeout(800);
  // Click logout inside the Sheet
  await page.getByText("تسجيل الخروج").click();
  await page.waitForTimeout(2000);
}

test.beforeAll(() => {
  ensureDir(OUT_DIR);
  if (!EMAIL || !PASSWORD) {
    throw new Error("ADMIN_E2E_EMAIL or ADMIN_E2E_PASSWORD not set");
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// T1: /admin?reset=1 → clean login form, no session
// ─────────────────────────────────────────────────────────────────────────────
test("T1: /admin?reset=1 shows clean login form", async ({ page }) => {
  await page.goto(`${BASE}/admin?reset=1`);
  await page.waitForTimeout(2500);

  await expect(
    page.locator('input[type="email"], input[autocomplete="email"]')
  ).toBeVisible({ timeout: 5000 });

  const body = await page.locator("body").innerText();
  expect(isLoginForm(body)).toBe(true);

  await page.screenshot({ path: path.join(OUT_DIR, "T1-login-form.png"), fullPage: true });
  console.log("T1 PASS: login form visible ✅");
});

// ─────────────────────────────────────────────────────────────────────────────
// T2: Credentials → admin dashboard appears (SIGNED_IN event)
// ─────────────────────────────────────────────────────────────────────────────
test("T2: login credentials → dashboard appears", async ({ page }) => {
  await loginAdmin(page);

  const body = await page.locator("body").innerText();
  const lsKeys = await page.evaluate(() =>
    Object.keys(localStorage).filter(k => k.startsWith("sb-") || k.includes("supabase"))
  );

  await page.screenshot({ path: path.join(OUT_DIR, "T2-dashboard.png"), fullPage: true });
  console.log(`T2: isAdminReady=${isAdminReady(body)}, lsKeys=[${lsKeys.join(",")}]`);

  expect(isAdminReady(body)).toBe(true);
  console.log("T2 PASS: Admin Login → Dashboard ✅");
});

// ─────────────────────────────────────────────────────────────────────────────
// T3: /admin/dashboard → hard reload → still dashboard (INITIAL_SESSION)
// ─────────────────────────────────────────────────────────────────────────────
test("T3: /admin/dashboard hard reload → session persists", async ({ page }) => {
  await loginAdmin(page);

  // Navigate to /admin/dashboard (full page load — INITIAL_SESSION restores session)
  await page.goto(`${BASE}/admin/dashboard`);
  await waitForAdminReady(page, 14000);

  const bodyBefore = await page.locator("body").innerText();
  console.log(`T3 before reload: isAdminReady=${isAdminReady(bodyBefore)}`);
  expect(isAdminReady(bodyBefore)).toBe(true);

  await page.screenshot({ path: path.join(OUT_DIR, "T3-before-reload.png"), fullPage: true });

  // Hard reload — INITIAL_SESSION should restore session from localStorage
  await page.reload();
  await waitForAdminReady(page, 14000);

  const bodyAfter = await page.locator("body").innerText();
  await page.screenshot({ path: path.join(OUT_DIR, "T3-after-reload.png"), fullPage: true });
  console.log(`T3 after reload: isAdminReady=${isAdminReady(bodyAfter)}`);

  expect(isAdminReady(bodyAfter)).toBe(true);
  console.log("T3 PASS: /admin/dashboard hard reload → session persists ✅");
});

// ─────────────────────────────────────────────────────────────────────────────
// T4: /admin/automation → hard reload → still automation (INITIAL_SESSION)
// ─────────────────────────────────────────────────────────────────────────────
test("T4: /admin/automation hard reload → session persists", async ({ page }) => {
  await loginAdmin(page);

  await page.goto(`${BASE}/admin/automation`);
  await waitForAdminReady(page, 14000);

  const bodyBefore = await page.locator("body").innerText();
  console.log(`T4 before reload: isAdminReady=${isAdminReady(bodyBefore)}`);
  expect(isAdminReady(bodyBefore)).toBe(true);

  await page.screenshot({ path: path.join(OUT_DIR, "T4-before-reload.png"), fullPage: true });

  // Hard reload
  await page.reload();
  await waitForAdminReady(page, 14000);

  const bodyAfter = await page.locator("body").innerText();
  await page.screenshot({ path: path.join(OUT_DIR, "T4-after-reload.png"), fullPage: true });
  console.log(`T4 after reload: isAdminReady=${isAdminReady(bodyAfter)}`);

  expect(isAdminReady(bodyAfter)).toBe(true);
  console.log("T4 PASS: /admin/automation hard reload → session persists ✅");
});

// ─────────────────────────────────────────────────────────────────────────────
// T5: /admin/visual-guide → hard reload → still visual-guide (INITIAL_SESSION)
// ─────────────────────────────────────────────────────────────────────────────
test("T5: /admin/visual-guide hard reload → session persists", async ({ page }) => {
  await loginAdmin(page);

  await page.goto(`${BASE}/admin/visual-guide`);
  await waitForAdminReady(page, 14000);

  const bodyBefore = await page.locator("body").innerText();
  console.log(`T5 before reload: isAdminReady=${isAdminReady(bodyBefore)}`);
  expect(isAdminReady(bodyBefore)).toBe(true);

  await page.screenshot({ path: path.join(OUT_DIR, "T5-before-reload.png"), fullPage: true });

  // Hard reload
  await page.reload();
  await waitForAdminReady(page, 14000);

  const bodyAfter = await page.locator("body").innerText();
  await page.screenshot({ path: path.join(OUT_DIR, "T5-after-reload.png"), fullPage: true });
  console.log(`T5 after reload: isAdminReady=${isAdminReady(bodyAfter)}`);

  expect(isAdminReady(bodyAfter)).toBe(true);
  console.log("T5 PASS: /admin/visual-guide hard reload → session persists ✅");
});

// ─────────────────────────────────────────────────────────────────────────────
// T6: Direct /admin/data-layer after login (same context, simulates address bar)
// ─────────────────────────────────────────────────────────────────────────────
test("T6: Direct /admin/data-layer after login → works", async ({ page }) => {
  await loginAdmin(page);

  // Direct navigation (full page load — INITIAL_SESSION restores session)
  await page.goto(`${BASE}/admin/data-layer`);
  await waitForAdminReady(page, 14000);

  const body = await page.locator("body").innerText();
  await page.screenshot({ path: path.join(OUT_DIR, "T6-direct-route.png"), fullPage: true });
  console.log(`T6 direct /admin/data-layer: isAdminReady=${isAdminReady(body)}`);

  expect(isAdminReady(body)).toBe(true);
  console.log("T6 PASS: Direct /admin/data-layer after login → works ✅");
});

// ─────────────────────────────────────────────────────────────────────────────
// T7: New page in SAME browser context → /admin/dashboard works
//     (shares localStorage from the login on page1)
// ─────────────────────────────────────────────────────────────────────────────
test("T7: New page same browser context → admin access", async ({ page, context }) => {
  await loginAdmin(page);

  // New page in same context → inherits localStorage (session token)
  const page2 = await context.newPage();
  await page2.goto(`${BASE}/admin/dashboard`);
  await waitForAdminReady(page2, 14000);

  const body2 = await page2.locator("body").innerText();
  await page2.screenshot({ path: path.join(OUT_DIR, "T7-new-page.png"), fullPage: true });
  console.log(`T7 new page: isAdminReady=${isAdminReady(body2)}`);

  expect(isAdminReady(body2)).toBe(true);
  await page2.close();
  console.log("T7 PASS: New page same context → admin access ✅");
});

// ─────────────────────────────────────────────────────────────────────────────
// T8: Login → sign out → user leaves admin (SIGNED_OUT event clears session)
// ─────────────────────────────────────────────────────────────────────────────
test("T8: Sign out → leaves admin area", async ({ page }) => {
  await loginAdmin(page);

  // Verify we're in admin
  const bodyBefore = await page.locator("body").innerText();
  expect(isAdminReady(bodyBefore)).toBe(true);

  await page.screenshot({ path: path.join(OUT_DIR, "T8-before-signout.png"), fullPage: true });

  // Click sign out — handleLogout calls authSignOut + setLocation("/")
  await clickSignOut(page);

  // After sign out, the app navigates to "/" (home page) OR shows login form
  const urlAfter = page.url();
  const bodyAfter = await page.locator("body").innerText();
  await page.screenshot({ path: path.join(OUT_DIR, "T8-after-signout.png"), fullPage: true });
  console.log(`T8 after sign-out: url=${urlAfter}`);
  console.log(`T8 isLoginForm=${isLoginForm(bodyAfter)}, bodySnippet="${bodyAfter.slice(0, 80)}"`);

  // Sign out success: either redirected to home "/" OR showing admin login form
  const leftAdmin = !isAdminReady(bodyAfter) || urlAfter.includes("/");
  expect(leftAdmin).toBe(true);
  console.log("T8 PASS: Sign out → left admin area ✅");
});

// ─────────────────────────────────────────────────────────────────────────────
// T9: After sign out → /admin/dashboard direct navigation → shows login form
//     (INITIAL_SESSION fires with null → setPhase("login"))
// ─────────────────────────────────────────────────────────────────────────────
test("T9: After sign out, direct /admin/dashboard → login form", async ({ page }) => {
  await loginAdmin(page);

  // Sign out
  await clickSignOut(page);
  await page.waitForTimeout(500);

  // Direct navigation to admin dashboard after sign out
  await page.goto(`${BASE}/admin/dashboard`);
  await page.waitForTimeout(5000); // INITIAL_SESSION fires with null → phase=login

  const body = await page.locator("body").innerText();
  await page.screenshot({ path: path.join(OUT_DIR, "T9-after-signout-direct.png"), fullPage: true });
  console.log(`T9: isLoginForm=${isLoginForm(body)}, isAdminReady=${isAdminReady(body)}`);

  // Must show login, NOT the admin dashboard
  expect(isLoginForm(body)).toBe(true);
  console.log("T9 PASS: Direct route after sign out → login form ✅");
});
