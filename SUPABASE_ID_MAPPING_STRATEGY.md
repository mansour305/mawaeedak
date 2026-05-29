# SUPABASE_ID_MAPPING_STRATEGY.md — مواعيدك
**التاريخ:** 2026-05-24 | Phase 12B

---

## 1. المشكلة: serial integer vs uuid

### الوضع الحالي (PostgreSQL / Drizzle)
```sql
-- كل الجداول في Drizzle تستخدم:
id SERIAL PRIMARY KEY  -- integer متسلسل (1, 2, 3, ...)
```

### الوضع المستهدف (Supabase)
```sql
-- كل الجداول في Supabase تستخدم:
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
```

---

## 2. لماذا UUID في Supabase؟

| السبب | التفصيل |
|---|---|
| **التوافق مع Auth** | `auth.users.id` هو UUID — الربط مع `user_id` يتطلب UUID |
| **Stateless ID generation** | UUID يمكن توليده من العميل بدون round-trip لـ DB |
| **Horizontal scaling** | UUID آمن عبر distributed systems بلا تعارض |
| **Supabase standard** | كل جداول Supabase المُنشأة تستخدم UUID افتراضياً |
| **RLS compatibility** | `auth.uid()` يُعيد UUID — المقارنة مع integer تفشل |

---

## 3. لماذا legacy_id؟

`legacy_id integer` هو العمود الذي يحفظ الـ `id` القديم من PostgreSQL/Drizzle.

### الأغراض:
1. **تتبع المصدر:** معرفة أن هذا الصف في Supabase جاء من الصف #5 في PostgreSQL
2. **منع التكرار:** عند إعادة تشغيل Migration — `WHERE legacy_id IS NOT NULL` يتجنب النسخ المزدوج
3. **Rollback mapping:** عند الرجوع، نعرف أين كان كل صف
4. **Audit trail:** توثيق مسار كل سجل

### مثال:
```
PostgreSQL appointments:
  id=1, title="موعد طبي", date=2026-06-01

Supabase appointments:
  id=<uuid>, title="موعد طبي", date=2026-06-01, legacy_id=1, migrated_at=<timestamp>
```

---

## 4. ربط الـ serial القديم بالـ uuid الجديد

### استراتيجية المفتاح الأجنبي:
لا توجد foreign key مباشرة بين Drizzle serial وSupabase uuid.
الربط يكون عبر `legacy_id` فقط — كـ reference للتتبع، لا كـ constraint.

### جدول mapping مؤقت (اختياري):
```sql
-- يُنشأ في Supabase أثناء Migration فقط — يُحذف بعده
CREATE TEMP TABLE legacy_id_map (
  legacy_id    INTEGER NOT NULL,
  new_uuid     UUID NOT NULL,
  table_name   TEXT NOT NULL,
  PRIMARY KEY (legacy_id, table_name)
);
```

---

## 5. معالجة user_id للبيانات الحالية

### المشكلة:
البيانات الحالية في PostgreSQL ليس لها `user_id` — كل البيانات global.

### القرار المعتمد:

**للبيانات الشخصية (appointments, financial_events, notifications):**
ترتبط مؤقتاً بـ `hrq@hotmail.com` — المالك الوحيد الموثق.

```sql
-- أثناء Migration — في Supabase SQL Editor
-- احصل على UUID أولاً:
SELECT id FROM auth.users WHERE email = 'hrq@hotmail.com';
-- نتيجة: '<hrq_uuid>'

-- ثم عند INSERT:
INSERT INTO public.appointments (..., user_id, legacy_id, migrated_at, migration_batch)
SELECT ..., '<hrq_uuid>', id, NOW(), 'batch_v1_2026-05'
FROM local_export.appointments;
```

**للبيانات العامة (daily_messages, themes, news, jobs, ...):**
`user_id` ليس مطلوباً — تُنقل بـ `user_id = NULL` أو بدون هذا العمود.

### خطة Owner Assignment موثقة:

