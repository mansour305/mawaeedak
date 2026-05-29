/**
 * apiAuth.ts — مواعيدك
 *
 * يربط جلسة Supabase بطلبات الـ API:
 * - getAccessToken: يقرأ access token الحالي من Supabase (أو null)
 * - registerApiAuth: يسجّل getter في api-client لإرفاق Bearer تلقائياً على hooks المولّدة
 * - authedFetch: غلاف fetch يُرفق Authorization تلقائياً للنداءات الخام (gateway/automation/settings)
 *
 * لا يُخزَّن أي توكن — يُقرأ من Supabase عند كل طلب.
 */

import { setAuthTokenGetter } from "@workspace/api-client-react";
import { supabase } from "./supabase";

export async function getAccessToken(): Promise<string | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

export function registerApiAuth(): void {
  setAuthTokenGetter(getAccessToken);
}

export async function authedFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const token = await getAccessToken();
  const headers = new Headers(init.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return fetch(input, { credentials: "include", ...init, headers });
}
