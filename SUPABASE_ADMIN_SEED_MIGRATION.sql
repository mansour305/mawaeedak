-- ============================================================
-- SUPABASE_ADMIN_SEED_MIGRATION.sql — مواعيدك Phase 12C
-- Admin-managed Data Seed Migration
-- 2026-05-24
-- ============================================================
-- غير تدميري تماماً:
--   - لا DROP / لا TRUNCATE / لا DELETE
--   - لا بيانات شخصية (لا appointments/financial_events/notifications/complaints)
--   - لا auth.users / لا profiles / لا user_roles
--   - يستخدم WHERE NOT EXISTS — آمن للإعادة مرات متعددة
--   - migration_batch = 'phase_12c_admin_seed_2026_05_24'
-- ============================================================
-- الجداول المُنقلة:
--   1. daily_messages  (8 صفوف)
--   2. story_templates (2 صفوف)
--   3. themes          (10 صفوف)
--   4. news            (2 صفوف)
--   5. jobs            (2 صفوف)
--   6. public_events   (0 صفوف — مُتجاهَل)
-- ============================================================
-- التشغيل: Supabase SQL Editor → يعمل بصلاحيات anon/admin
-- ============================================================

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 1. daily_messages (8 صفوف)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

INSERT INTO public.daily_messages
  (message, display_date, is_active, legacy_id, migrated_at, migration_batch)
SELECT
  'من رتّب يومه ملك وقته.', NULL, TRUE, 1,
  NOW(), 'phase_12c_admin_seed_2026_05_24'
WHERE NOT EXISTS (
  SELECT 1 FROM public.daily_messages WHERE legacy_id = 1
);

INSERT INTO public.daily_messages
  (message, display_date, is_active, legacy_id, migrated_at, migration_batch)
SELECT
  'الصبر مفتاح الفرج، وما أقرب الفرج من أهل الصبر.', NULL, TRUE, 2,
  NOW(), 'phase_12c_admin_seed_2026_05_24'
WHERE NOT EXISTS (
  SELECT 1 FROM public.daily_messages WHERE legacy_id = 2
);

INSERT INTO public.daily_messages
  (message, display_date, is_active, legacy_id, migrated_at, migration_batch)
SELECT
  'يومك يبدأ بقرار، فاجعله قراراً نافعاً.', NULL, TRUE, 3,
  NOW(), 'phase_12c_admin_seed_2026_05_24'
WHERE NOT EXISTS (
  SELECT 1 FROM public.daily_messages WHERE legacy_id = 3
);

INSERT INTO public.daily_messages
  (message, display_date, is_active, legacy_id, migrated_at, migration_batch)
SELECT
  'الوقت إذا حُفظ أثمر.', NULL, TRUE, 4,
  NOW(), 'phase_12c_admin_seed_2026_05_24'
WHERE NOT EXISTS (
  SELECT 1 FROM public.daily_messages WHERE legacy_id = 4
);

INSERT INTO public.daily_messages
  (message, display_date, is_active, legacy_id, migrated_at, migration_batch)
SELECT
  'رتّب مواعيدك، ترتّب أولوياتك.', NULL, TRUE, 5,
  NOW(), 'phase_12c_admin_seed_2026_05_24'
WHERE NOT EXISTS (
  SELECT 1 FROM public.daily_messages WHERE legacy_id = 5
);

INSERT INTO public.daily_messages
  (message, display_date, is_active, legacy_id, migrated_at, migration_batch)
SELECT
  'كل موعد له وقته، وكل وقت له قيمة.', NULL, TRUE, 6,
  NOW(), 'phase_12c_admin_seed_2026_05_24'
WHERE NOT EXISTS (
  SELECT 1 FROM public.daily_messages WHERE legacy_id = 6
);

INSERT INTO public.daily_messages
  (message, display_date, is_active, legacy_id, migrated_at, migration_batch)
SELECT
  'خذ من يومك ما يعينك على غدك.', NULL, TRUE, 7,
  NOW(), 'phase_12c_admin_seed_2026_05_24'
