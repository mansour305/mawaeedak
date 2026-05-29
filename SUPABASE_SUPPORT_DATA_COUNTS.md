# SUPABASE_SUPPORT_DATA_COUNTS.md — مواعيدك Phase 12E
**التاريخ:** 2026-05-24 | Phase 12E Support Data Migration

---

## ملخص الحالة

| المصدر | الوضع |
|---|---|
| PostgreSQL/Drizzle | مصدر الحقيقة الحالي ✅ |
| Supabase (admin-managed 12C) | 24 صف مُطبَّق ✅ |
| Supabase (user-owned 12D) | 10 صف مُطبَّق ✅ |
| Supabase (support-data 12E) | ينتظر تشغيل SUPABASE_SUPPORT_DATA_MIGRATION.sql |

---

## PostgreSQL — عدد الصفوف المُنقلة

| الجدول | الصفوف في PostgreSQL | المُعدَّ للنقل | migration_batch |
|---|---|---|---|
| `notifications` | 3 | 3 | phase_12e_support_seed_2026_05_24 |
| `complaints` | 3 | 3 | phase_12e_support_seed_2026_05_24 |
| **المجموع** | **6** | **6** | |

---

## notifications — البيانات المُنقلة

| legacy_id | title | type | is_read |
|---|---|---|---|
| 1 | مرحباً بك في مواعيدك | general | true |
| 2 | تذكير: موعد قادم | reminder | true |
| 3 | اختبار إشعار داخلي | system | true |

---

## complaints — البيانات المُنقلة

| legacy_id | type | contact | status | user_id |
|---|---|---|---|---|
| 1 | استفسار | test@test.com | pending | NULL |
| 2 | اقتراح | qa@test.sa | pending | NULL |
| 3 | استفسار | support-qa@test.sa | pending | NULL |

---

## توافق الأعمدة — notifications

| عمود PostgreSQL | النوع | عمود Supabase | النوع | التوافق |
|---|---|---|---|---|
| id | SERIAL | legacy_id | INTEGER | ✅ |
| — | — | user_id | UUID → auth.users (nullable) | ✅ مُضاف |
| title | TEXT NOT NULL | title | TEXT NOT NULL | ✅ |
| body | TEXT nullable | body | TEXT nullable | ✅ |
| type | TEXT NOT NULL | type | TEXT NOT NULL DEFAULT 'general' | ✅ |
| is_read | BOOLEAN NOT NULL | is_read | BOOLEAN NOT NULL DEFAULT FALSE | ✅ |
| created_at | TIMESTAMP | created_at | TIMESTAMPTZ | ✅ |

---

## توافق الأعمدة — complaints

| عمود PostgreSQL | النوع | عمود Supabase | النوع | التوافق |
|---|---|---|---|---|
| id | SERIAL | legacy_id | INTEGER | ✅ |
| — | — | user_id | UUID → auth.users (nullable, SET NULL) | ✅ مُضاف |
| type | TEXT NOT NULL | type | TEXT NOT NULL | ✅ |
| message | TEXT NOT NULL | message | TEXT NOT NULL | ✅ |
| contact | TEXT nullable | contact | TEXT nullable | ✅ |
| status | TEXT NOT NULL | status | TEXT NOT NULL DEFAULT 'pending' | ✅ |
| created_at | TIMESTAMP | created_at | TIMESTAMPTZ | ✅ |

---

## استراتيجية user_id

### notifications — تُربط بـ hrq@hotmail.com
```
السبب: إشعارات النظام موجّهة للمستخدم الوحيد الموثق (super_admin)
PostgreSQL schema: لا يوجد user_id في PostgreSQL
Supabase schema: user_id nullable — ON DELETE CASCADE
القرار: user_id = hrq's UUID (المستخدم الوحيد)
```

### complaints — user_id = NULL
```
السبب: المرسِلون بعناوين مختلفة (test@test.com / qa@test.sa / support-qa@test.sa)
       لا أحد منهم hrq@hotmail.com
       الشكاوى مقدَّمة بشكل مجهول (anonymous)
Supabase schema: user_id nullable — ON DELETE SET NULL
القرار: user_id = NULL (صحيح أمنياً)
```

### جلب UUID في DO block
```sql
DO $$ DECLARE hrq_user_id UUID; BEGIN
  SELECT id INTO hrq_user_id FROM auth.users WHERE email = 'hrq@hotmail.com';
  IF hrq_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;
  -- notifications: user_id = hrq_user_id
  -- complaints:    user_id = NULL::UUID
END; $$;
```

---

## ملاحظة RLS

| الجدول | RLS | دور SQL Editor | النتيجة |
|---|---|---|---|
| `notifications` | ✅ مُفعَّل | postgres (service role داخلي) | bypass ✅ |
| `complaints` | ✅ مُفعَّل | postgres (service role داخلي) | bypass ✅ |

---

## الجداول غير المُنقلة في Phase 12E

| الجدول | السبب |
|---|---|
| `profiles` | مرتبطة بـ auth.users — تُنشأ تلقائياً |
| `auth.users` | لا يُنقل — managed by Supabase Auth |
| `user_roles` / `admin_users` | لا يُنقل — admin seed تمّ في 12C |
| `appointments` | تمّ في Phase 12D ✅ |
| `financial_events` | تمّ في Phase 12D ✅ |

---

## migration_batch المستخدم

```
phase_12e_support_seed_2026_05_24
```

---

## Counts المتوقعة في Supabase بعد التشغيل

| الجدول | المتوقع |
|---|---|
| notifications | 3 |
| complaints | 3 |
| **مجموع Phase 12E** | **6** |
| daily_messages | 8 (12C) |
| story_templates | 2 (12C) |
| themes | 10 (12C) |
| news | 2 (12C) |
| jobs | 2 (12C) |
| appointments | 2 (12D) |
| financial_events | 8 (12D) |
| **إجمالي Supabase** | **40** |

---

## تعليمات التشغيل

1. افتح **Supabase SQL Editor**
2. انسخ محتوى `SUPABASE_SUPPORT_DATA_MIGRATION.sql` كاملاً
3. انقر **Run**
4. انتظر رسائل NOTICE:
   - `hrq@hotmail.com user_id = <uuid>`
   - `notifications: done (3 rows)`
   - `complaints: done (3 rows)`
   - `Phase 12E migration complete`
5. شغّل `SUPABASE_SUPPORT_DATA_VERIFY.sql` للتحقق

---

## القرارات التصميمية

| القرار | المبرر |
|---|---|
| notifications.user_id = hrq | المستخدم الوحيد، إشعارات موجّهة له |
| complaints.user_id = NULL | مرسِلون مجهولون بعناوين مختلفة |
| ON DELETE CASCADE (notifications) | حذف المستخدم يحذف إشعاراته |
| ON DELETE SET NULL (complaints) | الشكوى تبقى موثَّقة حتى بعد حذف المستخدم |
| WHERE NOT EXISTS | idempotent — آمن للإعادة |
| RAISE EXCEPTION | لا بيانات ناقصة إذا user غير موجود |
