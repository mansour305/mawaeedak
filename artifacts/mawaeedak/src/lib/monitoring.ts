/**
 * monitoring.ts — نظام المراقبة والتنبيهات
 * 
 * يتضمن:
 * - Health Monitoring
 * - Error Tracking
 * - Performance Monitoring
 * - API Monitoring
 * - Security Event Logging
 */

import { logger } from "./logger";

// ============================================================================
// Types
// ============================================================================

export interface HealthStatus {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: number;
  checks: Record<string, HealthCheck>;
}

export interface HealthCheck {
  status: "pass" | "fail" | "warn";
  latency?: number;
  error?: string;
}

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
}

export interface ErrorEvent {
  type: string;
  message: string;
  stack?: string;
  componentStack?: string;
  timestamp: number;
  userId?: string;
  metadata?: Record<string, unknown>;
}

// ============================================================================
// Health Monitoring
// ============================================================================

class HealthMonitor {
  private checks: Map<string, () => Promise<HealthCheck>> = new Map();
  private lastStatus: HealthStatus | null = null;
  
  registerCheck(name: string, check: () => Promise<HealthCheck>): void {
    this.checks.set(name, check);
  }
  
  async checkHealth(): Promise<HealthStatus> {
    const results: Record<string, HealthCheck> = {};
    let hasFail = false;
    let hasWarn = false;
    
    const checkPromises = Array.from(this.checks.entries()).map(
      async ([name, checkFn]) => {
        const start = performance.now();
        try {
          const result = await checkFn();
          result.latency = performance.now() - start;
          results[name] = result;
          if (result.status === "fail") hasFail = true;
          if (result.status === "warn") hasWarn = true;
        } catch (error) {
          results[name] = {
            status: "fail",
            error: error instanceof Error ? error.message : "Unknown error",
            latency: performance.now() - start,
          };
          hasFail = true;
        }
      }
    );
    
    await Promise.all(checkPromises);
    
    this.lastStatus = {
      status: hasFail ? "unhealthy" : hasWarn ? "degraded" : "healthy",
      timestamp: Date.now(),
      checks: results,
    };
    
    return this.lastStatus;
  }
  
  getLastStatus(): HealthStatus | null {
    return this.lastStatus;
  }
  
  /**
   * تسجيل فحص Supabase
   */
  registerSupabaseCheck(supabase: unknown, name: string = "supabase"): void {
    this.registerCheck(name, async () => {
      try {
        const response = await fetch(
          (supabase as { supabaseUrl: string }).supabaseUrl + "/health",
          { method: "GET" }
        );
        if (response.ok) {
          return { status: "pass" };
        }
        return { status: "fail", error: `HTTP ${response.status}` };
      } catch (error) {
        return {
          status: "fail",
          error: error instanceof Error ? error.message : "Connection failed",
        };
      }
    });
  }
  
  /**
   * تسجيل فحص الشبكة
   */
  registerNetworkCheck(): void {
    this.registerCheck("network", async () => {
      if (!navigator.onLine) {
        return { status: "fail", error: "Offline" };
      }
      return { status: "pass" };
    });
  }
  
  /**
   * تسجيل فحص API
   */
  registerAPICheck(apiUrl: string | null): void {
    if (!apiUrl) return;
    
    this.registerCheck("api", async () => {
      try {
        const start = performance.now();
        const response = await fetch(`${apiUrl}/health`, {
          method: "GET",
          signal: AbortSignal.timeout(5000),
        });
        const latency = performance.now() - start;
        
        if (response.ok) {
          return { status: "pass", latency };
        }
        return { status: "warn", error: `HTTP ${response.status}`, latency };
      } catch (error) {
        return {
          status: "fail",
          error: error instanceof Error ? error.message : "API unreachable",
        };
      }
    });
  }
}

export const healthMonitor = new HealthMonitor();