WHERE NOT EXISTS (
  SELECT 1 FROM public.daily_messages WHERE legacy_id = 7
);

INSERT INTO public.daily_messages
  (message, display_date, is_active, legacy_id, migrated_at, migration_batch)
SELECT
  'البداية المنظمة تختصر نصف الطريق.', NULL, TRUE, 8,
  NOW(), 'phase_12c_admin_seed_2026_05_24'
WHERE NOT EXISTS (
  SELECT 1 FROM public.daily_messages WHERE legacy_id = 8
);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 2. story_templates (2 صفوف)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

INSERT INTO public.story_templates
  (name, description, template_text, background_color, text_color,
   is_active, legacy_id, migrated_at, migration_batch)
SELECT
  'القالب الافتراضي',
  'قالب ستوري اليوم الأساسي بتصميم التراث',
  E'📅 {date}\n\n💬 {message}\n\n🕌 الصلاة القادمة: {next_prayer} بعد {time_remaining}\n\n💰 {financial_summary}\n\n— مواعيدك',
  '#8B6914',
  '#FFF8E7',
  TRUE, 1,
  NOW(), 'phase_12c_admin_seed_2026_05_24'
WHERE NOT EXISTS (
  SELECT 1 FROM public.story_templates WHERE legacy_id = 1
);

INSERT INTO public.story_templates
  (name, description, template_text, background_color, text_color,
   is_active, legacy_id, migrated_at, migration_batch)
SELECT
  'القالب التراثي البسيط',
  'قالب مختصر بروح التراث السعودي',
  E'بسم الله الرحمن الرحيم\n\n{date}\n\n{message}\n\n— مواعيدك',
  '#5C4A1E',
  '#F5E6C8',
  TRUE, 2,
  NOW(), 'phase_12c_admin_seed_2026_05_24'
WHERE NOT EXISTS (
  SELECT 1 FROM public.story_templates WHERE legacy_id = 2
);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 3. themes (10 صفوف)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

INSERT INTO public.themes
  (name, slug, description, colors, is_active, is_available, tier,
   legacy_id, migrated_at, migration_batch)
SELECT
  'التراث التقني الفاخر', 'heritage',
  'ثيم ذهبي/نحاسي/بيج — الثيم الافتراضي',
  '{"text":"#3D2B1F","primary":"#8B6914","secondary":"#C4963A","background":"#FFF8E7"}'::jsonb,
  TRUE, TRUE, 'free', 1, NOW(), 'phase_12c_admin_seed_2026_05_24'
WHERE NOT EXISTS (
  SELECT 1 FROM public.themes WHERE legacy_id = 1
);

INSERT INTO public.themes
  (name, slug, description, colors, is_active, is_available, tier,
   legacy_id, migrated_at, migration_batch)
SELECT
  'الليل الهادئ', 'dark-night',
  'ثيم داكن للاستخدام الليلي',
  '{"text":"#E8E8F0","primary":"#4A90D9","secondary":"#7BB3F0","background":"#1A1A2E"}'::jsonb,
  TRUE, TRUE, 'free', 2, NOW(), 'phase_12c_admin_seed_2026_05_24'
WHERE NOT EXISTS (
  SELECT 1 FROM public.themes WHERE legacy_id = 2
);

INSERT INTO public.themes
  (name, slug, description, colors, is_active, is_available, tier,
   legacy_id, migrated_at, migration_batch)
SELECT
  'الفجر الذهبي', 'golden-dawn',
  'ثيم فاتح بألوان الفجر الذهبية',
  '{"text":"#2D1B00","primary":"#D4A017","secondary":"#F0C040","background":"#FFFDF0"}'::jsonb,
  TRUE, TRUE, 'free', 3, NOW(), 'phase_12c_admin_seed_2026_05_24'
WHERE NOT EXISTS (
  SELECT 1 FROM public.themes WHERE legacy_id = 3
);

