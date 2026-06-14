/**
 * validation.ts — نظام الجودة والتحقق
 * 
 * يتضمن:
 * - Build Validation
 * - Route Validation
 * - Import Validation
 * - Dependency Check
 */

import { logger } from "./logger";
import { configManager } from "./config";

// ============================================================================
// Types
// ============================================================================

export interface ValidationResult {
  passed: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  type: string;
  message: string;
  file?: string;
  line?: number;
}

export interface ValidationWarning {
  type: string;
  message: string;
  file?: string;
}

// ============================================================================
// Build Validation
// ============================================================================

export function validateBuild(): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  
  // 1. فحص Supabase
  const supabase = configManager.getValue("supabase");
  if (!supabase.enabled && configManager.isProduction()) {
    errors.push({
      type: "MISSING_SUPABASE",
      message: "Supabase غير مهيأ في بيئة الإنتاج",
    });
  }
  
  // 2. فحص API URL
  const api = configManager.getValue("api");
  if (!api.baseUrl && configManager.isProduction()) {
    warnings.push({
      type: "MISSING_API_URL",
      message: "API URL غير محدد في الإنتاج",
    });
  }
  
  // 3. فحص الميزات المعطّلة
  const features = configManager.getFeatures();
  const criticalFeatures = ["homePage", "login", "signup"];
  const disabledCritical = criticalFeatures.filter(
    (f) => features[f] === false
  );
  
  if (disabledCritical.length > 0) {
    errors.push({
      type: "DISABLED_FEATURES",
      message: `ميزات أساسية معطّلة: ${disabledCritical.join(", ")}`,
    });
  }
  
  // 4. فحص وضع التصحيح
  if (features.debugMode && configManager.isProduction()) {
    errors.push({
      type: "PRODUCTION_DIAGNOSTICS_ENABLED",
      message: "وضع التصحيح مفعّل في بيئة الإنتاج",
    });
  }
  
  // 5. فحص SSL
  if (typeof window !== "undefined" && !window.location.protocol.includes("https")) {
    if (configManager.isProduction()) {
      warnings.push({
        type: "NO_HTTPS",
        message: "التطبيق لا يستخدم HTTPS في الإنتاج",
      });
    }
  }
  
  return {
    passed: errors.length === 0,
    errors,
    warnings,
  };
}

// ============================================================================
// Route Validation
// ============================================================================

export interface RouteInfo {
  path: string;
  component: string;
  guards?: string[];
  isProtected: boolean;
}

const VALID_ROUTES: RouteInfo[] = [
  { path: "/", component: "HomePage", isProtected: false },
  { path: "/welcome", component: "WelcomePage", isProtected: false },
  { path: "/auth", component: "AuthPage", isProtected: false },
  { path: "/calendar", component: "CalendarPage", isProtected: true },
  { path: "/finance", component: "FinancePage", isProtected: true },
  { path: "/centers", component: "CentersPage", isProtected: true },
  { path: "/account", component: "AccountPage", isProtected: true },
  { path: "/story", component: "StoryPage", isProtected: true },
  { path: "/daily-card", component: "DailyCardPage", isProtected: false },
  { path: "/notifications", component: "NotificationsPage", isProtected: true },
  { path: "/splash", component: "SplashScreen", isProtected: false },
  { path: "/privacy", component: "PrivacyPage", isProtected: false },
  { path: "/terms", component: "TermsPage", isProtected: false },
  { path: "/support", component: "SupportPage", isProtected: false },
  // Admin Routes
  { path: "/admin", component: "AdminLayout", isProtected: true, guards: ["admin"] },
  { path: "/admin/dashboard", component: "AdminDashboard", isProtected: true, guards: ["admin"] },
  { path: "/admin/messages", component: "AdminMessages", isProtected: true, guards: ["admin"] },
  { path: "/admin/events", component: "AdminEvents", isProtected: true, guards: ["admin"] },
  { path: "/admin/financial", component: "AdminFinancial", isProtected: true, guards: ["admin"] },
  { path: "/admin/members", component: "AdminMembers", isProtected: true, guards: ["admin"] },
  { path: "/admin/settings", component: "AdminSettings", isProtected: true, guards: ["admin"] },
];

export function validateRoutes(definedRoutes: string[]): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  
  const definedSet = new Set(definedRoutes);
  
  // فحص المسارات المعرفة
  VALID_ROUTES.forEach((route) => {
    if (!definedSet.has(route.path)) {
      warnings.push({
        type: "MISSING_ROUTE",
        message: `مسار غير مضاف: ${route.path} -> ${route.component}`,
      });
    }
  });
  
  // فحص المسارات الإضافية
  definedRoutes.forEach((route) => {
    if (!VALID_ROUTES.find((r) => r.path === route)) {
      warnings.push({
        type: "UNKNOWN_ROUTE",
        message: `مسار غير معروف في القائمة: ${route}`,
      });
    }
  });
  
  return {
    passed: errors.length === 0,
    errors,
    warnings,
  };
}

