-- ============================================================
-- SUPABASE_USER_CORE_MIGRATION.sql — مواعيدك Phase 12D
-- User-owned Core Data Seed: appointments + financial_events
-- 2026-05-24
-- ============================================================
-- غير تدميري تماماً:
--   - لا DROP / لا TRUNCATE / لا DELETE
--   - لا تعديل على auth.users / user_roles / admin_users
--   - لا نقل notifications / complaints
--   - يستخدم WHERE NOT EXISTS — آمن للإعادة
--   - RAISE EXCEPTION واضح إذا hrq@hotmail.com غير موجود
--   - migration_batch = 'phase_12d_user_core_seed_2026_05_24'
-- ============================================================
-- ملاحظة RLS:
--   RLS policy "appointments_insert_own" تستخدم auth.uid().
--   عند التشغيل من Supabase SQL Editor بدور postgres (service role
--   الداخلي)، يتم bypass RLS تلقائياً — آمن بدون service_role key.
-- ============================================================
-- التشغيل: Supabase SQL Editor → Run
-- ============================================================

DO $$
DECLARE
  hrq_user_id UUID;
BEGIN

  -- ────────────────────────────────────────────────────────
  -- خطوة 1: جلب user_id الخاص بـ hrq@hotmail.com
  -- ────────────────────────────────────────────────────────
  SELECT id INTO hrq_user_id
  FROM auth.users
  WHERE email = 'hrq@hotmail.com';

  IF hrq_user_id IS NULL THEN
    RAISE EXCEPTION
      'المستخدم hrq@hotmail.com غير موجود في auth.users — تأكد من تسجيل الدخول مرة واحدة على الأقل قبل التشغيل';
  END IF;

  RAISE NOTICE 'hrq@hotmail.com user_id = %', hrq_user_id;

  -- ────────────────────────────────────────────────────────
  -- خطوة 2: appointments (2 صفوف)
  -- columns: user_id, title, description, date, time,
  --          category, color, priority, reminder_enabled,
  --          legacy_id, migrated_at, migration_batch
  -- ────────────────────────────────────────────────────────

  INSERT INTO public.appointments
    (user_id, title, description, date, time, category, color, priority,
     reminder_enabled, legacy_id, migrated_at, migration_batch)
  SELECT
    hrq_user_id,
    'موعد طبي',
    'مراجعة المستشفى — فحص دوري',
    '2026-05-28', '10:00', 'صحة', '#4CAF50', 'high',
    TRUE, 1, NOW(), 'phase_12d_user_core_seed_2026_05_24'
  WHERE NOT EXISTS (
    SELECT 1 FROM public.appointments WHERE legacy_id = 1
  );

  INSERT INTO public.appointments
    (user_id, title, description, date, time, category, color, priority,
     reminder_enabled, legacy_id, migrated_at, migration_batch)
  SELECT
    hrq_user_id,
    'تجديد الرخصة',
    'تجديد رخصة القيادة في المرور',
    '2026-06-01', '09:00', 'شخصي', '#2196F3', 'medium',
    TRUE, 2, NOW(), 'phase_12d_user_core_seed_2026_05_24'
  WHERE NOT EXISTS (
    SELECT 1 FROM public.appointments WHERE legacy_id = 2
  );

  RAISE NOTICE 'appointments: done';

  -- ────────────────────────────────────────────────────────
  -- خطوة 3: financial_events (8 صفوف)
  -- columns: user_id, name, type, next_date, amount, notes,
  --          is_active, reminder_days_before,
  --          legacy_id, migrated_at, migration_batch
  -- ملاحظة: amount مخزون كـ numeric — القيمة الحالية 0 لكل الصفوف
  -- ────────────────────────────────────────────────────────

  INSERT INTO public.financial_events
    (user_id, name, type, next_date, amount, notes, is_active,
     reminder_days_before, legacy_id, migrated_at, migration_batch)
  SELECT
    hrq_user_id,
    'الراتب الشهري', 'salary', '2026-06-01',
    0::numeric, 'راتب أول الشهر', TRUE, 3,
    1, NOW(), 'phase_12d_user_core_seed_2026_05_24'
  WHERE NOT EXISTS (
    SELECT 1 FROM public.financial_events WHERE legacy_id = 1
  );

  INSERT INTO public.financial_events
    (user_id, name, type, next_date, amount, notes, is_active,
     reminder_days_before, legacy_id, migrated_at, migration_batch)
  SELECT
    hrq_user_id,
    'حساب المواطن', 'support', '2026-06-10',
    0::numeric, 'دعم نقدي شهري', TRUE, 3,
    2, NOW(), 'phase_12d_user_core_seed_2026_05_24'
  WHERE NOT EXISTS (
    SELECT 1 FROM public.financial_events WHERE legacy_id = 2
  );

  INSERT INTO public.financial_events
    (user_id, name, type, next_date, amount, notes, is_active,
     reminder_days_before, legacy_id, migrated_at, migration_batch)
  SELECT
    hrq_user_id,
    'الضمان الاجتماعي', 'support', '2026-05-25',
    0::numeric, 'مستحق الضمان', TRUE, 3,
    3, NOW(), 'phase_12d_user_core_seed_2026_05_24'
  WHERE NOT EXISTS (
    SELECT 1 FROM public.financial_events WHERE legacy_id = 3
  );

  INSERT INTO public.financial_events
    (user_id, name, type, next_date, amount, notes, is_active,
     reminder_days_before, legacy_id, migrated_at, migration_batch)
  SELECT
    hrq_user_id,
    'حافز', 'support', '2026-06-15',
    0::numeric, 'برنامج حافز', TRUE, 3,
    4, NOW(), 'phase_12d_user_core_seed_2026_05_24'
  WHERE NOT EXISTS (
    SELECT 1 FROM public.financial_events WHERE legacy_id = 4
  );

  INSERT INTO public.financial_events
    (user_id, name, type, next_date, amount, notes, is_active,
     reminder_days_before, legacy_id, migrated_at, migration_batch)
  SELECT
    hrq_user_id,
    'الدعم السكني', 'support', '2026-06-30',
    0::numeric, 'دعم وزارة الإسكان', TRUE, 5,
    5, NOW(), 'phase_12d_user_core_seed_2026_05_24'
  WHERE NOT EXISTS (
    SELECT 1 FROM public.financial_events WHERE legacy_id = 5
  );

  INSERT INTO public.financial_events
    (user_id, name, type, next_date, amount, notes, is_active,
     reminder_days_before, legacy_id, migrated_at, migration_batch)
  SELECT
    hrq_user_id,
    'ساند / التأمينات', 'support', '2026-06-20',
    0::numeric, 'تأمين ضد التعطل', TRUE, 3,
    6, NOW(), 'phase_12d_user_core_seed_2026_05_24'
  WHERE NOT EXISTS (
    SELECT 1 FROM public.financial_events WHERE legacy_id = 6
  );

  INSERT INTO public.financial_events
    (user_id, name, type, next_date, amount, notes, is_active,
     reminder_days_before, legacy_id, migrated_at, migration_batch)
  SELECT
    hrq_user_id,
    'التقاعد', 'salary', '2026-06-01',
    0::numeric, 'راتب التقاعد', TRUE, 3,
    7, NOW(), 'phase_12d_user_core_seed_2026_05_24'
  WHERE NOT EXISTS (
    SELECT 1 FROM public.financial_events WHERE legacy_id = 7
  );

  INSERT INTO public.financial_events
    (user_id, name, type, next_date, amount, notes, is_active,
     reminder_days_before, legacy_id, migrated_at, migration_batch)
  SELECT
    hrq_user_id,
    'الدعم الزراعي', 'support', '2026-07-08',
    0::numeric, 'دعم وزارة البيئة والمياه والزراعة', TRUE, 5,
    8, NOW(), 'phase_12d_user_core_seed_2026_05_24'
  WHERE NOT EXISTS (
    SELECT 1 FROM public.financial_events WHERE legacy_id = 8
  );

  RAISE NOTICE 'financial_events: done';
  RAISE NOTICE 'Phase 12D migration complete — user_id: %', hrq_user_id;

END;
$$;

-- ============================================================
-- للتحقق بعد التشغيل — شغّل SUPABASE_USER_CORE_VERIFY.sql
-- ============================================================
