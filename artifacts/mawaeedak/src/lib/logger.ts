/**
 * Logger Service — مواعيدك
 *
 * خدمة تسجيل مركزية يمكن تعطيلها في الإنتاج
 * يمنع كشف المعلومات الحساسة في Console
 */

const isProduction = import.meta.env.PROD || import.meta.env.NODE_ENV === "production";

export const logger = {
  error: (message: string, ...data: unknown[]) => {
    if (!isProduction) {
      console.error(`[مواعيدك] ${message}`, ...data);
    }
    // In production: log to error tracking service if available
  },
  
  warn: (message: string, ...data: unknown[]) => {
    if (!isProduction) {
      console.warn(`[مواعيدك] ${message}`, ...data);
    }
  },
  
  info: (message: string, ...data: unknown[]) => {
    if (!isProduction) {
      console.info(`[مواعيدك] ${message}`, ...data);
    }
  },
  
  debug: (message: string, ...data: unknown[]) => {
    if (!isProduction) {
      console.debug(`[مواعيدك] ${message}`, ...data);
    }
  },
};

