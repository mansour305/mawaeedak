-- ============================================================
-- Supabase Schema — مواعيدك
-- ============================================================
-- هذا الملف يوثق الجداول المقترحة عند الانتقال إلى Supabase.
-- الجداول الحالية مبنية على PostgreSQL + Drizzle ORM.
-- عند الانتقال، تُنقل الجداول هنا مع إضافة user_id و RLS.
--
-- الحالة الحالية: لا Supabase متصل — توثيق مستقبلي فقط.
-- ============================================================

-- ملاحظة: Supabase يوفر auth.users تلقائياً — لا تنشئ public.users
-- استخدم profiles للبيانات الإضافية

-- ============================================================
-- 1. profiles — ملفات المستخدمين
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  city TEXT DEFAULT 'الرياض',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- 2. appointments — المواعيد
-- ============================================================
CREATE TABLE IF NOT EXISTS public.appointments (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  date TEXT NOT NULL,
  time TEXT,
  category TEXT NOT NULL DEFAULT 'شخصي',
  color TEXT,
  priority TEXT,
  reminder_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- 3. financial_events — الأحداث المالية
-- ============================================================
CREATE TABLE IF NOT EXISTS public.financial_events (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  next_date TEXT NOT NULL,
  amount NUMERIC,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  reminder_days_before INTEGER NOT NULL DEFAULT 3,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- 4. notifications — الإشعارات
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT,
  type TEXT NOT NULL DEFAULT 'general',
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- 5. daily_messages — رسائل اليوم (admin_managed)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.daily_messages (
  id SERIAL PRIMARY KEY,
  message TEXT NOT NULL,
  display_date TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- 6. themes — الثيمات
-- ============================================================
CREATE TABLE IF NOT EXISTS public.themes (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  colors JSONB,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  tier TEXT NOT NULL DEFAULT 'free',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- 7. story_templates — قوالب ستوري اليوم
-- ============================================================
CREATE TABLE IF NOT EXISTS public.story_templates (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  template_text TEXT NOT NULL,
  background_color TEXT,
  text_color TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- 8. news — الأخبار (admin_managed)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.news (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT,
  category TEXT NOT NULL,
  source TEXT,
  image_url TEXT,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- 9. jobs — الوظائف (admin_managed)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.jobs (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  employer TEXT NOT NULL,
  sector TEXT NOT NULL,
  city TEXT NOT NULL,
  description TEXT,
  apply_url TEXT,
  deadline TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- 10. public_events — الأحداث العامة (admin_managed)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.public_events (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  event_date TEXT NOT NULL,
  category TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- 11. complaints — الشكاوى والمقترحات
-- ============================================================
CREATE TABLE IF NOT EXISTS public.complaints (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  contact TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- 12. audit_logs — سجل النشاطات الإدارية
-- ============================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id SERIAL PRIMARY KEY,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id INTEGER,
  entity_name TEXT,
  description TEXT,
  performed_by TEXT NOT NULL DEFAULT 'admin',
  status TEXT NOT NULL DEFAULT 'success',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- Enable Row Level Security على الجداول الحساسة
-- (انظر RLS_POLICIES.sql للسياسات التفصيلية)
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
