/**
 * Feature Registry — Phase 14
 * 
 * Tracks feature status for paywall and health monitoring.
 */

export type FeatureStatus = "active" | "beta" | "coming_soon" | "disabled";
export type PlanRequired = "free" | "premium";

export type Feature = {
  feature_key: string;
  title: string;
  description: string;
  plan_required: PlanRequired;
  status: FeatureStatus;
  is_visible_in_paywall: boolean;
  is_coming_soon: boolean;
  route: string | null;
  health_check_key: string;
  created_at: string;
  updated_at: string;
};

// Feature Registry
export const FEATURE_REGISTRY: Feature[] = [
  // Core features
  {
    feature_key: "home",
    title: "الرئيسية",
    description: "الصفحة الرئيسية مع مواقيت الصلاة والمواعيد المالية",
    plan_required: "free",
    status: "active",
    is_visible_in_paywall: false,
    is_coming_soon: false,
    route: "/",
    health_check_key: "home",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    feature_key: "prayer_times",
    title: "مواقيت الصلاة",
    description: "عرض مواقيت الصلاة مع العد التنازلي",
    plan_required: "free",
    status: "active",
    is_visible_in_paywall: false,
    is_coming_soon: false,
    route: "/",
    health_check_key: "prayer_times",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    feature_key: "financial_dates",
    title: "المواعيد المالية",
    description: "الرواتب والمساعدات ومواعيد الدفع",
    plan_required: "free",
    status: "active",
    is_visible_in_paywall: false,
    is_coming_soon: false,
    route: "/salaries",
    health_check_key: "financial",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    feature_key: "calendar",
    title: "التقويم",
    description: "إدارة المواعيد الشخصية",
    plan_required: "free",
    status: "active",
    is_visible_in_paywall: false,
    is_coming_soon: false,
    route: "/calendar",
    health_check_key: "calendar",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    feature_key: "goals",
    title: "الأهداف",
    description: "تتبع الأهداف المالية وغير المالية",
    plan_required: "free",
    status: "active",
    is_visible_in_paywall: false,
    is_coming_soon: false,
    route: "/services/goals",
    health_check_key: "goals",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    feature_key: "costs",
    title: "حساب التكاليف",
    description: "إدارة مشاريع التكاليف والبنود",
    plan_required: "free",
    status: "active",
    is_visible_in_paywall: false,
    is_coming_soon: false,
    route: "/services/costs",
    health_check_key: "costs",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    feature_key: "reminders",
    title: "التذكيرات",
    description: "تذكيرات مخصصة بمواعيد ثابتة",
    plan_required: "free",
    status: "active",
    is_visible_in_paywall: false,
    is_coming_soon: false,
    route: "/services/reminders",
    health_check_key: "reminders",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    feature_key: "notifications",
    title: "الإشعارات",
    description: "قائمة الإشعارات الداخلية",
    plan_required: "free",
    status: "active",
    is_visible_in_paywall: false,
    is_coming_soon: false,
    route: "/notifications",
    health_check_key: "notifications",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    feature_key: "daily_content",
    title: "محتوى اليوم",
    description: "رسائل اليوم اليومية",
    plan_required: "free",
    status: "active",
    is_visible_in_paywall: false,
    is_coming_soon: false,
    route: "/daily-card",
    health_check_key: "daily_content",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    feature_key: "complaints",
    title: "صوتك مسموع",
    description: "الشكاوى والاقتراحات",
    plan_required: "free",
    status: "active",
    is_visible_in_paywall: false,
    is_coming_soon: false,
    route: "/centers/complaints",
    health_check_key: "complaints",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    feature_key: "account",
    title: "حسابي",
    description: "إدارة الحساب والإعدادات",
    plan_required: "free",
    status: "active",
    is_visible_in_paywall: false,
    is_coming_soon: false,
    route: "/account",
    health_check_key: "account",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    feature_key: "themes",
    title: "الثيمات",
    description: "تغيير مظهر التطبيق",
    plan_required: "free",
    status: "active",
    is_visible_in_paywall: false,
    is_coming_soon: false,
    route: "/account",
    health_check_key: "themes",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    feature_key: "pwa",
    title: "PWA",
    description: "التطبيق القابل للتثبيت",
    plan_required: "free",
    status: "active",
    is_visible_in_paywall: false,
    is_coming_soon: false,
    route: null,
    health_check_key: "pwa",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  // Coming soon
  {
    feature_key: "adkkar",
    title: "الأذكار",
    description: "أذكار الصباح والمساء",
    plan_required: "free",
    status: "coming_soon",
    is_visible_in_paywall: false,
    is_coming_soon: true,
    route: null,
    health_check_key: "adkkar",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    feature_key: "greetings",
    title: "التهاني",
    description: "إرسال التهاني والمناسبات",
    plan_required: "free",
    status: "coming_soon",
    is_visible_in_paywall: false,
    is_coming_soon: true,
    route: null,
    health_check_key: "greetings",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    feature_key: "smartwatch",
    title: "ساعة ذكية",
    description: "Apple Watch و Wear OS",
    plan_required: "premium",
    status: "coming_soon",
    is_visible_in_paywall: true,
    is_coming_soon: true,
    route: null,
    health_check_key: "smartwatch",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    feature_key: "push_notifications",
    title: "إشعارات Push",
    description: "إشعارات فورية",
    plan_required: "premium",
    status: "coming_soon",
    is_visible_in_paywall: true,
    is_coming_soon: true,
    route: null,
    health_check_key: "push_notifications",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    feature_key: "export",
    title: "تصدير البيانات",
    description: "تصدير المواعيد والتقارير",
    plan_required: "premium",
    status: "coming_soon",
    is_visible_in_paywall: true,
    is_coming_soon: true,
    route: null,
    health_check_key: "export",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    feature_key: "advanced_sharing",
    title: "مشاركة متقدمة",
    description: "مشاركة التقويم والملفات",
    plan_required: "premium",
    status: "coming_soon",
    is_visible_in_paywall: true,
    is_coming_soon: true,
    route: null,
    health_check_key: "advanced_sharing",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    feature_key: "personal_reports",
    title: "تقارير شخصية",
    description: "تقارير وإحصائيات متقدمة",
    plan_required: "premium",
    status: "coming_soon",
    is_visible_in_paywall: true,
    is_coming_soon: true,
    route: null,
    health_check_key: "personal_reports",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    feature_key: "smart_alerts",
    title: "تنبيهات ذكية",
    description: "تنبيهات ذكية بناءً على السلوك",
    plan_required: "premium",
    status: "coming_soon",
    is_visible_in_paywall: true,
    is_coming_soon: true,
    route: null,
    health_check_key: "smart_alerts",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Free tier limits
export const FREE_LIMITS = {
  goals: 3,
  costProjects: 2,
  costItemsPerProject: 10,
  reminders: 5,
  calendarEvents: 20,
};

// Premium limits
export const PREMIUM_LIMITS = {
  goals: Infinity,
  costProjects: Infinity,
  costItemsPerProject: Infinity,
  reminders: Infinity,
  calendarEvents: Infinity,
};

// Subscription plans
export const SUBSCRIPTION_PLANS = {
  free: {
    name: "مجاني",
    price: 0,
    priceMonthly: 0,
    priceAnnual: 0,
    equivalentMonthly: 0,
    features: [
      "الأهداف (3 أهداف)",
      "مشاريع التكاليف (2 مشروع)",
      "التذكيرات (5)",
      "التقويم (20 موعد)",
      "الثيم الافتراضي",
    ],
    isTrialAvailable: false,
  },
  premiumMonthly: {
    name: "اشتراك شهري",
    price: 10,
    priceMonthly: 10,
    priceAnnual: 0,
    equivalentMonthly: 10,
    currency: "USD",
    trialDays: 7,
    features: [
      "أهداف غير محدودة",
      "مشاريع تكاليف غير محدودة",
      "تذكيرات غير محدودة",
      "تقويم غير محدود",
      "ثيمات متقدمة",
      "تقارير شخصية",
      "تنبيهات ذكية",
    ],
    isTrialAvailable: true,
  },
  premiumAnnual: {
    name: "اشتراك سنوي",
    price: 48,
    priceMonthly: 0,
    priceAnnual: 48,
    equivalentMonthly: 4,
    currency: "USD",
    trialDays: 7,
    features: [
      "أهداف غير محدودة",
      "مشاريع تكاليف غير محدودة",
      "تذكيرات غير محدودة",
      "تقويم غير محدود",
      "ثيمات متقدمة",
      "تقارير شخصية",
      "تنبيهات ذكية",
      "تصدير وإحصائيات",
    ],
    isTrialAvailable: true,
  },
};

/**
 * Get feature by key
 */
export function getFeature(featureKey: string): Feature | undefined {
  return FEATURE_REGISTRY.find(f => f.feature_key === featureKey);
}

/**
 * Get all active features
 */
export function getActiveFeatures(): Feature[] {
  return FEATURE_REGISTRY.filter(f => f.status === "active");
}

/**
 * Get features by plan
 */
export function getFeaturesByPlan(plan: PlanRequired): Feature[] {
  return FEATURE_REGISTRY.filter(f => f.plan_required === plan);
}

/**
 * Get coming soon features
 */
export function getComingSoonFeatures(): Feature[] {
  return FEATURE_REGISTRY.filter(f => f.status === "coming_soon");
}

/**
 * Check if feature is available for user
 */
export function isFeatureAvailable(featureKey: string, userPlan: PlanRequired): boolean {
  const feature = getFeature(featureKey);
  if (!feature) return false;
  if (feature.status === "disabled") return false;
  if (feature.status === "coming_soon") return false;
  if (feature.plan_required === "premium" && userPlan === "free") return false;
  return true;
}
