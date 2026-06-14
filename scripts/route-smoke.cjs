const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const appPath = path.join(root, "artifacts", "mawaeedak", "src", "App.tsx");
const app = fs.readFileSync(appPath, "utf8");

const requiredRoutes = [
  "/",
  "/splash",
  "/welcome",
  "/calendar",
  "/finance",
  "/salaries",
  "/centers",
  "/services",
  "/services/goals",
  "/services/costs",
  "/services/reminders",
  "/notifications",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/auth/callback",
  "/more",
  "/admin",
  "/admin/:rest*",
];

const missingRoutes = requiredRoutes.filter((route) => !app.includes(`path="${route}"`));
if (missingRoutes.length > 0) {
  console.error("route-smoke: missing routes");
  for (const route of missingRoutes) console.error(` - ${route}`);
  process.exit(1);
}

const requiredFiles = [
  "src/features/home/HomePage.tsx",
  "src/features/calendar/CalendarPage.tsx",
  "src/features/finance/FinancePage.tsx",
  "src/features/centers/CentersPage.tsx",
  "src/features/services/GoalsPage.tsx",
  "src/features/services/CostsPage.tsx",
  "src/features/services/RemindersPage.tsx",
  "src/features/notifications/NotificationsPage.tsx",
  "src/features/admin/AdminRuntimeBoundary.tsx",
  "src/features/admin/AdminComplaints.tsx",
  "src/features/admin/AdminMembers.tsx",
  "src/features/admin/AdminPermissions.tsx",
  "src/pages/SplashScreen.tsx",
  "src/pages/AuthCallbackPage.tsx",
];

const missingFiles = requiredFiles.filter((file) => !fs.existsSync(path.join(root, "artifacts", "mawaeedak", file)));
if (missingFiles.length > 0) {
  console.error("route-smoke: missing route component files");
  for (const file of missingFiles) console.error(` - ${file}`);
  process.exit(1);
}

console.log("route-smoke: passed");