INSERT INTO public.themes
  (name, slug, description, colors, is_active, is_available, tier,
   legacy_id, migrated_at, migration_batch)
SELECT
  'السعودي النظيف', 'saudi-clean',
  'أخضر نقي بتصميم سعودي حديث',
  '{"card":"#FFFFFF","text":"#1A1A1A","border":"#E8E8E8","primary":"#2D7A4F","secondary":"#D6F0E0","background":"#FFFFFF"}'::jsonb,
  TRUE, TRUE, 'free', 4, NOW(), 'phase_12c_admin_seed_2026_05_24'
WHERE NOT EXISTS (
  SELECT 1 FROM public.themes WHERE legacy_id = 4
);

INSERT INTO public.themes
  (name, slug, description, colors, is_active, is_available, tier,
   legacy_id, migrated_at, migration_batch)
SELECT
  'الليلي الذهبي', 'night-gold',
  'ذهبي داكن للاستخدام الليلي المميز',
  '{"card":"#20203A","text":"#F0E8C0","border":"#D4A017","primary":"#D4A017","secondary":"#2A2A40","background":"#16162A"}'::jsonb,
  TRUE, TRUE, 'free', 5, NOW(), 'phase_12c_admin_seed_2026_05_24'
WHERE NOT EXISTS (
  SELECT 1 FROM public.themes WHERE legacy_id = 5
);

INSERT INTO public.themes
  (name, slug, description, colors, is_active, is_available, tier,
   legacy_id, migrated_at, migration_batch)
SELECT
  'التراث النجدي', 'najdi',
  'ألوان التراث النجدي الأصيل بني/ذهبي',
  '{"card":"#F0E0CC","text":"#3D1F0A","border":"#C9A87C","primary":"#8B5E3C","secondary":"#C9A87C","background":"#FAF0E6"}'::jsonb,
  TRUE, TRUE, 'free', 6, NOW(), 'phase_12c_admin_seed_2026_05_24'
WHERE NOT EXISTS (
  SELECT 1 FROM public.themes WHERE legacy_id = 6
);

INSERT INTO public.themes
  (name, slug, description, colors, is_active, is_available, tier,
   legacy_id, migrated_at, migration_batch)
SELECT
  'الأبيض الرسمي', 'white-formal',
  'تصميم مؤسسي رسمي نظيف',
  '{"card":"#FFFFFF","text":"#1A1A2E","border":"#D0D7DE","primary":"#1A5276","secondary":"#D6EAF8","background":"#FAFAFA"}'::jsonb,
  TRUE, TRUE, 'free', 7, NOW(), 'phase_12c_admin_seed_2026_05_24'
WHERE NOT EXISTS (
  SELECT 1 FROM public.themes WHERE legacy_id = 7
);

INSERT INTO public.themes
  (name, slug, description, colors, is_active, is_available, tier,
   legacy_id, migrated_at, migration_batch)
SELECT
  'النباتي الناعم', 'botanical',
  'أخضر طبيعي هادئ مستوحى من الطبيعة',
  '{"card":"#EBF5EB","text":"#1C3A20","border":"#B8D8BE","primary":"#4A8C5C","secondary":"#D4EDDA","background":"#F7FBF7"}'::jsonb,
  TRUE, TRUE, 'free', 8, NOW(), 'phase_12c_admin_seed_2026_05_24'
WHERE NOT EXISTS (
  SELECT 1 FROM public.themes WHERE legacy_id = 8
);

INSERT INTO public.themes
  (name, slug, description, colors, is_active, is_available, tier,
   legacy_id, migrated_at, migration_batch)
SELECT
  'الصحراوي المعاصر', 'desert',
  'ألوان الصحراء الدافئة مع لمسة معاصرة',
  '{"card":"#F5E8D0","text":"#4A2810","border":"#E0C8A0","primary":"#D2691E","secondary":"#FAEBD7","background":"#FAF4E8"}'::jsonb,
  TRUE, TRUE, 'free', 9, NOW(), 'phase_12c_admin_seed_2026_05_24'
