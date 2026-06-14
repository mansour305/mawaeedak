const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const ignoredDirs = new Set([".git", "node_modules", "dist", "build", ".turbo", ".next"]);

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ignoredDirs.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, files);
    } else {
      files.push(full);
    }
  }
  return files;
}

function rel(file) {
  return path.relative(root, file).replace(/\\/g, "/");
}

function fail(message, matches = []) {
  console.error(`launch-gate-checks: ${message}`);
  for (const match of matches.slice(0, 25)) {
    console.error(` - ${match}`);
  }
  process.exitCode = 1;
}

const allFiles = walk(root);
const packageLocks = allFiles.filter((file) => path.basename(file) === "package-lock.json").map(rel);
if (packageLocks.length > 0) fail("package-lock.json must not be committed", packageLocks);

const scanned = allFiles.filter((file) => {
  const relative = rel(file);
  return (
    /\.(ts|tsx|js|jsx|cjs|mjs|sql|json|yml|yaml|md)$/.test(relative) &&
    !relative.includes("/api-client/generated/") &&
    !relative.startsWith("docs/archive/")
  );
});

const methodThree = [];
const prayerTimes = [];
const fakeSecrets = [];

for (const file of scanned) {
  const text = fs.readFileSync(file, "utf8");
  const relative = rel(file);

  if (/method\s*=\s*3|method\s*[:]\s*3|\bmethod\(["']?3["']?\)/i.test(text)) {
    methodThree.push(relative);
  }

  if (/(fajr|dhuhr|asr|maghrib|isha)\s*[:=]\s*["'`]\d{1,2}:\d{2}/i.test(text)) {
    prayerTimes.push(relative);
  }

  if (
    /-----BEGIN (?:RSA |OPENSSH |EC |)PRIVATE KEY-----/.test(text) ||
    /\bsk-(?:proj-)?[A-Za-z0-9_-]{20,}\b/.test(text) ||
    /SUPABASE_SERVICE_ROLE_KEY\s*=\s*(?!<|your_|replace|example|changeme|not-set|xxx|test|dummy|placeholder)[^\s#"'`]{12,}/i.test(text)
  ) {
    fakeSecrets.push(relative);
  }
}

if (methodThree.length > 0) fail("AlAdhan method 3 is not allowed", methodThree);
if (prayerTimes.length > 0) fail("hardcoded prayer time literals are not allowed", prayerTimes);
if (fakeSecrets.length > 0) fail("real-looking secrets must not be committed", fakeSecrets);

if (!process.exitCode) {
  console.log("launch-gate-checks: passed");
}

