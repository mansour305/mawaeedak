-- ============================================================
-- SUPABASE_MISSING_TABLES_FIX.sql — مواعيدك
-- ============================================================
-- الغرض: إنشاء الجداول السبعة الناقصة بعد تشغيل SUPABASE_SCHEMA.sql
-- الجداول الموجودة (12): profiles, appointments, financial_events,
--   notifications, daily_messages, themes, story_templates, news,
--   jobs, public_events, complaints, audit_logs
-- الجداول الناقصة (7): المذكورة أدناه
--
-- تعليمات التشغيل:
--   Supabase Dashboard → SQL Editor → New Query → الصق هذا الملف → Run
--
-- آمن تماماً: IF NOT EXISTS على كل جدول — لا DROP — لا بيانات تُمسح
-- ============================================================

-- ============================================================
-- 1. roles — أدوار النظام
-- ============================================================
CREATE TABLE IF NOT EXISTS public.roles (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT        UNIQUE NOT NULL,
  description TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

INSERT INTO public.roles (name, description) VALUES
  ('user',            'مستخدم عادي')         ON CONFLICT (name) DO NOTHING;
INSERT INTO public.roles (name, description) VALUES
  ('admin',           'مدير النظام')          ON CONFLICT (name) DO NOTHING;
INSERT INTO public.roles (name, description) VALUES
  ('super_admin',     'المالك — صلاحيات كاملة') ON CONFLICT (name) DO NOTHING;
INSERT INTO public.roles (name, description) VALUES
  ('content_manager', 'مدير المحتوى')         ON CONFLICT (name) DO NOTHING;
INSERT INTO public.roles (name, description) VALUES
  ('finance_manager', 'مدير المالية')         ON CONFLICT (name) DO NOTHING;

ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS roles_name_idx ON public.roles (name);

-- ============================================================
-- 2. permissions — الصلاحيات
-- ============================================================
CREATE TABLE IF NOT EXISTS public.permissions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT UNIQUE NOT NULL,
  resource    TEXT NOT NULL,
  action      TEXT NOT NULL,
  description TEXT
);

INSERT INTO public.permissions (name, resource, action, description) VALUES
  ('read_daily_messages',   'daily_messages',   'read',   'قراءة رسائل اليوم')   ON CONFLICT (name) DO NOTHING;
INSERT INTO public.permissions (name, resource, action, description) VALUES
  ('write_daily_messages',  'daily_messages',   'write',  'كتابة رسائل اليوم')  ON CONFLICT (name) DO NOTHING;
INSERT INTO public.permissions (name, resource, action, description) VALUES
  ('read_news',             'news',             'read',   'قراءة الأخبار')        ON CONFLICT (name) DO NOTHING;
INSERT INTO public.permissions (name, resource, action, description) VALUES
  ('write_news',            'news',             'write',  'كتابة الأخبار')       ON CONFLICT (name) DO NOTHING;
INSERT INTO public.permissions (name, resource, action, description) VALUES
  ('read_jobs',             'jobs',             'read',   'قراءة الوظائف')        ON CONFLICT (name) DO NOTHING;
INSERT INTO public.permissions (name, resource, action, description) VALUES
  ('write_jobs',            'jobs',             'write',  'كتابة الوظائف')       ON CONFLICT (name) DO NOTHING;
INSERT INTO public.permissions (name, resource, action, description) VALUES
  ('read_complaints',       'complaints',       'read',   'قراءة الشكاوى')        ON CONFLICT (name) DO NOTHING;
INSERT INTO public.permissions (name, resource, action, description) VALUES
  ('manage_themes',         'themes',           'write',  'إدارة الثيمات')        ON CONFLICT (name) DO NOTHING;
INSERT INTO public.permissions (name, resource, action, description) VALUES
  ('manage_users',          'users',            'write',  'إدارة المستخدمين')     ON CONFLICT (name) DO NOTHING;
INSERT INTO public.permissions (name, resource, action, description) VALUES
  ('view_audit_logs',       'audit_logs',       'read',   'عرض سجل النشاطات')    ON CONFLICT (name) DO NOTHING;

ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 3. role_permissions — ربط الأدوار بالصلاحيات
-- ============================================================
CREATE TABLE IF NOT EXISTS public.role_permissions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id       UUID NOT NULL REFERENCES public.roles(id)       ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
  UNIQUE (role_id, permission_id)
);

ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS role_permissions_role_idx       ON public.role_permissions (role_id);
CREATE INDEX IF NOT EXISTS role_permissions_permission_idx ON public.role_permissions (permission_id);

-- ============================================================
-- 4. user_roles — ربط المستخدمين بالأدوار
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_roles (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id    UUID        NOT NULL REFERENCES public.roles(id)  ON DELETE CASCADE,
  granted_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE (user_id, role_id)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS user_roles_user_idx ON public.user_roles (user_id);
CREATE INDEX IF NOT EXISTS user_roles_role_idx ON public.user_roles (role_id);

-- ============================================================
-- 5. admin_users — مستخدمو الإدارة
-- ============================================================
CREATE TABLE IF NOT EXISTS public.admin_users (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  granted_by UUID        REFERENCES auth.users(id),
  granted_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS admin_users_user_idx ON public.admin_users (user_id);

-- ============================================================
-- 6. notification_preferences — تفضيلات الإشعارات
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  preferences JSONB       NOT NULL DEFAULT '{}',
  updated_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS notification_preferences_user_idx ON public.notification_preferences (user_id);

-- ============================================================
-- 7. app_settings — إعدادات التطبيق العامة
-- ============================================================
CREATE TABLE IF NOT EXISTS public.app_settings (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  key        TEXT        UNIQUE NOT NULL,
  value      JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS app_settings_key_idx ON public.app_settings (key);

INSERT INTO public.app_settings (key, value) VALUES
  ('default_theme', '"heritage"'::jsonb)        ON CONFLICT (key) DO NOTHING;
INSERT INTO public.app_settings (key, value) VALUES
  ('default_city',  '"الرياض"'::jsonb)           ON CONFLICT (key) DO NOTHING;
INSERT INTO public.app_settings (key, value) VALUES
  ('app_version',   '"1.0.0"'::jsonb)            ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- انتهى — شغّل RLS_POLICIES_FIX.sql بعد هذا الملف
-- ============================================================