// ============================================================================
// Performance Monitoring
// ============================================================================

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private maxMetrics = 100;
  
  /**
   * قياس أداء دالة
   */
  async measure<T>(
    name: string,
    fn: () => T | Promise<T>
  ): Promise<T> {
    const start = performance.now();
    try {
      const result = await fn();
      this.record(name, performance.now() - start, "ms");
      return result;
    } catch (error) {
      this.record(name, performance.now() - start, "ms", true);
      throw error;
    }
  }
  
  /**
   * تسجيل مقياس
   */
  record(name: string, value: number, unit: string = "", isError?: boolean): void {
    this.metrics.push({
      name,
      value,
      unit,
      timestamp: Date.now(),
    });
    
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }
    
    logger.debug(`[Performance] ${name}: ${value}${unit}${isError ? ' [ERROR]' : ''}`);
  }
  
  /**
   * قياس Largest Contentful Paint
   */
  measureLCP(): void {
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.record("LCP", lastEntry.startTime, "ms");
    }).observe({ entryTypes: ["largest-contentful-paint"] });
  }
  
  /**
   * قياس First Input Delay
   */
  measureFID(): void {
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const typedEntry = entry as PerformanceEventTiming;
        this.record("FID", typedEntry.processingStart - typedEntry.startTime, "ms");
      }
    }).observe({ entryTypes: ["first-input"] });
  }
  
  /**
   * قياس Cumulative Layout Shift
   */
  measureCLS(): void {
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const typedEntry = entry as PerformanceEntry & { hadRecentInput?: boolean; value: number };
        if ("hadRecentInput" in typedEntry && !typedEntry.hadRecentInput) {
          this.record("CLS", typedEntry.value, "");
        }
      }
    }).observe({ entryTypes: ["layout-shift"] });
  }
  
  /**
   * قياس Web Vitals
   */
  measureWebVitals(): void {
    this.measureLCP();
    this.measureFID();
    this.measureCLS();
  }
  
  /**
   * الحصول على آخر مقياس
   */
  getMetric(name: string): PerformanceMetric | undefined {
    return this.metrics.find((m) => m.name === name);
  }
  
  /**
   * الحصول على جميع المقاييس
   */
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }
  
  /**
   * مسح المقاييس
   */
  clear(): void {
    this.metrics = [];
  }
}

export const performanceMonitor = new PerformanceMonitor();

// ============================================================================
// Error Tracking
// ============================================================================

class ErrorTracker {
  private errors: ErrorEvent[] = [];
  private maxErrors = 50;
  private listeners: ((error: ErrorEvent) => void)[] = [];
  
  /**
   * تسجيل خطأ
   */
  track(error: Error | unknown, metadata?: Record<string, unknown>): void {
    const event: ErrorEvent = {
      type: error instanceof Error ? error.name : "UnknownError",
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: Date.now(),
      metadata,
    };
    
    this.errors.push(event);
    
    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }
    
    // إشعار المستمعين
    this.listeners.forEach((listener) => listener(event));
    
