-- ============================================================
-- SUPABASE_ADMIN_SEED_VERIFY.sql — مواعيدك Phase 12C
-- queries للتحقق فقط — لا تعديل على البيانات
-- 2026-05-24
-- ============================================================
-- شغّل هذا الملف بعد SUPABASE_ADMIN_SEED_MIGRATION.sql
-- ============================================================

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 1. عدد الصفوف في كل جدول
-- المتوقع: daily_messages=8, story_templates=2, themes=10,
--          news=2, jobs=2, public_events=0
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SELECT 'daily_messages'  AS table_name, COUNT(*) AS total_rows,
       COUNT(legacy_id)  AS rows_with_legacy_id,
       COUNT(CASE WHEN migration_batch = 'phase_12c_admin_seed_2026_05_24' THEN 1 END) AS phase_12c_rows
FROM public.daily_messages

UNION ALL

SELECT 'story_templates', COUNT(*), COUNT(legacy_id),
       COUNT(CASE WHEN migration_batch = 'phase_12c_admin_seed_2026_05_24' THEN 1 END)
FROM public.story_templates

UNION ALL

SELECT 'themes', COUNT(*), COUNT(legacy_id),
       COUNT(CASE WHEN migration_batch = 'phase_12c_admin_seed_2026_05_24' THEN 1 END)
FROM public.themes

UNION ALL

SELECT 'news', COUNT(*), COUNT(legacy_id),
       COUNT(CASE WHEN migration_batch = 'phase_12c_admin_seed_2026_05_24' THEN 1 END)
FROM public.news

UNION ALL

SELECT 'jobs', COUNT(*), COUNT(legacy_id),
       COUNT(CASE WHEN migration_batch = 'phase_12c_admin_seed_2026_05_24' THEN 1 END)
FROM public.jobs

UNION ALL

SELECT 'public_events', COUNT(*), COUNT(legacy_id),
       COUNT(CASE WHEN migration_batch = 'phase_12c_admin_seed_2026_05_24' THEN 1 END)
FROM public.public_events;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 2. تحقق legacy_id محفوظ في كل جدول
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SELECT 'daily_messages' AS table_name, legacy_id, migrated_at, migration_batch
FROM public.daily_messages
WHERE legacy_id IS NOT NULL
ORDER BY legacy_id;

SELECT 'story_templates' AS table_name, legacy_id, migrated_at, migration_batch
FROM public.story_templates
WHERE legacy_id IS NOT NULL
ORDER BY legacy_id;

SELECT 'themes' AS table_name, legacy_id, slug, migration_batch
FROM public.themes
WHERE legacy_id IS NOT NULL
ORDER BY legacy_id;

SELECT 'news' AS table_name, legacy_id, title, migration_batch
FROM public.news
WHERE legacy_id IS NOT NULL
ORDER BY legacy_id;

SELECT 'jobs' AS table_name, legacy_id, title, migration_batch
FROM public.jobs
WHERE legacy_id IS NOT NULL
ORDER BY legacy_id;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 3. تحقق عدم وجود بيانات شخصية في جداول admin-managed
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SELECT 'appointments' AS personal_table, COUNT(*) AS row_count FROM public.appointments
UNION ALL
SELECT 'financial_events', COUNT(*) FROM public.financial_events
UNION ALL
SELECT 'notifications', COUNT(*) FROM public.notifications
UNION ALL
SELECT 'complaints', COUNT(*) FROM public.complaints;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 4. عينات — أول صف من كل جدول
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SELECT id, message, is_active, legacy_id, migration_batch
FROM public.daily_messages ORDER BY legacy_id LIMIT 3;

SELECT id, name, slug, is_active, legacy_id, migration_batch
FROM public.themes ORDER BY legacy_id LIMIT 3;

SELECT id, title, category, is_published, legacy_id, migration_batch
FROM public.news ORDER BY legacy_id;

SELECT id, title, employer, city, legacy_id, migration_batch
FROM public.jobs ORDER BY legacy_id;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 5. تحقق لا يوجد تكرار في legacy_id داخل نفس الجدول
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SELECT 'daily_messages duplicates' AS check_name,
       legacy_id, COUNT(*) AS occurrences
FROM public.daily_messages
WHERE legacy_id IS NOT NULL
GROUP BY legacy_id
HAVING COUNT(*) > 1

UNION ALL

SELECT 'themes duplicates', legacy_id, COUNT(*)
FROM public.themes
WHERE legacy_id IS NOT NULL
GROUP BY legacy_id
HAVING COUNT(*) > 1

UNION ALL

SELECT 'news duplicates', legacy_id, COUNT(*)
FROM public.news
WHERE legacy_id IS NOT NULL
GROUP BY legacy_id
HAVING COUNT(*) > 1

UNION ALL

SELECT 'jobs duplicates', legacy_id, COUNT(*)
FROM public.jobs
WHERE legacy_id IS NOT NULL
GROUP BY legacy_id
HAVING COUNT(*) > 1;

-- النتيجة المتوقعة: 0 صفوف (لا تكرار)
