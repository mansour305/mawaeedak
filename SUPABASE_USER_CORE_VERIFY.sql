-- ============================================================
-- SUPABASE_USER_CORE_VERIFY.sql — مواعيدك Phase 12D
-- queries للتحقق فقط — لا تعديل على البيانات
-- 2026-05-24
-- ============================================================

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 1. عدد الصفوف + user_id + legacy_id + migration_batch
-- المتوقع: appointments=2, financial_events=8
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SELECT
  'appointments' AS table_name,
  COUNT(*) AS total_rows,
  COUNT(user_id) AS rows_with_user_id,
  COUNT(legacy_id) AS rows_with_legacy_id,
  COUNT(CASE WHEN migration_batch = 'phase_12d_user_core_seed_2026_05_24' THEN 1 END) AS phase_12d_rows

FROM public.appointments

UNION ALL

SELECT
  'financial_events',
  COUNT(*),
  COUNT(user_id),
  COUNT(legacy_id),
  COUNT(CASE WHEN migration_batch = 'phase_12d_user_core_seed_2026_05_24' THEN 1 END)
FROM public.financial_events;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 2. التحقق أن user_id مربوط بـ hrq@hotmail.com
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SELECT
  a.id,
  a.title,
  a.user_id,
  u.email,
  a.legacy_id,
  a.migration_batch
FROM public.appointments a
JOIN auth.users u ON u.id = a.user_id
ORDER BY a.legacy_id;

SELECT
  f.id,
  f.name,
  f.type,
  f.user_id,
  u.email,
  f.legacy_id,
  f.migration_batch
FROM public.financial_events f
JOIN auth.users u ON u.id = f.user_id
ORDER BY f.legacy_id;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 3. تحقق عدم وجود duplicates على legacy_id
-- النتيجة المتوقعة: 0 صفوف
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SELECT 'appointments duplicates' AS check_name,
       legacy_id, COUNT(*) AS occurrences
FROM public.appointments
WHERE legacy_id IS NOT NULL
GROUP BY legacy_id
HAVING COUNT(*) > 1

UNION ALL

SELECT 'financial_events duplicates', legacy_id, COUNT(*)
FROM public.financial_events
WHERE legacy_id IS NOT NULL
GROUP BY legacy_id
HAVING COUNT(*) > 1;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 4. تحقق الجداول الشخصية الأخرى فارغة (لم تُنقل)
-- المتوقع: notifications=0, complaints=0
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SELECT 'notifications' AS personal_table, COUNT(*) AS row_count
FROM public.notifications
UNION ALL
SELECT 'complaints', COUNT(*) FROM public.complaints;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 5. التحقق أن hrq@hotmail.com موجود في auth.users
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SELECT id, email, created_at
FROM auth.users
WHERE email = 'hrq@hotmail.com';

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 6. ملخص admin-managed seed (Phase 12C) لا تزال موجودة
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SELECT 'daily_messages' AS table_name, COUNT(*) FROM public.daily_messages UNION ALL
SELECT 'story_templates', COUNT(*) FROM public.story_templates UNION ALL
SELECT 'themes', COUNT(*) FROM public.themes UNION ALL
SELECT 'news', COUNT(*) FROM public.news UNION ALL
SELECT 'jobs', COUNT(*) FROM public.jobs;
