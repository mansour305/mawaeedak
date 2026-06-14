/**
 * resilience.ts — نظام الاستقرار والتعافي
 * 
 * يتضمن:
 * - Global Error Boundary
 * - API Retry Logic
 * - Fallback UI
 * - Network Recovery
 */

import React, { Component, type ReactNode, type ErrorInfo } from "react";
import { errorTracker } from "./monitoring";
import { Button } from "@/components/ui/button";

// ============================================================================
// Types
// ============================================================================

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, info: ErrorInfo) => void;
  level?: "page" | "section" | "component";
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorId: string | null;
}

// ============================================================================
// Error Boundary Component
// ============================================================================

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorId: null };
  }
  
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    const errorId = `ERR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    return { hasError: true, error, errorId };
  }
  
  componentDidCatch(error: Error, info: ErrorInfo): void {
    // تتبع الخطأ
    errorTracker.trackReactError(error, info);
    
    // استدعاء الـ callback
    this.props.onError?.(error, info);
    
    console.error("[ErrorBoundary]", error, info.componentStack);
  }
  
  resetError = (): void => {
    this.setState({ hasError: false, error: null, errorId: null });
  };
  
  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <DefaultErrorFallback
          error={this.state.error}
          errorId={this.state.errorId}
          onRetry={this.resetError}
          level={this.props.level}
        />
      );
    }
    
    return this.props.children;
  }
}

// ============================================================================
// Default Error Fallback UI
// ============================================================================

interface DefaultErrorFallbackProps {
  error: Error | null;
  errorId: string | null;
  onRetry: () => void;
  level?: "page" | "section" | "component";
}

function DefaultErrorFallback({
  error,
  errorId,
  onRetry,
  level = "component",
}: DefaultErrorFallbackProps): React.JSX.Element {
  const styles = {
    page: "min-h-[100dvh] flex items-center justify-center p-6",
    section: "p-4 rounded-lg bg-red-50 border border-red-200",
    component: "p-2 rounded bg-red-100",
  };
  
  return (
    <div className={styles[level]}>
      <div className="text-center max-w-md mx-auto">
        <div className="text-4xl mb-4">⚠️</div>
        <h2 className="text-lg font-bold text-red-800 mb-2">
          {level === "page" ? "حدث خطأ غير متوقع" : "خطأ في المكون"}
        </h2>
        <p className="text-sm text-red-600 mb-4">
          {error?.message || "حدث خطأ غير معروف"}
        </p>
        {errorId && (
          <p className="text-xs text-red-400 mb-4 font-mono">
            {errorId}
          </p>
        )}
        {level !== "component" && (
          <div className="flex gap-2 justify-center">
            <Button onClick={onRetry} variant="outline" size="sm">
              إعادة المحاولة
            </Button>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              size="sm"
            >
              تحديث الصفحة
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// API Retry Logic
// ============================================================================

export interface RetryConfig {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  retryableStatuses: number[];
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
  retryableStatuses: [408, 429, 500, 502, 503, 504],
};

export async function fetchWithRetry<T>(
  url: string,
  options?: RequestInit,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const finalConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= finalConfig.maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        if (finalConfig.retryableStatuses.includes(response.status) && attempt < finalConfig.maxRetries) {
          throw new RetryableError(response.status, response.statusText);
        }
        throw new HTTPError(response.status, response.statusText);
      }
      
      return await response.json() as T;
    } catch (error) {
      if (error instanceof HTTPError) {
        throw error;
      }
      
      lastError = error as Error;
      
      if (attempt < finalConfig.maxRetries) {
        const delay = Math.min(
          finalConfig.initialDelay * Math.pow(finalConfig.backoffMultiplier, attempt),
          finalConfig.maxDelay
        );
        await sleep(delay);
      }
    }
  }
  
  throw lastError || new Error("Max retries exceeded");
}

class HTTPError extends Error {
  constructor(
    public status: number,
    public statusText: string
  ) {
    super(`HTTP ${status}: ${statusText}`);
    this.name = "HTTPError";
  }
}

class RetryableError extends Error {
  constructor(
    public status: number,
    public statusText: string
  ) {
    super(`Retryable HTTP ${status}: ${statusText}`);
    this.name = "RetryableError";
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================================================
// Network Recovery
// ============================================================================

class NetworkRecovery {
  private isOnline = navigator.onLine;
  private listeners: ((online: boolean) => void)[] = [];
  private retryTimeout: number | null = null;
  
  constructor() {
    window.addEventListener("online", () => this.handleOnline());
    window.addEventListener("offline", () => this.handleOffline());
  }
  
  private handleOnline(): void {
    this.isOnline = true;
    this.notifyListeners(true);
    this.cancelRetry();
  }
  
  private handleOffline(): void {
    this.isOnline = false;
    this.notifyListeners(false);
  }
  
  /**
   * فحص الاتصال
   */
  checkConnection(): boolean {
    return navigator.onLine;
  }
  
  /**
   * انتظار الاتصال مع retry
   */
  async waitForConnection(timeout: number = 30000): Promise<boolean> {
    if (this.isOnline) return true;
    
    return new Promise((resolve) => {
      const timeoutId = setTimeout(() => {
        window.removeEventListener("online", onOnline);
        resolve(false);
      }, timeout);
      
      const onOnline = () => {
        clearTimeout(timeoutId);
        resolve(true);
      };
      
      window.addEventListener("online", onOnline, { once: true });
    });
  }
  
  /**
   * إضافة مستمع
   */
  addListener(callback: (online: boolean) => void): void {
    this.listeners.push(callback);
  }
  
  /**
   * إزالة مستمع
   */
  removeListener(callback: (online: boolean) => void): void {
    this.listeners = this.listeners.filter((l) => l !== callback);
  }
  
  private notifyListeners(online: boolean): void {
    this.listeners.forEach((listener) => listener(online));
  }
  
  private cancelRetry(): void {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
      this.retryTimeout = null;
    }
  }
}

export const networkRecovery = new NetworkRecovery();

// ============================================================================
// Graceful Degradation
// ============================================================================

interface DegradedFeature {
  name: string;
  isAvailable: boolean;
  fallback?: ReactNode;
}

const degradedFeatures = new Map<string, DegradedFeature>();

export function registerDegradedFeature(
  name: string,
  isAvailable: boolean,
  fallback?: ReactNode
): void {
  degradedFeatures.set(name, { name, isAvailable, fallback });
}

export function isFeatureAvailable(name: string): boolean {
  return degradedFeatures.get(name)?.isAvailable ?? true;
}

export function getFeatureFallback(name: string): ReactNode | undefined {
  return degradedFeatures.get(name)?.fallback;
}

// ============================================================================
// Fallback UI Components
// ============================================================================

interface OfflineFallbackProps {
  onRetry?: () => void;
}

export function OfflineFallback({ onRetry }: OfflineFallbackProps): React.JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="text-5xl mb-4">📡</div>
      <h3 className="text-lg font-bold text-gray-800 mb-2">
        لا يوجد اتصال بالإنترنت
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        يرجى التحقق من اتصالك بالشبكة والمحاولة مرة أخرى
      </p>
      <Button onClick={onRetry} variant="outline">
        إعادة المحاولة
      </Button>
    </div>
  );
}

interface LoadingFallbackProps {
  skeleton?: boolean;
}

export function LoadingFallback({ skeleton = true }: LoadingFallbackProps): React.JSX.Element {
  if (skeleton) {
    return (
      <div className="animate-pulse space-y-4 p-4">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="h-4 bg-gray-200 rounded w-5/6" />
      </div>
    );
  }
  
  return (
    <div className="flex items-center justify-center p-8">
      <div className="text-2xl animate-spin">⏳</div>
    </div>
  );
}

// ============================================================================
// Export
// ============================================================================

export const resilience = {
  ErrorBoundary,
  fetchWithRetry,
  networkRecovery,
  registerDegradedFeature,
  isFeatureAvailable,
  getFeatureFallback,
  OfflineFallback,
  LoadingFallback,
};
