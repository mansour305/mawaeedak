/**
 * config.ts — نظام الإعدادات الديناميكية
 * 
 * يتضمن:
 * - Feature Flags
 * - Dynamic Config
 * - Feature Toggle
 * - Runtime Configuration
 */

import { secureStorage } from "./security";
import { logger } from "./logger";

// ============================================================================
// Types
// ============================================================================

export interface FeatureFlag {
  key: string;
  enabled: boolean;
  description?: string;
  metadata?: Record<string, unknown>;
}

export interface AppConfig {
  appName: string;
  version: string;
  environment: "development" | "staging" | "production";
  features: Record<string, boolean>;
  api: {
    baseUrl: string | null;
    timeout: number;
    retryAttempts: number;
  };
  supabase: {
    url: string | null;
    anonKey: string | null;
    enabled: boolean;
  };
  maintenance: {
    enabled: boolean;
    message?: string;
    allowedIPs?: string[];
  };
}

// ============================================================================
// Default Configuration
// ============================================================================

const DEFAULT_CONFIG: AppConfig = {
  appName: "مواعيدك",
  version: "1.0.0",
  environment: import.meta.env.PROD ? "production" : "development",
  features: {
    // Auth
    login: true,
    signup: true,
    socialLogin: false,
    passwordReset: true,
    
    // Core Features
    homePage: true,
    calendar: true,
    finance: true,
    centers: true,
    notificationsEnabled: true,
    story: true,
    dailyCard: true,
    
    // Admin
    adminPanel: true,
    adminDashboard: true,
    adminMessages: true,
    adminEvents: true,
    adminFinancial: true,
    adminMembers: true,
    adminReports: true,
    adminSettings: true,
    adminThemes: true,
    adminNotifications: true,
    
    // Advanced
    rtlSupport: true,
    darkMode: true,
    notifications: true,
    offlineMode: true,
    
    // Debug (production = false)
    debugMode: !import.meta.env.PROD,
    showPerformanceMetrics: !import.meta.env.PROD,
  },
  api: {
    baseUrl: (import.meta.env.VITE_API_BASE_URL as string) || null,
    timeout: 30000,
    retryAttempts: 3,
  },
  supabase: {
    url: (import.meta.env.VITE_SUPABASE_URL as string) || null,
    anonKey: (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || null,
    enabled: Boolean(
      import.meta.env.VITE_SUPABASE_URL &&
      import.meta.env.VITE_SUPABASE_ANON_KEY
    ),
  },
  maintenance: {
    enabled: false,
  },
};

// ============================================================================
// Configuration Manager
// ============================================================================

class ConfigManager {
  private config: AppConfig;
  private listeners: Set<(config: AppConfig) => void> = new Set();
  
  constructor() {
    this.config = this.loadConfig();
  }
  
  /**
   * الحصول على الإعدادات
   */
  get(): AppConfig {
    return { ...this.config };
  }
  
  /**
   * الحصول على قيمة معينة
   */
  getValue<K extends keyof AppConfig>(key: K): AppConfig[K] {
    return this.config[key];
  }
  
  /**
   * تحديث الإعدادات جزئياً
   */
  update(updates: Partial<AppConfig>): void {
    this.config = { ...this.config, ...updates };
    this.saveConfig();
    this.notifyListeners();
  }
  
  /**
   * فحص ميزة معينة
   */
  isFeatureEnabled(feature: string): boolean {
    return this.config.features[feature] ?? false;
  }
  
  /**
   * تفعيل/تعطيل ميزة
   */
  setFeature(feature: string, enabled: boolean): void {
    this.config.features = {
      ...this.config.features,
      [feature]: enabled,
    };
    this.saveConfig();
    this.notifyListeners();
  }
  
  /**
   * الحصول على جميع الميزات
   */
  getFeatures(): Record<string, boolean> {
    return { ...this.config.features };
  }
  
  /**
   * فحص بيئة الإنتاج
   */
  isProduction(): boolean {
    return this.config.environment === "production";
  }
  
  /**
   * فحص بيئة التطوير
   */
  isDevelopment(): boolean {
    return this.config.environment === "development";
  }
  
  /**
   * فحص وضع الصيانة
   */
  isMaintenanceMode(): boolean {
    return this.config.maintenance.enabled;
  }
  
  /**
   * إضافة مستمع للتغييرات
   */
  addListener(callback: (config: AppConfig) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }
  
  // ============================================================================
  // Private Methods
  // ============================================================================
  
  private loadConfig(): AppConfig {
    try {
      const stored = secureStorage.get<AppConfig>("config");
      if (stored) {
        return { ...DEFAULT_CONFIG, ...stored };
      }
    } catch (error) {
      logger.warn("Failed to load config from storage", { error });
    }
    return { ...DEFAULT_CONFIG };
  }
  
  private saveConfig(): void {
    try {
      secureStorage.set("config", this.config);
    } catch (error) {
      logger.warn("Failed to save config to storage", { error });
    }
  }
  
  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.config));
  }
  
  /**
   * إعادة تعيين الإعدادات الافتراضية
   */
  reset(): void {
    this.config = { ...DEFAULT_CONFIG };
    this.saveConfig();
    this.notifyListeners();
  }
}

