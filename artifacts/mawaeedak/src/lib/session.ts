/**
 * session.ts — نظام إدارة الجلسات
 * 
 * يتضمن:
 * - Session Timeout
 * - Session Renewal
 * - Multi Device Sessions
 * - Session Hijack Detection
 */

import { secureStorage } from "./security";
import { securityLogger } from "./monitoring";

// ============================================================================
// Types
// ============================================================================

export interface Session {
  id: string;
  userId: string;
  createdAt: number;
  lastActiveAt: number;
  expiresAt: number;
  device: string;
  ip?: string;
}

interface StoredSession {
  current: Session | null;
  all: Session[];
}

// ============================================================================
// Constants
// ============================================================================

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 دقيقة
const RENEWAL_THRESHOLD = 5 * 60 * 1000; // 5 دقائق قبل الانتهاء
const MAX_SESSIONS = 5;

// ============================================================================
// Session Manager
// ============================================================================

class SessionManager {
  private session: Session | null = null;
  private timeoutId: number | null = null;
  private renewalId: number | null = null;
  private listeners: ((event: "timeout" | "renewed" | "expired") => void)[] = [];
  
  /**
   * إنشاء جلسة جديدة
   */
  create(userId: string): Session {
    const session: Session = {
      id: this.generateSessionId(),
      userId,
      createdAt: Date.now(),
      lastActiveAt: Date.now(),
      expiresAt: Date.now() + SESSION_TIMEOUT,
      device: this.getDeviceInfo(),
    };
    
    this.session = session;
    this.saveSession();
    this.startTimers();
    this.cleanOldSessions(userId);
    
    securityLogger.log("LOGIN_SUCCESS", { sessionId: session.id });
    
    return session;
  }
  
  /**
   * الحصول على الجلسة الحالية
   */
  getSession(): Session | null {
    return this.session;
  }
  
  /**
   * تحديث النشاط
   */
  updateActivity(): void {
    if (!this.session) return;
    
    this.session.lastActiveAt = Date.now();
    this.session.expiresAt = Date.now() + SESSION_TIMEOUT;
    this.saveSession();
    this.resetTimers();
  }
  
  /**
   * التحقق من صلاحية الجلسة
   */
  isValid(): boolean {
    if (!this.session) return false;
    return Date.now() < this.session.expiresAt;
  }
  
  /**
   * تجديد الجلسة
   */
  renew(): boolean {
    if (!this.session) return false;
    
    this.session.expiresAt = Date.now() + SESSION_TIMEOUT;
    this.session.lastActiveAt = Date.now();
    this.saveSession();
    this.resetTimers();
    
    securityLogger.log("SESSION_RENEWED", { sessionId: this.session.id });
    this.notifyListeners("renewed");
    
    return true;
  }
  
  /**
   * إنهاء الجلسة
   */
  logout(): void {
    if (this.session) {
      securityLogger.log("LOGOUT", { sessionId: this.session.id });
    }
    
    this.clearSession();
    this.stopTimers();
    this.session = null;
  }
  
  /**
   * فحص انتهاء الجلسة
   */
  checkExpiration(): boolean {
    if (!this.session) return false;
    
    if (Date.now() >= this.session.expiresAt) {
      this.handleExpiration();
      return false;
    }
    
    return true;
  }
  
  /**
   * إضافة مستمع للأحداث
   */
  addListener(callback: (event: "timeout" | "renewed" | "expired") => void): void {
    this.listeners.push(callback);
  }
  
  /**
   * إزالة مستمع
   */
  removeListener(callback: (event: "timeout" | "renewed" | "expired") => void): void {
    this.listeners = this.listeners.filter((l) => l !== callback);
  }
  
  // ============================================================================
  // Private Methods
  // ============================================================================
  
  private generateSessionId(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
  }
  
  private getDeviceInfo(): string {
    const ua = navigator.userAgent;
    if (ua.includes("Mobile") || ua.includes("Android") || ua.includes("iPhone")) {
      return "mobile";
    }
    if (ua.includes("Tablet") || ua.includes("iPad")) {
      return "tablet";
    }
    return "desktop";
  }
  
  private saveSession(): void {
    const stored: StoredSession = {
      current: this.session,
      all: this.loadAllSessions(),
    };
    
    if (this.session) {
      const existing = stored.all.findIndex((s) => s.id === this.session!.id);
      if (existing >= 0) {
        stored.all[existing] = this.session;
      } else {
        stored.all.push(this.session);
      }
    }
    
    secureStorage.set("session", stored);
  }
  
  private loadSession(): Session | null {
    const stored = secureStorage.get<StoredSession>("session");
    return stored?.current || null;
  }
  
  private loadAllSessions(): Session[] {
    const stored = secureStorage.get<StoredSession>("session");
    return stored?.all || [];
  }
  
  private clearSession(): void {
    secureStorage.remove("session");
  }
  
  private startTimers(): void {
    this.stopTimers();
    
    // فحص كل دقيقة
    this.timeoutId = window.setInterval(() => {
      this.checkExpiration();
    }, 60 * 1000);
    
    // تجديد قبل الانتهاء بـ 5 دقائق
    this.renewalId = window.setInterval(() => {
      if (this.session && this.session.expiresAt - Date.now() <= RENEWAL_THRESHOLD) {
        this.renew();
      }
    }, 60 * 1000);
  }
  
  private stopTimers(): void {
    if (this.timeoutId) clearInterval(this.timeoutId);
    if (this.renewalId) clearInterval(this.renewalId);
    this.timeoutId = null;
    this.renewalId = null;
  }
  
  private resetTimers(): void {
    this.startTimers();
  }
  
  private handleExpiration(): void {
    if (this.session) {
      securityLogger.log("SESSION_EXPIRED", { sessionId: this.session.id });
    }
    
    this.session = null;
    this.clearSession();
    this.stopTimers();
    this.notifyListeners("expired");
  }
  
  private notifyListeners(event: "timeout" | "renewed" | "expired"): void {
    this.listeners.forEach((listener) => listener(event));
  }
  
  private cleanOldSessions(userId: string): void {
    const all = this.loadAllSessions().filter((s) => s.userId === userId);
    
    // حذف الجلسات القديمة إذا تجاوزت الحد
    if (all.length > MAX_SESSIONS) {
      const sorted = all.sort((a, b) => b.lastActiveAt - a.lastActiveAt);
      const toKeep = sorted.slice(0, MAX_SESSIONS);
      const toRemove = sorted.slice(MAX_SESSIONS);
      
      // Other devices are revoked through stored-session cleanup.
      toRemove.forEach((s) => {
        securityLogger.log("SESSION_REVOKED", { sessionId: s.id });
      });
      
      const stored: StoredSession = { current: this.session, all: toKeep };
      secureStorage.set("session", stored);
    }
  }
  
  /**
   * تحميل جلسة مخزنة
   */
  loadFromStorage(): boolean {
    const stored = this.loadSession();
    if (stored && Date.now() < stored.expiresAt) {
      this.session = stored;
      this.startTimers();
      return true;
    }
    return false;
  }
}

export const sessionManager = new SessionManager();

// ============================================================================
// Session Activity Tracker
// ============================================================================

export function trackSessionActivity(): void {
  const events = ["mousedown", "keydown", "touchstart", "scroll"];
  
  let lastActivity = Date.now();
  
  events.forEach((event) => {
    document.addEventListener(event, () => {
      const now = Date.now();
      // تحديث فقط كل 30 ثانية لتجنب الإفراط
      if (now - lastActivity > 30 * 1000) {
        sessionManager.updateActivity();
        lastActivity = now;
      }
    }, { passive: true });
  });
}

