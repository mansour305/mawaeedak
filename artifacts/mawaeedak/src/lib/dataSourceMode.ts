/**
 * dataSourceMode.ts — مواعيدك
 *
 * Feature Flag لتحديد مصدر البيانات.
 *
 * في الإنتاج لا نسمح بفشل صامت، لكن لا نرمي خطأ أثناء import حتى لا تظهر شاشة بيضاء.
 * عند غياب إعدادات البيانات يرجع الوضع error وتتعامل الواجهة معه برسالة مرئية.
 */

export type DataSourceMode = "api" | "supabase_shadow" | "supabase" | "error";

export type DataSourceConfigStatus = {
  rawMode: string | null;
  isProductionRuntime: boolean;
  hasSupabaseConfig: boolean;
  hasApiBaseUrl: boolean;
  usingImplicitProductionSupabase: boolean;
  apiModeRequiresDeployedServer: boolean;
  productionModeError: string | null;
};

const rawMode = import.meta.env.VITE_DATA_SOURCE_MODE as string | undefined;
const isProductionRuntime = import.meta.env.PROD || import.meta.env.NODE_ENV === "production";
const hasSupabaseConfig = Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
const hasApiBaseUrl = Boolean((import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim());

function resolveMode(): { mode: DataSourceMode; error: string | null } {
  if (rawMode === "supabase") return { mode: "supabase", error: null };
  if (rawMode === "supabase_shadow") return { mode: "supabase_shadow", error: null };

  if (rawMode === "api") {
    if (isProductionRuntime && !hasApiBaseUrl && hasSupabaseConfig) {
      console.warn("[DataLayer] Production api mode ignored because API URL is missing. Using Supabase.");
      return { mode: "supabase", error: null };
    }
    if (isProductionRuntime && !hasApiBaseUrl && !hasSupabaseConfig) {
      const error = "[DataLayer] Production error: missing Supabase config and API URL.";
      console.error(error);
      return { mode: "error", error };
    }
    return { mode: "api", error: null };
  }

  if (isProductionRuntime) {
    if (!hasSupabaseConfig && !hasApiBaseUrl) {
      const error = "[DataLayer] Production error: no valid data source configured.";
      console.error(error);
      return { mode: "error", error };
    }
    if (hasSupabaseConfig) return { mode: "supabase", error: null };
    if (hasApiBaseUrl) {
      const error = "[DataLayer] Production warning: using API mode without Supabase.";
      console.warn(error);
      return { mode: "api", error };
    }
  }

  if (hasSupabaseConfig) return { mode: "supabase", error: null };

  return { mode: "api", error: null };
}

const { mode: resolvedMode, error: productionError } = resolveMode();

export const DATA_SOURCE_MODE: DataSourceMode = resolvedMode;
export const DATA_SOURCE_CONFIG_STATUS: DataSourceConfigStatus = {
  rawMode: rawMode ?? null,
  isProductionRuntime,
  hasSupabaseConfig,
  hasApiBaseUrl,
  usingImplicitProductionSupabase: isProductionRuntime && !rawMode && hasSupabaseConfig && DATA_SOURCE_MODE === "supabase",
  apiModeRequiresDeployedServer: DATA_SOURCE_MODE === "api" && isProductionRuntime,
  productionModeError: productionError,
};

export const isApiMode = DATA_SOURCE_MODE === "api";
export const isShadowMode = DATA_SOURCE_MODE === "supabase_shadow";
export const isSupabaseMode = DATA_SOURCE_MODE === "supabase";
export const isErrorMode = DATA_SOURCE_MODE === "error";

if (isProductionRuntime && DATA_SOURCE_MODE === "error") {
  console.error("[Mawaeedak] Production configuration error", DATA_SOURCE_CONFIG_STATUS);
}

if (import.meta.env.DEV) {
  console.info(`[DataLayer] وضع البيانات: ${DATA_SOURCE_MODE}${productionError ? ` (${productionError})` : ""}`);
}