export const configManager = new ConfigManager();

// ============================================================================
// Feature Flag Hook
// ============================================================================

import { useState, useEffect } from "react";

export function useFeatureFlag(feature: string): boolean {
  const [enabled, setEnabled] = useState(
    configManager.isFeatureEnabled(feature)
  );
  
  useEffect(() => {
    return configManager.addListener(() => {
      setEnabled(configManager.isFeatureEnabled(feature));
    });
  }, [feature]);
  
  return enabled;
}

// ============================================================================
// Environment Validation
// ============================================================================

export function validateEnvironment(): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Supabase
  if (!configManager.getValue("supabase").enabled) {
    if (configManager.isProduction()) {
      errors.push("Supabase غير مهيأ في بيئة الإنتاج");
    } else {
      warnings.push("Supabase غير مهيأ - وضع تجريبي");
    }
  }
  
  // API
  if (!configManager.getValue("api").baseUrl) {
    warnings.push("API URL غير محدد");
  }
  
  // Maintenance
  if (configManager.isMaintenanceMode() && configManager.isProduction()) {
    warnings.push("وضع الصيانة مفعّل في الإنتاج");
  }
  
  // Debug mode
  if (configManager.isFeatureEnabled("debugMode") && configManager.isProduction()) {
    errors.push("وضع التصحيح مفعّل في الإنتاج");
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

// ============================================================================
// Production Readiness Check
// ============================================================================

export async function checkProductionReadiness(): Promise<{
  ready: boolean;
  checks: Array<{
    name: string;
    status: "pass" | "fail" | "warn";
    message?: string;
  }>;
}> {
  const checks: Array<{
    name: string;
    status: "pass" | "fail" | "warn";
    message?: string;
  }> = [];
  
  // 1. Supabase Check
  const supabase = configManager.getValue("supabase");
  checks.push({
    name: "Supabase",
    status: supabase.enabled ? "pass" : "fail",
    message: supabase.enabled
      ? "Supabase مهيأ"
      : "Supabase غير مهيأ - مطلوب للإنتاج",
  });
  
  // 2. Environment Check
  const envValidation = validateEnvironment();
  checks.push({
    name: "Environment",
    status: envValidation.valid ? "pass" : "warn",
    message: envValidation.errors.join(", ") || "الإعدادات صحيحة",
  });
  
  // 3. Network Check
  try {
    const response = await fetch("/api/health", {
      method: "GET",
      signal: AbortSignal.timeout(5000),
    });
    checks.push({
      name: "Network",
      status: response.ok ? "pass" : "warn",
      message: response.ok ? "الشبكة تعمل" : `HTTP ${response.status}`,
    });
  } catch {
    checks.push({
      name: "Network",
      status: "warn",
      message: "فشل فحص الشبكة",
    });
  }
  
  // 4. Features Check
  const features = configManager.getFeatures();
  const disabledFeatures = Object.entries(features)
    .filter(([, enabled]) => !enabled)
    .map(([name]) => name);
  
  checks.push({
    name: "Features",
    status: disabledFeatures.length > 0 ? "warn" : "pass",
    message: disabledFeatures.length > 0
      ? `${disabledFeatures.length} ميزات معطّلة`
      : "جميع الميزات مهيأة",
  });
  
  // 5. Maintenance Check
  checks.push({
    name: "Maintenance",
    status: configManager.isMaintenanceMode() ? "warn" : "pass",
    message: configManager.isMaintenanceMode()
      ? "وضع الصيانة مفعّل"
      : "التطبيق يعمل بشكل طبيعي",
  });
  
  const ready = checks.every((c) => c.status !== "fail");
  
  return { ready, checks };
}

// ============================================================================
// Export
// ============================================================================

export const config = {
  manager: configManager,
  validateEnvironment,
  checkProductionReadiness,
  useFeatureFlag,
};
