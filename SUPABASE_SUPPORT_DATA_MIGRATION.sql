-- ============================================================
-- SUPABASE_SUPPORT_DATA_MIGRATION.sql — مواعيدك Phase 12E
-- Support Data Seed: notifications + complaints
-- 2026-05-24
-- ============================================================
-- غير تدميري تماماً:
--   - لا DROP / لا TRUNCATE / لا DELETE
--   - لا تعديل على auth.users / user_roles / admin_users
--   - لا نقل appointments / financial_events / profiles
--   - WHERE NOT EXISTS على legacy_id — آمن للإعادة
--   - RAISE EXCEPTION واضح إذا hrq@hotmail.com غير موجود
--   - migration_batch = 'phase_12e_support_seed_2026_05_24'
-- ============================================================
-- user_id strategy:
--   notifications: تُربط بـ hrq@hotmail.com (المستخدم الوحيد الموثق)
--   complaints:    user_id = NULL (المرسِلون بعناوين مجهولة/مختلفة)
--                  ON DELETE SET NULL — safe
-- ============================================================
-- RLS bypass:
--   SQL Editor يعمل بدور postgres — يتجاوز RLS تلقائياً.
--   لا يحتاج service_role key.
-- ============================================================
-- التشغيل: Supabase SQL Editor → Run
-- ============================================================

DO $$
DECLARE
  hrq_user_id UUID;
BEGIN

  -- ────────────────────────────────────────────────────────
  -- خطوة 1: جلب user_id لـ hrq@hotmail.com
  -- ────────────────────────────────────────────────────────
  SELECT id INTO hrq_user_id
  FROM auth.users
  WHERE email = 'hrq@hotmail.com';

  IF hrq_user_id IS NULL THEN
    RAISE EXCEPTION
      'المستخدم hrq@hotmail.com غير موجود في auth.users — تأكد من تسجيل الدخول مرة واحدة قبل التشغيل';
  END IF;

  RAISE NOTICE 'hrq@hotmail.com user_id = %', hrq_user_id;

  -- ────────────────────────────────────────────────────────
  -- خطوة 2: notifications (3 صفوف)
  -- columns: user_id, title, body, type, is_read,
  --          legacy_id, migrated_at, migration_batch
  -- ────────────────────────────────────────────────────────
  -- user_id: hrq@hotmail.com (المستخدم الوحيد — إشعارات النظام)

  INSERT INTO public.notifications
    (user_id, title, body, type, is_read,
     legacy_id, migrated_at, migration_batch)
  SELECT
    hrq_user_id,
    'مرحباً بك في مواعيدك',
    'تم إعداد المنصة بنجاح. يمكنك الآن إدارة مواعيدك ومصادرك المالية.',
    'general', TRUE,
    1, NOW(), 'phase_12e_support_seed_2026_05_24'
  WHERE NOT EXISTS (
    SELECT 1 FROM public.notifications WHERE legacy_id = 1
  );

  INSERT INTO public.notifications
    (user_id, title, body, type, is_read,
     legacy_id, migrated_at, migration_batch)
  SELECT
    hrq_user_id,
    'تذكير: موعد قادم',
    'لديك مواعيد قادمة هذا الأسبوع، تحقق من التقويم.',
    'reminder', TRUE,
    2, NOW(), 'phase_12e_support_seed_2026_05_24'
  WHERE NOT EXISTS (
    SELECT 1 FROM public.notifications WHERE legacy_id = 2
  );

  INSERT INTO public.notifications
    (user_id, title, body, type, is_read,
     legacy_id, migrated_at, migration_batch)
  SELECT
    hrq_user_id,
    'اختبار إشعار داخلي',
    'هذه رسالة اختبار من لوحة المالك',
    'system', TRUE,
    3, NOW(), 'phase_12e_support_seed_2026_05_24'
  WHERE NOT EXISTS (
    SELECT 1 FROM public.notifications WHERE legacy_id = 3
  );

  RAISE NOTICE 'notifications: done (3 rows)';

  -- ────────────────────────────────────────────────────────
  -- خطوة 3: complaints (3 صفوف)
  -- columns: user_id, type, message, contact, status,
  --          legacy_id, migrated_at, migration_batch
  -- ────────────────────────────────────────────────────────
  -- user_id: NULL — المرسِلون بعناوين مختلفة (anonymous)
  --   id=1: test@test.com
  --   id=2: qa@test.sa
  --   id=3: support-qa@test.sa

  INSERT INTO public.complaints
    (user_id, type, message, contact, status,
     legacy_id, migrated_at, migration_batch)
  SELECT
    NULL::UUID,
    'استفسار',
    '[اختبار اتصل بنا]' || E'\n\n' || 'هذا اختبار للنموذج',
    'test@test.com',
    'pending',
    1, NOW(), 'phase_12e_support_seed_2026_05_24'
  WHERE NOT EXISTS (
    SELECT 1 FROM public.complaints WHERE legacy_id = 1
  );

  INSERT INTO public.complaints
    (user_id, type, message, contact, status,
     legacy_id, migrated_at, migration_batch)
  SELECT
    NULL::UUID,
    'اقتراح',
    'اختبار اقتراح تحقق — Phase 7 Closure',
    'qa@test.sa',
    'pending',
    2, NOW(), 'phase_12e_support_seed_2026_05_24'
  WHERE NOT EXISTS (
    SELECT 1 FROM public.complaints WHERE legacy_id = 2
  );

  INSERT INTO public.complaints
    (user_id, type, message, contact, status,
     legacy_id, migrated_at, migration_batch)
  SELECT
    NULL::UUID,
    'استفسار',
    '[اختبار تواصل تحقق]' || E'\n\n' || 'رسالة اختبار اتصل بنا — Phase 7',
    'support-qa@test.sa',
    'pending',
    3, NOW(), 'phase_12e_support_seed_2026_05_24'
  WHERE NOT EXISTS (
    SELECT 1 FROM public.complaints WHERE legacy_id = 3
  );

  RAISE NOTICE 'complaints: done (3 rows)';
  RAISE NOTICE 'Phase 12E migration complete — user_id: %', hrq_user_id;

END;
$$;

-- ============================================================
-- للتحقق بعد التشغيل — شغّل SUPABASE_SUPPORT_DATA_VERIFY.sql
-- ============================================================
