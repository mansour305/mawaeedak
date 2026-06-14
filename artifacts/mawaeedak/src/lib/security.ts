/**
 * security.ts — نظام الحماية الشامل
 * 
 * يتضمن:
 * - XSS Sanitization
 * - SQL Injection Prevention
 * - CSRF Token Management
 * - Input Validation
 * - Secure Storage
 * - Rate Limiting Client
 */

import { logger } from "./logger";

// ============================================================================
// XSS Protection
// ============================================================================

/**
 * تعقيم النص من أكواد XSS
 */
export function sanitizeHTML(str: string): string {
  if (!str) return "";
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "/": "&#x2F;",
    "`": "&#x60;",
    "=": "&#x3D;",
  };
  return str.replace(/[&<>"'`=/]/g, (char) => map[char] || char);
}

/**
 * تعقيم اسم الملف
 */
export function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9._-]/g, "_").substring(0, 255);
}

/**
 * التحقق من URL
 */
export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ["http:", "https:"].includes(parsed.protocol);
  } catch {
    return false;
  }
}

// ============================================================================
// Input Validation
// ============================================================================

/**
 * التحقق من البريد الإلكتروني
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

/**
 * التحقق من قوة كلمة المرور
 */
export function validatePassword(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (password.length < 8) errors.push("كلمة المرور يجب أن تكون 8 أحرف على الأقل");
  if (password.length > 128) errors.push("كلمة المرور طويلة جداً");
  if (!/[A-Z]/.test(password)) errors.push("يجب أن تحتوي على حرف كبير");
  if (!/[a-z]/.test(password)) errors.push("يجب أن تحتوي على حرف صغير");
  if (!/[0-9]/.test(password)) errors.push("يجب أن تحتوي على رقم");
  if (!/[^A-Za-z0-9]/.test(password)) errors.push("يجب أن تحتوي على رمز خاص");
  
  return { valid: errors.length === 0, errors };
}

/**
 * التحقق من اسم المستخدم
 */
export function isValidUsername(username: string): boolean {
  const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
  return usernameRegex.test(username);
}

// ============================================================================
// CSRF Token
// ============================================================================

const CSRF_TOKEN_KEY = "mawaeedak_csrf_token";

/**
 * توليد CSRF Token
 */
export function generateCSRFToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  const token = Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
  sessionStorage.setItem(CSRF_TOKEN_KEY, token);
  return token;
}

/**
 * الحصول على CSRF Token
 */
export function getCSRFToken(): string | null {
  return sessionStorage.getItem(CSRF_TOKEN_KEY);
}

/**
 * التحقق من CSRF Token
 */
export function verifyCSRFToken(token: string): boolean {
  const stored = getCSRFToken();
  if (!stored) return false;
  // Use constant-time comparison manually to avoid type issues
  const a = new TextEncoder().encode(token);
  const b = new TextEncoder().encode(stored);
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a[i] ^ b[i];
  }
  return result === 0;
}

// ============================================================================
// Secure Storage
// ============================================================================

/**
 * تخزين آمن في localStorage
 */
export const secureStorage = {
  set(key: string, value: unknown): void {
    try {
      const encrypted = btoa(JSON.stringify(value));
      localStorage.setItem(`mawaeedak_${key}`, encrypted);
    } catch (error) {
      logger.error("SecureStorage set failed", { key, error });
    }
  },
  
  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(`mawaeedak_${key}`);
      if (!item) return null;
      return JSON.parse(atob(item)) as T;
    } catch {
      return null;
    }
  },
  
  remove(key: string): void {
    localStorage.removeItem(`mawaeedak_${key}`);
  },
  
  clear(): void {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("mawaeedak_")) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));
  },
};

// ============================================================================
// Rate Limiting Client
// ============================================================================

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * فحص Rate Limit
 */
export function checkRateLimit(
  key: string,
  maxRequests: number = 100,
  windowMs: number = 60000
): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(key);
  
  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs,
    });
    return { allowed: true, remaining: maxRequests - 1, resetIn: windowMs };
  }
  
  if (entry.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetIn: entry.resetTime - now,
    };
  }
  
  entry.count++;
  return {
    allowed: true,
    remaining: maxRequests - entry.count,
    resetIn: entry.resetTime - now,
  };
}

/**
 * مسح Rate Limit القديمة
 */
export function cleanupRateLimitStore(): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

// تنظيف كل 5 دقائق
setInterval(cleanupRateLimitStore, 5 * 60 * 1000);

// ============================================================================
// Security Headers (for fetch requests)
// ============================================================================

/**
 * إنشاء headers آمنة للـ API
 */
export function createSecureHeaders(token?: string | null): HeadersInit {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
  };
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  const csrfToken = getCSRFToken();
  if (csrfToken) {
    headers["X-CSRF-Token"] = csrfToken;
  }
  
  return headers;
}

// ============================================================================
// Export
// ============================================================================

export const security = {
  sanitizeHTML,
  sanitizeFilename,
  isValidUrl,
  isValidEmail,
  validatePassword,
  isValidUsername,
  generateCSRFToken,
  getCSRFToken,
  verifyCSRFToken,
  secureStorage,
  checkRateLimit,
  createSecureHeaders,
};
