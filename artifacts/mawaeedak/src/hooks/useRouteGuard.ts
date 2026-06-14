/**
 * Route Guards — مواعيدك Phase FINAL
 * 
 * نظام حماية موحد للمسارات المحمية.
 * يستخدم للتحقق من صلاحيات المستخدم قبل الوصول للصفحات المحمية.
 */

import { useStore } from "@/hooks/useStore";

export type RouteProtectionLevel = "public" | "authenticated" | "admin" | "owner";

interface RouteGuardConfig {
  protection: RouteProtectionLevel;
  redirectTo?: string;
  fallbackComponent?: React.ReactNode;
}

/**
 * التحقق من مستوى الحماية المطلوب
 */
export function getRouteProtectionLevel(pathname: string): RouteProtectionLevel {
  // Admin routes - require admin role
  if (pathname.startsWith("/admin")) {
    return "admin";
  }

  // Protected user routes - require authentication
  const protectedPaths = [
    "/account",
    "/notifications",
    "/daily-card",
    "/calendar",
  ];

  if (protectedPaths.some((path) => pathname.startsWith(path))) {
    return "authenticated";
  }

  // Public routes
  return "public";
}

/**
 * التحقق من صلاحية المستخدم للوصول للمسار
 */
export function canAccessRoute(
  pathname: string,
  user: ReturnType<typeof useStore>["user"]
): boolean {
  const protectionLevel = getRouteProtectionLevel(pathname);

  switch (protectionLevel) {
    case "public":
      return true;

    case "authenticated":
      // Require authenticated user
      return Boolean(user?.email);

    case "admin":
    case "owner":
      // Require admin role
      const role = user?.role;
      return ["admin", "super_admin", "owner"].includes(role as string);

    default:
      return false;
  }
}

/**
 * الحصول على صفحة التوجيه عند عدم الصلاحية
 */
export function getRedirectPath(pathname: string, isAuthenticated: boolean): string {
  const protectionLevel = getRouteProtectionLevel(pathname);

  switch (protectionLevel) {
    case "authenticated":
      // Redirect to login with return URL
      return isAuthenticated ? "/" : "/login";

    case "admin":
    case "owner":
      // Redirect to home for non-admins
      return "/";

    default:
      return pathname;
  }
}

/**
 * Route Guard Component
 */
export function useRouteGuard(pathname: string) {
  const { user } = useStore();
  const isAuthenticated = Boolean(user?.email);
  const isAdmin = ["admin", "super_admin", "owner"].includes(user?.role || "");

  const protectionLevel = getRouteProtectionLevel(pathname);
  const canAccess = canAccessRoute(pathname, user);
  const redirectTo = getRedirectPath(pathname, isAuthenticated);

  return {
    protectionLevel,
    isAuthenticated,
    isAdmin,
    canAccess,
    redirectTo,
  };
}

/**
 * Admin Route Guard - للتحقق من صلاحية المالك
 */
export function useAdminGuard() {
  const { user } = useStore();
  const role = user?.role;

  const isAdmin =
    user?.email &&
    ["admin", "super_admin", "owner"].includes(role as string);

  const hasAccess = Boolean(isAdmin);

  return {
    hasAccess,
    role,
    isOwner: role === "owner",
    isSuperAdmin: role === "super_admin",
    isAdmin: role === "admin",
  };
}

/**
 * Auth Route Guard - للتحقق من تسجيل الدخول
 */
export function useAuthGuard() {
  const { user } = useStore();
  const isAuthenticated = Boolean(user?.email);

  return {
    isAuthenticated,
    user,
  };
}