// ============================================================================
// Import Validation
// ============================================================================

interface ImportInfo {
  from: string;
  to: string;
  isValid: boolean;
}

export function validateImports(imports: ImportInfo[]): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  
  imports.forEach((imp) => {
    if (!imp.isValid) {
      errors.push({
        type: "INVALID_IMPORT",
        message: `استيراد غير صالح: ${imp.from} -> ${imp.to}`,
      });
    }
  });
  
  return {
    passed: errors.length === 0,
    errors,
    warnings,
  };
}

// ============================================================================
// Dependency Validation
// ============================================================================

interface DependencyCheck {
  name: string;
  version: string;
  required: boolean;
  installed: boolean;
}

const REQUIRED_DEPENDENCIES = [
  "react",
  "react-dom",
  "wouter",
  "@tanstack/react-query",
  "@supabase/supabase-js",
];

export function validateDependencies(
  installed: Record<string, string>
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  
  const installedSet = new Set(Object.keys(installed));
  
  REQUIRED_DEPENDENCIES.forEach((dep) => {
    if (!installedSet.has(dep)) {
      errors.push({
        type: "MISSING_DEPENDENCY",
        message: `تبعية مطلوبة غير موجودة: ${dep}`,
      });
    }
  });
  
  return {
    passed: errors.length === 0,
    errors,
    warnings,
  };
}

// ============================================================================
// Asset Validation
// ============================================================================

export function validateAssets(): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  
  // فحص الأيقونات
  const requiredIcons = ["favicon.svg", "manifest.json"];
  
  requiredIcons.forEach((icon) => {
    const exists = document.querySelector(`link[href*="${icon}"]`) !== null;
    if (!exists) {
      warnings.push({
        type: "MISSING_ASSET",
        message: `أداة مطلوبة غير موجودة: ${icon}`,
      });
    }
  });
  
  // فحص الخطوط
  const fonts = document.querySelectorAll('link[href*="fonts.googleapis.com"]');
  if (fonts.length === 0) {
    warnings.push({
      type: "MISSING_FONTS",
      message: "لم يتم تحميل أي خطوط",
    });
  }
  
  return {
    passed: errors.length === 0,
    errors,
    warnings,
  };
}

// ============================================================================
// Accessibility Validation
// ============================================================================

export function validateAccessibility(): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  
  if (typeof document === "undefined") {
    return { passed: true, errors: [], warnings: [] };
  }
  
  // فحص لغة الصفحة
  const html = document.querySelector("html");
  if (!html?.getAttribute("lang")) {
    errors.push({
      type: "MISSING_LANG",
      message: "لغة الصفحة غير محددة",
    });
  }
  
  // فحص اتجاه النص RTL
  if (!html?.getAttribute("dir")) {
    warnings.push({
      type: "MISSING_DIR",
      message: "اتجاه النص غير محدد",
    });
  }
  
  // فحص meta tags
  const requiredMeta = ["description", "viewport"];
  requiredMeta.forEach((meta) => {
    const exists = document.querySelector(`meta[name="${meta}"]`) !== null;
    if (!exists) {
      warnings.push({
        type: "MISSING_META",
        message: `Meta tag مطلوب: ${meta}`,
      });
    }
  });
  
  // فحص title
  const title = document.querySelector("title");
  if (!title?.textContent) {
    errors.push({
      type: "MISSING_TITLE",
      message: "عنوان الصفحة غير موجود",
    });
  }
  
  return {
    passed: errors.length === 0,
    errors,
    warnings,
  };
}

// ============================================================================
// Combined Validation
// ============================================================================

export async function runFullValidation(): Promise<ValidationResult> {
  const allErrors: ValidationError[] = [];
  const allWarnings: ValidationWarning[] = [];
  
  // Build
  const buildResult = validateBuild();
  allErrors.push(...buildResult.errors);
  allWarnings.push(...buildResult.warnings);
  
  // Assets
  const assetsResult = validateAssets();
  allErrors.push(...assetsResult.errors);
  allWarnings.push(...assetsResult.warnings);
  
  // Accessibility
  const a11yResult = validateAccessibility();
  allErrors.push(...a11yResult.errors);
  allWarnings.push(...a11yResult.warnings);
  
  logger.info("[Validation] Full validation complete", {
    errors: allErrors.length,
    warnings: allWarnings.length,
  });
  
  return {
    passed: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings,
  };
}

// ============================================================================
// Export
// ============================================================================

export const validation = {
  validateBuild,
  validateRoutes,
  validateImports,
  validateDependencies,
  validateAssets,
  validateAccessibility,
  runFullValidation,
  VALID_ROUTES,
};

