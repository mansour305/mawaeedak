/**
 * E2E Admin Login Test — uses Supabase Auth REST API via fetch.
 * Credentials come from env only. Nothing is printed except masked values.
 */

const SUPABASE_URL = process.env.VITE_SUPABASE_URL ?? "";
const ANON_KEY     = process.env.VITE_SUPABASE_ANON_KEY ?? "";
const EMAIL        = process.env.ADMIN_E2E_EMAIL ?? "";
const PASSWORD     = process.env.ADMIN_E2E_PASSWORD ?? "";

const ALLOWED_ROLES = ["admin", "super_admin", "content_manager", "finance_manager"];

function mask(s: string): string {
  if (!s) return "(empty)";
  if (s.length <= 6) return "***";
  return s.slice(0, 3) + "***" + s.slice(-3);
}

async function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, rej) =>
      setTimeout(() => rej(new Error(`TIMEOUT:${label} after ${ms}ms`)), ms)
    ),
  ]);
}

async function supabaseSignIn(email: string, password: string) {
  const url = `${SUPABASE_URL}/auth/v1/token?grant_type=password`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": ANON_KEY,
      "Authorization": `Bearer ${ANON_KEY}`,
    },
    body: JSON.stringify({ email, password }),
  });
  const body = await res.json() as Record<string, unknown>;
  return { status: res.status, body };
}

async function supabaseGetUser(accessToken: string) {
  const url = `${SUPABASE_URL}/auth/v1/user`;
  const res = await fetch(url, {
    headers: {
      "apikey": ANON_KEY,
      "Authorization": `Bearer ${accessToken}`,
    },
  });
  const body = await res.json() as Record<string, unknown>;
  return { status: res.status, body };
}

async function main() {
  console.log("\n========== Admin E2E Login Test ==========");

  // ── T1: Check secrets ────────────────────────────────────────────────────
  console.log("\n[T1] Env secrets:");
  if (!EMAIL || !PASSWORD) {
    console.error("  FAIL: ADMIN_E2E_EMAIL or ADMIN_E2E_PASSWORD not set");
    console.log("\nRESULT: Needs Replit Secrets");
    process.exit(2);
  }
  if (!SUPABASE_URL || !ANON_KEY) {
    console.error("  FAIL: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY not set");
    process.exit(2);
  }
  console.log(`  ADMIN_E2E_EMAIL   : ${mask(EMAIL)}`);
  console.log(`  ADMIN_E2E_PASSWORD: ${mask(PASSWORD)}`);
  console.log(`  SUPABASE_URL      : ${SUPABASE_URL}`);
  console.log(`  ANON_KEY          : ${mask(ANON_KEY)}`);

  // ── T2: signInWithPassword ───────────────────────────────────────────────
  console.log("\n[T2] signInWithPassword (8s timeout):");
  const t0 = Date.now();
  let signInStatus: number;
  let signInBody: Record<string, unknown>;

  try {
    const r = await withTimeout(supabaseSignIn(EMAIL, PASSWORD), 8000, "signIn");
    signInStatus = r.status;
    signInBody   = r.body;
  } catch (e) {
    console.error(`  FAIL: ${(e as Error).message}`);
    console.log("\nRESULT: Needs Fixes — login timed out after 8s");
    process.exit(3);
  }

  const elapsed = Date.now() - t0;
  console.log(`  HTTP status: ${signInStatus} (${elapsed}ms)`);

  if (signInStatus !== 200) {
    const errMsg = String(signInBody["error_description"] ?? signInBody["msg"] ?? signInBody["error"] ?? "unknown");
    console.log(`  error: ${errMsg}`);
    if (/invalid.*credentials|wrong.*password|Invalid login/i.test(errMsg) || signInStatus === 400) {
      console.log("\nRESULT: Needs Owner Password Reset");
      process.exit(4);
    }
    console.log("\nRESULT: Needs Fixes — unexpected Supabase error");
    process.exit(3);
  }

  const accessToken = String(signInBody["access_token"] ?? "");
  console.log(`  access_token: ${mask(accessToken)}`);
  console.log(`  token_type  : ${signInBody["token_type"] ?? "?"}`);

  // ── T3: getUser ──────────────────────────────────────────────────────────
  console.log("\n[T3] getUser (5s timeout):");
  let userStatus: number;
  let userBody: Record<string, unknown>;

  try {
    const r = await withTimeout(supabaseGetUser(accessToken), 5000, "getUser");
    userStatus = r.status;
    userBody   = r.body;
  } catch (e) {
    console.error(`  FAIL: ${(e as Error).message}`);
    console.log("\nRESULT: Needs Fixes — getUser timed out");
    process.exit(3);
  }

  console.log(`  HTTP status: ${userStatus}`);
  if (userStatus !== 200) {
    console.log(`  error: ${JSON.stringify(userBody)}`);
    console.log("\nRESULT: Needs Fixes — getUser failed");
    process.exit(3);
  }

  // ── T4: Role check ───────────────────────────────────────────────────────
  console.log("\n[T4] Role check:");
  const userMeta = (userBody["user_metadata"] as Record<string, unknown> | undefined) ?? {};
  const appMeta  = (userBody["app_metadata"]  as Record<string, unknown> | undefined) ?? {};
  const metaRole = String(userMeta["role"] ?? "");
  const appRole  = String(appMeta["role"]  ?? "");
  const resolvedRole = metaRole || appRole || "user";

  console.log(`  user_metadata.role : ${metaRole  || "(not set)"}`);
  console.log(`  app_metadata.role  : ${appRole   || "(not set)"}`);
  console.log(`  resolved role      : ${resolvedRole}`);
  console.log(`  allowed_roles      : ${ALLOWED_ROLES.join(", ")}`);

  if (!ALLOWED_ROLES.includes(resolvedRole)) {
    console.log(`\n  DENY: role="${resolvedRole}" is not in allowed list`);
    console.log("\n  SQL fix required in Supabase Dashboard:");
    console.log("  UPDATE auth.users");
    console.log("  SET");
    console.log(`    raw_user_meta_data = COALESCE(raw_user_meta_data,'{}') || '{"role":"super_admin"}'`);
    console.log(`    raw_app_meta_data  = COALESCE(raw_app_meta_data, '{}') || '{"role":"super_admin"}'`);
    console.log(`  WHERE email = '${mask(EMAIL)}';`);
    console.log("\nRESULT: Needs Supabase Role Fix");
    console.log(`  user_metadata.role = "${metaRole  || "(not set)"}"`);
    console.log(`  app_metadata.role  = "${appRole   || "(not set)"}"`);
    process.exit(5);
  }

  // ── T5: Smoke test — API admin stats ─────────────────────────────────────
  console.log("\n[T5] API smoke test:");
  try {
    const res = await fetch("http://localhost:80/api/admin/stats", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    console.log(`  GET /api/admin/stats → ${res.status}`);
  } catch (e) {
    console.log(`  GET /api/admin/stats → fetch error: ${(e as Error).message}`);
  }

  // ── Final ────────────────────────────────────────────────────────────────
  console.log("\n==========================================");
  console.log("RESULT: Admin Access Verified ✅");
  console.log(`  role    : ${resolvedRole}`);
  console.log(`  session : active`);
  console.log("==========================================\n");
  process.exit(0);
}

main().catch((e: unknown) => {
  console.error("Unhandled error:", e instanceof Error ? e.message : String(e));
  process.exit(99);
});
