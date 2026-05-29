# SUPABASE_USER_CORE_COUNTS.md — مواعيدك Phase 12D
**التاريخ:** 2026-05-24 | Phase 12D User-owned Core Data Migration

---

## ملخص الحالة

| المصدر | الوضع |
|---|---|
| PostgreSQL/Drizzle | مصدر الحقيقة الحالي ✅ |
| Supabase (admin-managed) | 24 صف مُطبَّق من Phase 12C ✅ |
| Supabase (user-owned) | ينتظر تشغيل SUPABASE_USER_CORE_MIGRATION.sql |

---

## PostgreSQL — عدد الصفوف المُنقلة

| الجدول | الصفوف في PostgreSQL | المُعدَّ للنقل | migration_batch |
|---|---|---|---|
| `appointments` | 2 | 2 | phase_12d_user_core_seed_2026_05_24 |
| `financial_events` | 8 | 8 | phase_12d_user_core_seed_2026_05_24 |
| **المجموع** | **10** | **10** | |

---

## appointments — البيانات المُنقلة

| legacy_id | title | date | time | category | priority |
|---|---|---|---|---|---|
| 1 | موعد طبي | 2026-05-28 | 10:00 | صحة | high |
| 2 | تجديد الرخصة | 2026-06-01 | 09:00 | شخصي | medium |

---

## financial_events — البيانات المُنقلة

| legacy_id | name | type | next_date | reminder_days_before |
|---|---|---|---|---|
| 1 | الراتب الشهري | salary | 2026-06-01 | 3 |
| 2 | حساب المواطن | support | 2026-06-10 | 3 |
| 3 | الضمان الاجتماعي | support | 2026-05-25 | 3 |
| 4 | حافز | support | 2026-06-15 | 3 |
| 5 | الدعم السكني | support | 2026-06-30 | 5 |
| 6 | ساند / التأمينات | support | 2026-06-20 | 3 |
| 7 | التقاعد | salary | 2026-06-01 | 3 |
| 8 | الدعم الزراعي | support | 2026-07-08 | 5 |

---

## توافق الأعمدة — appointments

| عمود PostgreSQL | النوع | عمود Supabase | النوع | التوافق |
|---|---|---|---|---|
| id | SERIAL | legacy_id | INTEGER | ✅ |
| — | — | user_id | UUID → auth.users | ✅ مُضاف |
| title | TEXT NOT NULL | title | TEXT NOT NULL | ✅ |
| description | TEXT nullable | description | TEXT nullable | ✅ |
| date | TEXT NOT NULL | date | TEXT NOT NULL | ✅ |
| time | TEXT nullable | time | TEXT nullable | ✅ |
| category | TEXT NOT NULL | category | TEXT NOT NULL DEFAULT 'شخصي' | ✅ |
| color | TEXT nullable | color | TEXT nullable | ✅ |
| priority | TEXT nullable | priority | TEXT nullable | ✅ |
| reminder_enabled | BOOLEAN | reminder_enabled | BOOLEAN | ✅ |
| created_at | TIMESTAMP | created_at | TIMESTAMPTZ | ✅ |

---

## توافق الأعمدة — financial_events

| عمود PostgreSQL | النوع | عمود Supabase | النوع | التوافق |
|---|---|---|---|---|
| id | SERIAL | legacy_id | INTEGER | ✅ |
| — | — | user_id | UUID → auth.users | ✅ مُضاف |
| name | TEXT NOT NULL | name | TEXT NOT NULL | ✅ |
| type | TEXT NOT NULL | type | TEXT NOT NULL | ✅ |
| next_date | TEXT NOT NULL | next_date | TEXT NOT NULL | ✅ |
| amount | NUMERIC nullable | amount | NUMERIC nullable | ✅ |
| notes | TEXT nullable | notes | TEXT nullable | ✅ |
| is_active | BOOLEAN | is_active | BOOLEAN | ✅ |
| reminder_days_before | INTEGER | reminder_days_before | INTEGER | ✅ |
| created_at | TIMESTAMP | created_at | TIMESTAMPTZ | ✅ |

---

## ربط user_id

### الاستراتيجية
```sql
-- DO block آمن — يرفع exception إذا المستخدم غير موجود
DO $$ DECLARE hrq_user_id UUID; BEGIN
  SELECT id INTO hrq_user_id FROM auth.users WHERE email = 'hrq@hotmail.com';
  IF hrq_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;
  -- INSERT ... user_id = hrq_user_id
END; $$;
```

### لماذا hrq@hotmail.com؟
- المالك الوحيد الموثق للبيانات الحالية
- دخل كـ super_admin وتم التحقق من وجوده في auth.users
- كل appointments/financial_events الحالية ليس لها user مرتبط — الربط يكون بالمالك الفعلي

---

## ملاحظة RLS

RLS policy: `appointments_insert_own` تستخدم `WITH CHECK (auth.uid() = user_id)`.

**عند التشغيل من Supabase SQL Editor:**
- الدور الافتراضي هو `postgres` (service role داخلي)
- يتجاوز RLS تلقائياً
- لا يحتاج service_role key في الكود

---

## الجداول الشخصية غير المُنقلة

| الجدول | السبب |
|---|---|
| `notifications` | مؤجل — Phase 12E |
| `complaints` | مؤجل — Phase 12E |
| `profiles` | مرتبطة بـ auth.users — تُنشأ تلقائياً |

---

## migration_batch المستخدم

```
phase_12d_user_core_seed_2026_05_24
```

---

## Counts المتوقعة في Supabase بعد التشغيل

| الجدول | المتوقع |
|---|---|
| appointments | 2 |
| financial_events | 8 |
| **مجموع user-owned** | **10** |
| daily_messages | 8 (Phase 12C) |
| story_templates | 2 (Phase 12C) |
| themes | 10 (Phase 12C) |
| news | 2 (Phase 12C) |
| jobs | 2 (Phase 12C) |
| **مجموع كل Supabase** | **34** |

---

## تعليمات التشغيل

1. افتح **Supabase SQL Editor**
2. انسخ محتوى `SUPABASE_USER_CORE_MIGRATION.sql` كاملاً
3. انقر **Run**
4. انتظر رسائل NOTICE:
   - `hrq@hotmail.com user_id = <uuid>`
   - `appointments: done`
   - `financial_events: done`
   - `Phase 12D migration complete`
5. شغّل `SUPABASE_USER_CORE_VERIFY.sql` للتحقق
6. المتوقع: appointments=2 مع user_id، financial_events=8 مع user_id
