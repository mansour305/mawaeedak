# SUPABASE_ADMIN_SEED_COUNTS.md — مواعيدك Phase 12C
**التاريخ:** 2026-05-24 | Phase 12C Admin Seed

---

## ملخص الحالة

| المصدر | الوضع |
|---|---|
| PostgreSQL/Drizzle | مصدر الحقيقة الحالي ✅ |
| Supabase | جاهز لاستقبال seed — لا يزال فارغاً |
| seed تم تشغيله؟ | ينتظر تشغيل المستخدم في Supabase SQL Editor |

---

## عدد الصفوف في PostgreSQL (قبل / مصدر الحقيقة)

| الجدول | عدد الصفوف | قرار Seed |
|---|---|---|
| `daily_messages` | 8 | ✅ مُدرَج في seed |
| `story_templates` | 2 | ✅ مُدرَج في seed |
| `themes` | 10 | ✅ مُدرَج في seed |
| `news` | 2 | ✅ مُدرَج في seed |
| `jobs` | 2 | ✅ مُدرَج في seed |
| `public_events` | 0 | ⏭️ مُتجاهَل — لا بيانات |
| `app_settings` | — | ⏭️ مُتجاهَل — لا جدول في Drizzle |
| **المجموع** | **24** | **24 صف ← Supabase** |

---

## الجداول المُنقلة ومحتواها

### 1. daily_messages (8 صفوف)

| legacy_id | message (مقطع) |
|---|---|
| 1 | من رتّب يومه ملك وقته. |
| 2 | الصبر مفتاح الفرج، وما أقرب الفرج من أهل الصبر. |
| 3 | يومك يبدأ بقرار، فاجعله قراراً نافعاً. |
| 4 | الوقت إذا حُفظ أثمر. |
| 5 | رتّب مواعيدك، ترتّب أولوياتك. |
| 6 | كل موعد له وقته، وكل وقت له قيمة. |
| 7 | خذ من يومك ما يعينك على غدك. |
| 8 | البداية المنظمة تختصر نصف الطريق. |

### 2. story_templates (2 صفوف)

| legacy_id | name | background_color |
|---|---|---|
| 1 | القالب الافتراضي | #8B6914 |
| 2 | القالب التراثي البسيط | #5C4A1E |

### 3. themes (10 صفوف)

| legacy_id | slug | name |
|---|---|---|
| 1 | heritage | التراث التقني الفاخر |
| 2 | dark-night | الليل الهادئ |
| 3 | golden-dawn | الفجر الذهبي |
| 4 | saudi-clean | السعودي النظيف |
| 5 | night-gold | الليلي الذهبي |
| 6 | najdi | التراث النجدي |
| 7 | white-formal | الأبيض الرسمي |
| 8 | botanical | النباتي الناعم |
| 9 | desert | الصحراوي المعاصر |
| 10 | architectural | المعماري الهادئ |

### 4. news (2 صفوف)

| legacy_id | title | category |
|---|---|---|
| 1 | إطلاق منصة مواعيدك للإدارة اليومية | تقنية |
| 2 | نصائح لتنظيم وقتك اليومي | مجتمع |

### 5. jobs (2 صفوف)

| legacy_id | title | employer | city |
|---|---|---|---|
| 1 | مطوّر تطبيقات جوال | شركة التقنية الذكية | الرياض |
| 2 | محاسب مالي | مجموعة الأفق التجارية | جدة |

---

## الجداول الممنوعة في هذه المرحلة

| الجدول | السبب |
|---|---|
| `appointments` | بيانات شخصية — Phase 12D |
| `financial_events` | بيانات شخصية — Phase 12D |
| `notifications` | بيانات شخصية — Phase 12D |
| `complaints` | بيانات شخصية — Phase 12D |
| `profiles` | مرتبطة بـ auth.users |
| `admin_users` | admin credentials — ممنوع |
| `user_roles` | RBAC — ممنوع في هذه المرحلة |
| `audit_logs` | logs ضخمة — مؤجل |

---

## توافق الأعمدة بين Drizzle وSupabase

| الجدول | التوافق | ملاحظات |
|---|---|---|
| `daily_messages` | ✅ 100% | message, display_date, is_active |
| `story_templates` | ✅ 100% | name, description, template_text, background_color, text_color |
| `themes` | ✅ 100% | name, slug, description, colors JSONB, is_active, is_available, tier |
| `news` | ✅ 100% | title, body, category, source, image_url, is_published, published_at |
| `jobs` | ✅ 100% | title, employer, sector, city, description, apply_url, deadline, is_active |

---

## migration_batch المستخدم

```
phase_12c_admin_seed_2026_05_24
```

---

## الأعمدة المُضافة لكل صف منقول

| العمود | القيمة |
|---|---|
| `legacy_id` | id الأصلي من PostgreSQL (integer) |
| `migrated_at` | NOW() وقت التشغيل في Supabase |
| `migration_batch` | 'phase_12c_admin_seed_2026_05_24' |

---

## تعليمات التشغيل

1. افتح **Supabase SQL Editor** لمشروع مواعيدك
2. انسخ محتوى `SUPABASE_ADMIN_SEED_MIGRATION.sql` كاملاً
3. انقر **Run**
4. انسخ محتوى `SUPABASE_ADMIN_SEED_VERIFY.sql`
5. انقر **Run** وتحقق من النتائج:
   - daily_messages: total_rows=8, rows_with_legacy_id=8
   - story_templates: total_rows=2, rows_with_legacy_id=2
   - themes: total_rows=10, rows_with_legacy_id=10
   - news: total_rows=2, rows_with_legacy_id=2
   - jobs: total_rows=2, rows_with_legacy_id=2
   - appointments/financial_events/notifications/complaints: total_rows=0

---

## الحكم المبدئي

**Admin Seed Ready** — الملف جاهز للتشغيل في Supabase SQL Editor
