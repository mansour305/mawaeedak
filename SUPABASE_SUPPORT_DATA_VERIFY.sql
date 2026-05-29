-- ============================================================
-- SUPABASE_SUPPORT_DATA_VERIFY.sql — مواعيدك Phase 12E
-- queries للتحقق فقط — لا تعديل على البيانات
-- 2026-05-24
-- ============================================================

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 1. عدد الصفوف + user_id + legacy_id + migration_batch
-- المتوقع: notifications=3, complaints=3
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SELECT
  'notifications' AS table_name,
  COUNT(*) AS total_rows,
  COUNT(user_id) AS rows_with_user_id,
  COUNT(CASE WHEN user_id IS NULL THEN 1 END) AS rows_null_user_id,
  COUNT(legacy_id) AS rows_with_legacy_id,
  COUNT(CASE WHEN migration_batch = 'phase_12e_support_seed_2026_05_24' THEN 1 END) AS phase_12e_rows

FROM public.notifications

UNION ALL

SELECT
  'complaints',
  COUNT(*),
  COUNT(user_id),
  COUNT(CASE WHEN user_id IS NULL THEN 1 END),
  COUNT(legacy_id),
  COUNT(CASE WHEN migration_batch = 'phase_12e_support_seed_2026_05_24' THEN 1 END)
FROM public.complaints;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 2. notifications — JOIN مع auth.users
-- المتوقع: كل 3 صفوف مرتبطة بـ hrq@hotmail.com
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SELECT
  n.id,
  n.legacy_id,
  n.title,
  n.type,
  n.is_read,
  n.user_id,
  u.email,
  n.migration_batch
FROM public.notifications n
LEFT JOIN auth.users u ON u.id = n.user_id
ORDER BY n.legacy_id;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 3. complaints — sample rows (user_id يجب أن يكون NULL)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SELECT
  c.id,
  c.legacy_id,
  c.type,
  c.contact,
  c.status,
  c.user_id,
  c.migration_batch
FROM public.complaints c
ORDER BY c.legacy_id;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 4. تحقق عدم وجود duplicates على legacy_id
-- النتيجة المتوقعة: 0 صفوف
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SELECT 'notifications duplicates' AS check_name,
       legacy_id, COUNT(*) AS occurrences
FROM public.notifications
WHERE legacy_id IS NOT NULL
GROUP BY legacy_id
HAVING COUNT(*) > 1

UNION ALL

SELECT 'complaints duplicates', legacy_id, COUNT(*)
FROM public.complaints
WHERE legacy_id IS NOT NULL
GROUP BY legacy_id
HAVING COUNT(*) > 1;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 5. تحقق أن notifications لديها user_id (hrq)
-- المتوقع: notifications_missing_user_id = 0
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SELECT
  'notifications_missing_user_id' AS check_name,
  COUNT(*) AS count
FROM public.notifications
WHERE user_id IS NULL
  AND migration_batch = 'phase_12e_support_seed_2026_05_24';

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 6. ملخص إجمالي Supabase بعد Phase 12E
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SELECT 'daily_messages'   AS table_name, COUNT(*) AS rows FROM public.daily_messages UNION ALL
SELECT 'story_templates',                COUNT(*)          FROM public.story_templates UNION ALL
SELECT 'themes',                         COUNT(*)          FROM public.themes UNION ALL
SELECT 'news',                           COUNT(*)          FROM public.news UNION ALL
SELECT 'jobs',                           COUNT(*)          FROM public.jobs UNION ALL
SELECT 'appointments',                   COUNT(*)          FROM public.appointments UNION ALL
SELECT 'financial_events',               COUNT(*)          FROM public.financial_events UNION ALL
SELECT 'notifications',                  COUNT(*)          FROM public.notifications UNION ALL
SELECT 'complaints',                     COUNT(*)          FROM public.complaints;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 7. تحقق أن appointments/financial_events لم تُمس
-- المتوقع: نفس قيم Phase 12D
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SELECT
  'appointments_unchanged' AS check_name,
  COUNT(*) AS count,
  COUNT(CASE WHEN migration_batch = 'phase_12d_user_core_seed_2026_05_24' THEN 1 END) AS phase_12d_rows
FROM public.appointments

UNION ALL

SELECT
  'financial_events_unchanged',
  COUNT(*),
  COUNT(CASE WHEN migration_batch = 'phase_12d_user_core_seed_2026_05_24' THEN 1 END)
FROM public.financial_events;