| الجدول | user_id عند Migration | السبب |
|---|---|---|
| `appointments` | hrq@hotmail.com UUID | المالك الوحيد الحالي |
| `financial_events` | hrq@hotmail.com UUID | المالك الوحيد الحالي |
| `notifications` | NULL (أو hrq) | إشعارات عامة حالياً |
| `complaints` | NULL | يُسمح بإرسال بلا user |
| `daily_messages` | لا يوجد user_id | admin-managed |
| `themes` | لا يوجد user_id | admin-managed |
| `news` | لا يوجد user_id | admin-managed |
| `jobs` | لا يوجد user_id | admin-managed |

---

## 6. الجداول التي أُضيف لها legacy_id (Phase 12B)

| الجدول | user_id | legacy_id | migration_batch | migrated_at |
|---|---|---|---|---|
| `appointments` | ✅ موجود مسبقاً | ✅ أُضيف | ✅ أُضيف | ✅ أُضيف |
| `financial_events` | ✅ موجود مسبقاً | ✅ أُضيف | ✅ أُضيف | ✅ أُضيف |
| `notifications` | ✅ موجود مسبقاً | ✅ أُضيف | ✅ أُضيف | ✅ أُضيف |
| `complaints` | ✅ موجود مسبقاً | ✅ أُضيف | ✅ أُضيف | ✅ أُضيف |
| `daily_messages` | ❌ غير مطلوب | ✅ أُضيف | ✅ أُضيف | ✅ أُضيف |
| `story_templates` | ❌ غير مطلوب | ✅ أُضيف | ✅ أُضيف | ✅ أُضيف |
| `themes` | ❌ غير مطلوب | ✅ أُضيف | ✅ أُضيف | ✅ أُضيف |
| `news` | ❌ غير مطلوب | ✅ أُضيف | ✅ أُضيف | ✅ أُضيف |
| `jobs` | ❌ غير مطلوب | ✅ أُضيف | ✅ أُضيف | ✅ أُضيف |
| `public_events` | ❌ غير مطلوب | ✅ أُضيف | ✅ أُضيف | ✅ أُضيف |
| `audit_logs` | ❌ غير مطلوب | ✅ أُضيف | ✅ أُضيف | ✅ أُضيف |

---

## 7. Indexes — لماذا عادي لا UNIQUE؟

`legacy_id` يستخدم `CREATE INDEX` عادي لا `UNIQUE INDEX` لأن:

1. قبل Migration: `legacy_id IS NULL` لكل الصفوف → UNIQUE على NULL يسمح تكراراً لكنه محير
2. أثناء re-run للـ Migration: قد تُحذف صفوف وتُعاد — UNIQUE سيمنع ذلك
3. Partial index (`WHERE legacy_id IS NOT NULL`) أكفأ وأوضح

```sql
-- الاختيار الآمن:
CREATE INDEX IF NOT EXISTS appointments_legacy_id_idx
  ON public.appointments (legacy_id)
  WHERE legacy_id IS NOT NULL;
-- بدلاً من: CREATE UNIQUE INDEX ... → قد يفشل عند re-migration
```

---

## 8. Rollback Plan

عند الحاجة للرجوع:

```sql
-- Supabase: حذف البيانات المنقولة من batch معين
DELETE FROM public.appointments
WHERE migration_batch = 'batch_v1_2026-05';

-- أو rollback كامل:
TRUNCATE public.appointments CASCADE;
-- ملاحظة: TRUNCATE مسموح فقط في rollback scenario — ليس في migration!
```

---

## 9. القرار النهائي

| القرار | الاختيار |
|---|---|
| ID type في Supabase | UUID (gen_random_uuid()) |
| تخزين ID القديم | `legacy_id INTEGER` (nullable) |
| User ownership | `user_id UUID REFERENCES auth.users(id)` |
| index على legacy_id | Partial index (WHERE NOT NULL) — ليس UNIQUE |
| بيانات المستخدم القديمة | تُربط بـ hrq@hotmail.com عند Migration |
| admin-managed data | تُنقل بدون user_id |
| تغيير Drizzle schema | ❌ لا تغيير في هذه المرحلة |