    // تسجيل في Console
    logger.error(`[ErrorTracker] ${event.type}: ${event.message}`, {
      stack: event.stack,
      metadata,
    });
  }
  
  /**
   * تسجيل خطأ React
   */
  trackReactError(error: Error, info: { componentStack?: string | null }): void {
    this.track(error, { componentStack: info.componentStack ?? undefined });
  }
  
  /**
   * إضافة مستمع
   */
  addListener(listener: (error: ErrorEvent) => void): void {
    this.listeners.push(listener);
  }
  
  /**
   * إزالة مستمع
   */
  removeListener(listener: (error: ErrorEvent) => void): void {
    this.listeners = this.listeners.filter((l) => l !== listener);
  }
  
  /**
   * الحصول على آخر خطأ
   */
  getLastError(): ErrorEvent | undefined {
    return this.errors[this.errors.length - 1];
  }
  
  /**
   * الحصول على جميع الأخطاء
   */
  getErrors(): ErrorEvent[] {
    return [...this.errors];
  }
  
  /**
   * مسح الأخطاء
   */
  clear(): void {
    this.errors = [];
  }
  
  /**
   * إعداد Global Error Handler
   */
  setupGlobalHandlers(): void {
    window.addEventListener("error", (event) => {
      this.track(event.error || new Error(event.message), {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    });
    
    window.addEventListener("unhandledrejection", (event) => {
      this.track(event.reason || new Error("Unhandled Promise Rejection"));
    });
  }
}

export const errorTracker = new ErrorTracker();

// ============================================================================
// API Monitoring
// ============================================================================

interface APIRequest {
  method: string;
  url: string;
  status?: number;
  duration: number;
  timestamp: number;
  error?: string;
}

class APIMonitor {
  private requests: APIRequest[] = [];
  private maxRequests = 100;
  
  /**
   * تسجيل طلب API
   */
  record(request: Omit<APIRequest, "timestamp">): void {
    this.requests.push({
      ...request,
      timestamp: Date.now(),
    });
    
    if (this.requests.length > this.maxRequests) {
      this.requests.shift();
    }
  }
  
  /**
   * مراقبة fetch
   */
  setupFetchInterceptor(): void {
    const originalFetch = window.fetch;
    
    window.fetch = async (input, init) => {
      const start = performance.now();
      const url = typeof input === "string" ? input : (input instanceof URL ? input.toString() : (input as Request).url);
      const method = init?.method || "GET";
      
      try {
        const response = await originalFetch(input, init);
        const duration = performance.now() - start;
        
        this.record({
          method,
          url,
          status: response.status,
          duration,
        });
        
        return response;
      } catch (error) {
        const duration = performance.now() - start;
        
        this.record({
          method,
          url,
          duration,
          error: error instanceof Error ? error.message : "Network error",
        });
        
        throw error;
      }
    };
  }
  
  /**
   * الحصول على آخر 10 طلبات
   */
  getRecentRequests(count: number = 10): APIRequest[] {
    return this.requests.slice(-count).reverse();
  }
  
  /**
   * الحصول على إحصائيات
   */
  getStats(): {
    total: number;
    success: number;
    errors: number;
    avgDuration: number;
  } {
    const total = this.requests.length;
    const success = this.requests.filter((r) => r.status && r.status < 400).length;
    const errors = this.requests.filter((r) => r.error || (r.status && r.status >= 400)).length;
    const avgDuration = this.requests.reduce((sum, r) => sum + r.duration, 0) / (total || 1);
    
    return { total, success, errors, avgDuration };
  }
}

export const apiMonitor = new APIMonitor();

// ============================================================================
// Security Event Logging
// ============================================================================

type SecurityEventType =
  | "LOGIN_SUCCESS"
  | "LOGIN_FAILED"
  | "LOGOUT"
  | "SESSION_EXPIRED"
  | "SESSION_RENEWED"
  | "SESSION_REVOKED"
  | "PERMISSION_DENIED"
  | "RATE_LIMITED"
  | "INVALID_TOKEN"
  | "CSRF_FAILED";

interface SecurityEvent {
  type: SecurityEventType;
  timestamp: number;
  userId?: string;
  ip?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}

class SecurityLogger {
  private events: SecurityEvent[] = [];
  private maxEvents = 100;
  private listeners: ((event: SecurityEvent) => void)[] = [];
  
  /**
   * تسجيل حدث أمني
   */
  log(
    type: SecurityEventType,
    metadata?: Record<string, unknown>
  ): void {
    const event: SecurityEvent = {
      type,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      metadata,
    };
    
    this.events.push(event);
    
    if (this.events.length > this.maxEvents) {
      this.events.shift();
    }
    
    this.listeners.forEach((listener) => listener(event));
    logger.info(`[Security] ${type}`, metadata);
  }
  
  /**
   * إضافة مستمع
   */
  addListener(listener: (event: SecurityEvent) => void): void {
    this.listeners.push(listener);
  }
  
  /**
   * الحصول على الأحداث
   */
  getEvents(): SecurityEvent[] {
    return [...this.events];
  }
  
  /**
   * مسح الأحداث
   */
  clear(): void {
    this.events = [];
  }
}

export const securityLogger = new SecurityLogger();

// ============================================================================
// Export
// ============================================================================

export const monitoring = {
  health: healthMonitor,
  performance: performanceMonitor,
  errors: errorTracker,
  api: apiMonitor,
  security: securityLogger,
};