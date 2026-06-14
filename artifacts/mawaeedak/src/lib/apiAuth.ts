/**
 * apiAuth.ts — مواعيدك
 *
 * يربط جلسة Supabase بطلبات الـ API:
 * - getAccessToken: يقرأ access token الحالي من Supabase (أو null)
 * - registerApiAuth: يسجّل getter في api-client لإرفاق Bearer تلقائياً على hooks المولّدة
 * - authedFetch: غلاف fetch يُرفق Authorization تلقائياً للنداءات الخام (gateway/automation/settings)
 * - authedFetchWithTimeout: fetch مع timeout و AbortController
 *
 * SECURITY: لا يُخزَّن أي توكن — يُقرأ من Supabase عند كل طلب.
 */

import { setAuthTokenGetter, setBaseUrl } from "./api-client";
import { supabase } from "./supabase";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

// Default timeout for API requests (10 seconds)
const DEFAULT_TIMEOUT_MS = 10000;

function normalizeApiBaseUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim().replace(/\/+$/, "");
  return trimmed.length > 0 ? trimmed : null;
}

export async function getAccessToken(): Promise<string | null> {
  if (!supabase) return null;
  try {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  } catch {
    return null;
  }
}

export function registerApiAuth(): void {
  setBaseUrl(normalizeApiBaseUrl(apiBaseUrl));
  setAuthTokenGetter(getAccessToken);
}

export async function authedFetch(
  input: string,
  init: RequestInit = {},
  options: { timeoutMs?: number; signal?: AbortSignal } = {}
): Promise<Response> {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, signal } = options;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const token = await getAccessToken();
    const headers = new Headers(init.headers);
    const baseUrl = normalizeApiBaseUrl(apiBaseUrl);
    const requestUrl = baseUrl && input.startsWith("/") ? `${baseUrl}${input}` : input;
    
    if (token) headers.set("Authorization", `Bearer ${token}`);
    
    // Combine external signal with timeout signal
    const combinedSignal = signal 
      ? (() => { 
          const combined = new AbortController(); 
          signal.addEventListener('abort', () => combined.abort());
          controller.signal.addEventListener('abort', () => combined.abort());
          return combined.signal;
        })()
      : controller.signal;
    
    const response = await fetch(requestUrl, { 
      credentials: "include", 
      ...init, 
      headers,
      signal: combinedSignal,
    });
    
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timed out after ${timeoutMs}ms`);
    }
    throw error;
  }
}

// Legacy export for backwards compatibility
export { authedFetch as fetchWithAuth };

