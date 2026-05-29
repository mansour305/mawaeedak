-- ============================================================
-- SUPABASE_SCHEMA_ALIGNMENT.sql — مواعيدك
-- Phase 12B | 2026-05-24
-- ============================================================
-- غير تدميري تماماً:
--   - يستخدم ADD COLUMN IF NOT EXISTS فقط
--   - لا DROP / لا TRUNCATE / لا DELETE / لا UPDATE بيانات
--   - لا INSERT seed data في هذا الملف
--   - آمن للتشغيل مرات متعددة
-- ============================================================

-- ============================================================
-- القسم 1: إضافة legacy_id + migration metadata
-- لجميع الجداول المستهدفة بالـ migration
-- legacy_id = serial integer من PostgreSQL/Drizzle (مصدر الحقيقة الحالي)
-- ============================================================

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- A. الجداول الشخصية (user-owned) — تحتوي user_id بالفعل
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- appointments
ALTER TABLE public.appointments
  ADD COLUMN IF NOT EXISTS legacy_id       INTEGER,
  ADD COLUMN IF NOT EXISTS migrated_at     TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS migration_batch TEXT;

-- financial_events
ALTER TABLE public.financial_events
  ADD COLUMN IF NOT EXISTS legacy_id       INTEGER,
  ADD COLUMN IF NOT EXISTS migrated_at     TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS migration_batch TEXT;

-- notifications
ALTER TABLE public.notifications
  ADD COLUMN IF NOT EXISTS legacy_id       INTEGER,
  ADD COLUMN IF NOT EXISTS migrated_at     TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS migration_batch TEXT;

-- complaints
ALTER TABLE public.complaints
  ADD COLUMN IF NOT EXISTS legacy_id       INTEGER,
  ADD COLUMN IF NOT EXISTS migrated_at     TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS migration_batch TEXT;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- B. الجداول admin-managed — لا تحتاج user_id
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- daily_messages
ALTER TABLE public.daily_messages
  ADD COLUMN IF NOT EXISTS legacy_id       INTEGER,
  ADD COLUMN IF NOT EXISTS migrated_at     TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS migration_batch TEXT;

-- story_templates
ALTER TABLE public.story_templates
  ADD COLUMN IF NOT EXISTS legacy_id       INTEGER,
  ADD COLUMN IF NOT EXISTS migrated_at     TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS migration_batch TEXT;

-- themes
ALTER TABLE public.themes
  ADD COLUMN IF NOT EXISTS legacy_id       INTEGER,
  ADD COLUMN IF NOT EXISTS migrated_at     TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS migration_batch TEXT;

-- news
ALTER TABLE public.news
  ADD COLUMN IF NOT EXISTS legacy_id       INTEGER,
  ADD COLUMN IF NOT EXISTS migrated_at     TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS migration_batch TEXT;

-- jobs
ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS legacy_id       INTEGER,
  ADD COLUMN IF NOT EXISTS migrated_at     TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS migration_batch TEXT;

-- public_events
ALTER TABLE public.public_events
  ADD COLUMN IF NOT EXISTS legacy_id       INTEGER,
  ADD COLUMN IF NOT EXISTS migrated_at     TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS migration_batch TEXT;

-- audit_logs
ALTER TABLE public.audit_logs
  ADD COLUMN IF NOT EXISTS legacy_id       INTEGER,
  ADD COLUMN IF NOT EXISTS migrated_at     TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS migration_batch TEXT;

-- ============================================================
-- القسم 2: Indexes — غير تدميرية
-- ملاحظة: legacy_id يستخدم index عادي (ليس UNIQUE)
-- السبب: قبل migration القيمة NULL، وبعده قد تتكرر
-- بين batches مختلفة أو عند re-run — UNIQUE سيكسر ذلك.
-- ============================================================

-- appointments
CREATE INDEX IF NOT EXISTS appointments_user_id_idx
  ON public.appointments (user_id)
  WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS appointments_legacy_id_idx
  ON public.appointments (legacy_id)
  WHERE legacy_id IS NOT NULL;

-- financial_events
CREATE INDEX IF NOT EXISTS financial_events_user_id_idx
  ON public.financial_events (user_id)
  WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS financial_events_legacy_id_idx
  ON public.financial_events (legacy_id)
  WHERE legacy_id IS NOT NULL;

-- notifications
CREATE INDEX IF NOT EXISTS notifications_user_id_idx
  ON public.notifications (user_id)
  WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS notifications_legacy_id_idx
  ON public.notifications (legacy_id)
  WHERE legacy_id IS NOT NULL;

-- complaints
CREATE INDEX IF NOT EXISTS complaints_user_id_idx
  ON public.complaints (user_id)
  WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS complaints_legacy_id_idx
  ON public.complaints (legacy_id)
  WHERE legacy_id IS NOT NULL;

-- daily_messages
CREATE INDEX IF NOT EXISTS daily_messages_legacy_id_idx
  ON public.daily_messages (legacy_id)
  WHERE legacy_id IS NOT NULL;

-- story_templates
CREATE INDEX IF NOT EXISTS story_templates_legacy_id_idx
  ON public.story_templates (legacy_id)
  WHERE legacy_id IS NOT NULL;

-- themes
CREATE INDEX IF NOT EXISTS themes_legacy_id_idx
  ON public.themes (legacy_id)
  WHERE legacy_id IS NOT NULL;

-- news
CREATE INDEX IF NOT EXISTS news_legacy_id_idx
  ON public.news (legacy_id)
  WHERE legacy_id IS NOT NULL;

-- jobs
CREATE INDEX IF NOT EXISTS jobs_legacy_id_idx
  ON public.jobs (legacy_id)
  WHERE legacy_id IS NOT NULL;

-- public_events
CREATE INDEX IF NOT EXISTS public_events_legacy_id_idx
  ON public.public_events (legacy_id)
  WHERE legacy_id IS NOT NULL;

-- audit_logs
CREATE INDEX IF NOT EXISTS audit_logs_legacy_id_idx
  ON public.audit_logs (legacy_id)
  WHERE legacy_id IS NOT NULL;

-- ============================================================
-- القسم 3: تعليق تحقق
-- ============================================================
-- بعد التشغيل، تحقق باستخدام:
--
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_schema = 'public'
--   AND column_name IN ('legacy_id', 'migrated_at', 'migration_batch', 'user_id')
-- ORDER BY table_name, column_name;
-- ============================================================