WHERE NOT EXISTS (
  SELECT 1 FROM public.themes WHERE legacy_id = 9
);

INSERT INTO public.themes
  (name, slug, description, colors, is_active, is_available, tier,
   legacy_id, migrated_at, migration_batch)
SELECT
  'المعماري الهادئ', 'architectural',
  'رمادي معماري هادئ بخطوط نظيفة',
  '{"card":"#FFFFFF","text":"#2C3035","border":"#D5D2CE","primary":"#5D6D7E","secondary":"#EAE8E5","background":"#F5F4F2"}'::jsonb,
  TRUE, TRUE, 'free', 10, NOW(), 'phase_12c_admin_seed_2026_05_24'
WHERE NOT EXISTS (
  SELECT 1 FROM public.themes WHERE legacy_id = 10
);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 4. news (2 صفوف)
-- Supabase columns: title, body, category, source, image_url,
--                   is_published, published_at, created_at
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

INSERT INTO public.news
  (title, body, category, source, image_url, is_published, published_at,
   legacy_id, migrated_at, migration_batch)
SELECT
  'إطلاق منصة مواعيدك للإدارة اليومية',
  'أُطلقت منصة مواعيدك لتقديم حلول متكاملة لإدارة المواعيد والموارد المالية اليومية.',
  'تقنية', 'مواعيدك', NULL,
  TRUE, '2026-05-24 03:51:46+00'::timestamptz,
  1, NOW(), 'phase_12c_admin_seed_2026_05_24'
WHERE NOT EXISTS (
  SELECT 1 FROM public.news WHERE legacy_id = 1
);

INSERT INTO public.news
  (title, body, category, source, image_url, is_published, published_at,
   legacy_id, migrated_at, migration_batch)
SELECT
  'نصائح لتنظيم وقتك اليومي',
  'خبراء الإنتاجية يقدمون أبرز النصائح لتنظيم المواعيد وضبط الأولويات.',
  'مجتمع', 'مواعيدك', NULL,
  TRUE, '2026-05-24 03:51:46+00'::timestamptz,
  2, NOW(), 'phase_12c_admin_seed_2026_05_24'
WHERE NOT EXISTS (
  SELECT 1 FROM public.news WHERE legacy_id = 2
);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 5. jobs (2 صفوف)
-- Supabase columns: title, employer, sector, city, description,
--                   apply_url, deadline, is_active
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

INSERT INTO public.jobs
  (title, employer, sector, city, description, apply_url, deadline, is_active,
   legacy_id, migrated_at, migration_batch)
SELECT
  'مطوّر تطبيقات جوال',
  'شركة التقنية الذكية',
  'تقنية المعلومات',
  'الرياض',
  'مطلوب مطوّر React Native لتطوير تطبيقات الجوال.',
  NULL, '2026-06-23',
  TRUE, 1, NOW(), 'phase_12c_admin_seed_2026_05_24'
WHERE NOT EXISTS (
  SELECT 1 FROM public.jobs WHERE legacy_id = 1
);

INSERT INTO public.jobs
  (title, employer, sector, city, description, apply_url, deadline, is_active,
   legacy_id, migrated_at, migration_batch)
SELECT
  'محاسب مالي',
  'مجموعة الأفق التجارية',
  'المالية والمحاسبة',
  'جدة',
  'خبرة لا تقل عن ثلاث سنوات في المحاسبة والتقارير المالية.',
  NULL, '2026-06-14',
  TRUE, 2, NOW(), 'phase_12c_admin_seed_2026_05_24'
WHERE NOT EXISTS (
  SELECT 1 FROM public.jobs WHERE legacy_id = 2
);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 6. public_events — 0 صفوف في PostgreSQL — لا seed مطلوب
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- ============================================================
-- للتحقق بعد التشغيل — شغّل SUPABASE_ADMIN_SEED_VERIFY.sql
-- ============================================================
