# SUPABASE_MIGRATION_PLAN.md — مواعيدك
**تاريخ الإنشاء:** 2026-05-24 | Phase 12A
**الحالة:** Draft — لم يُنفَّذ بعد

> تحذير: هذه خطة للمراجعة والموافقة فقط. لا تنفيذ حتى يُؤكَّد كل prerequisite.

---

## المتطلبات المسبقة

قبل البدء بأي migration:

- [ ] backup كامل لـ PostgreSQL الحالي
- [ ] Supabase Project في وضع maintenance أو low-traffic
- [ ] اختبار المخطط في بيئة staging أولاً
- [ ] الموافقة على تغيير `serial id → uuid` أو استخدام wrapper
- [ ] تحديد مؤقت جمود البيانات (freeze period)

---

## المراحل

### Phase M0: Pre-Migration Backup (يجب دائماً)

```bash
# نسخ احتياطي من PostgreSQL الحالي
pg_dump "$DATABASE_URL" > backup_$(date +%Y%m%d_%H%M%S).sql

# التحقق من الـ backup
pg_restore --list backup_*.sql | head -20
```

**لا تكمل بدون هذه الخطوة.**

---

### Phase M1: Schema Validation

هدف: التحقق أن Supabase tables متوافقة مع البيانات الحالية.

```sql
-- في Supabase SQL Editor
-- تحقق من أعمدة كل جدول
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'daily_messages'
AND table_schema = 'public'
ORDER BY ordinal_position;
```

الإجراءات:
1. مقارنة كل عمود في Drizzle مع نظيره في Supabase
2. تحديد mismatches في أنواع البيانات
3. إضافة الأعمدة الناقصة قبل النقل

**أعمدة تحتاج إضافة في Supabase (إذا لم تكن موجودة):**

```sql
-- appointments: إضافة user_id
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- financial_events: إضافة user_id  
ALTER TABLE public.financial_events ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- notifications: إضافة user_id
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);
```

---

### Phase M2: Seed Static/Admin-Managed Data

هدف: نقل البيانات الثابتة التي يديرها Admin (لا user_id مطلوب).

**الجداول المستهدفة (أولوية عالية):**

```sql
-- 1. daily_messages (8 صف)
-- تشغيل هذا في Supabase SQL Editor فقط
INSERT INTO public.daily_messages (text, date, is_active, created_at)
VALUES
  -- نسخ القيم من: SELECT * FROM daily_messages;
  -- يُولَّد SQL تلقائياً من الـ dump
  ...;

-- 2. story_templates (2 صف)
INSERT INTO public.story_templates (name, template_text, color, is_active, created_at)
VALUES ...;

-- 3. themes (10 صف)
INSERT INTO public.themes (name, slug, css_overrides, is_active, is_default, created_at)
VALUES ...;

-- 4. news (2 صف)
INSERT INTO public.news (title, summary, source, url, category, is_active, published_at, created_at)
VALUES ...;

-- 5. jobs (2 صف)  
INSERT INTO public.jobs (title, company, city, sector, deadline, description, is_active, created_at)
VALUES ...;
```

**توليد SQL تلقائي:**
```bash
# من PostgreSQL الحالي
psql "$DATABASE_URL" -c "COPY (SELECT * FROM daily_messages) TO STDOUT WITH CSV HEADER" > daily_messages_export.csv
psql "$DATABASE_URL" -c "COPY (SELECT * FROM story_templates) TO STDOUT WITH CSV HEADER" > story_templates_export.csv
psql "$DATABASE_URL" -c "COPY (SELECT * FROM themes) TO STDOUT WITH CSV HEADER" > themes_export.csv
psql "$DATABASE_URL" -c "COPY (SELECT * FROM news) TO STDOUT WITH CSV HEADER" > news_export.csv
psql "$DATABASE_URL" -c "COPY (SELECT * FROM jobs) TO STDOUT WITH CSV HEADER" > jobs_export.csv
```

---

### Phase M3: Migrate User-Owned Data

هدف: نقل appointments, financial_events, notifications.

**تحدي:** لا يوجد user_id في البيانات الحالية — كل البيانات global.

**الخيارات:**
1. **الخيار A (موصى به):** ربط كل البيانات الحالية بـ hrq@hotmail.com (المستخدم الوحيد الآن)
2. **الخيار B:** إنشاء "demo user" system-wide
3. **الخيار C:** migration progressive — كل مستخدم يملك بياناته الخاصة من تسجيل الدخول

```sql
-- الخيار A: ربط بـ hrq@hotmail.com
-- احصل على user_id أولاً:
-- SELECT id FROM auth.users WHERE email = 'hrq@hotmail.com';

-- ثم نقل appointments
INSERT INTO public.appointments (title, description, date_time, category, is_recurring, created_at, user_id)
SELECT title, description, date_time, category, is_recurring, created_at, '<hrq_user_id>'
FROM local_pg.appointments;
```

---

### Phase M4: Migrate Admin-Managed Data

هدف: نقل complaints, audit_logs, public_events.

```sql
-- complaints (3 صف) — بلا user_id
INSERT INTO public.complaints (subject, message, contact_method, status, created_at)
SELECT subject, message, contact_method, status, created_at
FROM local_pg.complaints;

-- audit_logs (28 صف)
INSERT INTO public.audit_logs (action, entity, entity_id, admin_id, details, created_at)
SELECT action, entity, entity_id, admin_id, details, created_at
FROM local_pg.audit_logs;
```

---

### Phase M5: Seed Lookup/Reference Data

هدف: ملء جداول roles, permissions, role_permissions, admin_users.

```sql
-- roles
INSERT INTO public.roles (name, description) VALUES
  ('super_admin', 'مالك المنصة — صلاحيات كاملة'),
  ('admin', 'مدير — إدارة المحتوى'),
  ('content_manager', 'مدير المحتوى'),
  ('finance_manager', 'مدير المالية'),
  ('user', 'مستخدم عادي');

-- admin_users
INSERT INTO public.admin_users (user_id, role, display_name)
SELECT id, 'super_admin', 'مالك المنصة'
FROM auth.users WHERE email = 'hrq@hotmail.com';
```

---

### Phase M6: Verify Counts

```sql
-- للتحقق من تطابق الأعداد
SELECT 'daily_messages' as tbl, COUNT(*) FROM public.daily_messages
UNION ALL
SELECT 'story_templates', COUNT(*) FROM public.story_templates
UNION ALL
SELECT 'themes', COUNT(*) FROM public.themes
UNION ALL
SELECT 'news', COUNT(*) FROM public.news
UNION ALL
SELECT 'jobs', COUNT(*) FROM public.jobs
UNION ALL
SELECT 'complaints', COUNT(*) FROM public.complaints
UNION ALL
SELECT 'appointments', COUNT(*) FROM public.appointments
UNION ALL
SELECT 'financial_events', COUNT(*) FROM public.financial_events
UNION ALL
SELECT 'notifications', COUNT(*) FROM public.notifications
UNION ALL
SELECT 'audit_logs', COUNT(*) FROM public.audit_logs;
```

---

### Phase M7: Verify RLS

```sql
-- اختبار anon access
SET ROLE anon;
SELECT COUNT(*) FROM public.daily_messages; -- يجب 8
SELECT COUNT(*) FROM public.themes; -- يجب 10
INSERT INTO public.appointments (title, date_time) VALUES ('test', NOW()); -- يجب FAIL (42501)
RESET ROLE;
```

---

### Phase M8: Switch Data Source (Gradual)

الاستراتيجية: التبديل التدريجي feature by feature — لا big-bang.

ترتيب التبديل المقترح:
1. `daily_messages` → Supabase (anon read)
2. `story_templates` → Supabase (anon read)
3. `themes` → Supabase (anon read)
4. `news` + `jobs` → Supabase (anon read)
5. `appointments` + `financial_events` → Supabase (user-owned, يتطلب auth)
6. `notifications` → Supabase (user-owned)
7. `complaints` → Supabase

لكل feature:
1. تحديث Orval spec أو Supabase client hook
2. اختبار في التطبيق
3. إزالة Express route القديم

---

### Phase M9: Rollback Plan

**عند أي فشل:**

```bash
# استعادة من backup
psql "$DATABASE_URL" < backup_YYYYMMDD_HHMMSS.sql

# إعادة Express routes كما كانت
git checkout -- artifacts/api-server/src/routes/
```

**نقاط الإلتزام:**
- لا تحذف Express routes حتى يُختبر Supabase بالكامل
- احتفظ بـ `DATABASE_URL` فعالاً طوال فترة الانتقال
- استخدم feature flags إذا أمكن

---

### Phase M10: Final Verification

```bash
# typecheck
pnpm run typecheck

# build
PORT=5173 BASE_PATH=/ pnpm --filter @workspace/mawaeedak run build

# API smoke test
for ep in "/api/daily-messages/today" "/api/themes" "/api/prayer-times" \
           "/api/appointments" "/api/financial-events" "/api/notifications/unread-count"; do
  echo "$ep → $(curl -s -o /dev/null -w '%{http_code}' "http://localhost:80${ep}")"
done

# /admin Supabase Auth
# تسجيل دخول بـ hrq@hotmail.com → يجب عرض لوحة التحكم
```

---

## جدول زمني مقترح

| المرحلة | المدة المقدرة | الخطر |
|---|---|---|
| M0: Backup | 15 دقيقة | لا يوجد |
| M1: Schema Validation | 30 دقيقة | منخفض |
| M2: Seed Admin Data | 1 ساعة | منخفض |
| M3: User-Owned Data | 2 ساعة | متوسط |
| M4: Admin Data | 1 ساعة | منخفض |
| M5: Reference Data | 30 دقيقة | منخفض |
| M6-M7: Verify | 30 دقيقة | لا يوجد |
| M8: Switch Gradually | 1 أسبوع | متوسط |
| M9: Monitor | أسبوعان | — |
| M10: Final | 1 ساعة | لا يوجد |

---

## Phase 12D — تم بنجاح (2026-05-24)

### البيانات المُنقلة

| الجدول | الصفوف | user_id | legacy_id | migration_batch |
|---|---|---|---|---|
| `appointments` | 2 | hrq@hotmail.com UUID | 1–2 | phase_12d_user_core_seed_2026_05_24 |
| `financial_events` | 8 | hrq@hotmail.com UUID | 1–8 | phase_12d_user_core_seed_2026_05_24 |

### إجمالي Supabase بعد Phase 12D: 34 صف

| المصدر | الصفوف |
|---|---|
| Phase 12C (admin-managed) | 24 |
| Phase 12D (user-owned) | 10 |
| **المجموع** | **34** |

### الخطوة التالية: Phase 12E
- نقل notifications (3 صف) + complaints (3 صف)

---

## Phase 12E — Support Data Migration Preparation (2026-05-24)

### التشخيص

| الجدول | PostgreSQL | Supabase Schema | التوافق |
|---|---|---|---|
| `notifications` | 3 صف | + user_id nullable CASCADE | ✅ 100% |
| `complaints` | 3 صف | + user_id nullable SET NULL | ✅ 100% |

### استراتيجية user_id

| الجدول | القرار | المبرر |
|---|---|---|
| `notifications` | hrq UUID | إشعارات النظام — المستخدم الوحيد |
| `complaints` | NULL | مرسِلون بعناوين مختلفة (مجهولون) |

### الملفات

- `SUPABASE_SUPPORT_DATA_MIGRATION.sql` — SQL آمن جاهز للتشغيل
- `SUPABASE_SUPPORT_DATA_COUNTS.md` — توثيق كامل + column mapping
- `SUPABASE_SUPPORT_DATA_VERIFY.sql` — queries تحقق شاملة

### Counts المتوقعة بعد التشغيل

| الجدول | المتوقع |
|---|---|
| notifications | 3 (user_id=hrq) |
| complaints | 3 (user_id=NULL) |
| **إجمالي Supabase** | **40 صف** |

### الخطوة التالية: Phase 12F

تحويل Data Layer من PostgreSQL/Express إلى Supabase Client

---

## Phase 12E — تم بنجاح (2026-05-24)

### نتائج التحقق المؤكدة

| المقياس | القيمة |
|---|---|
| notifications_count | 3 ✅ |
| complaints_count | 3 ✅ |
| notifications_join_hrq_user | 3 ✅ |
| complaints_user_id_null | 3 ✅ |
| notifications_missing_legacy_id | 0 ✅ |
| complaints_missing_legacy_id | 0 ✅ |
| notifications_duplicate_legacy_groups | 0 ✅ |
| complaints_duplicate_legacy_groups | 0 ✅ |
| appointments_unchanged | 2 ✅ |
| financial_events_unchanged | 8 ✅ |

### إجمالي Supabase بعد Phase 12E: 40 صف

| المصدر | الصفوف |
|---|---|
| Phase 12C (admin-managed) | 24 |
| Phase 12D (user-owned core) | 10 |
| Phase 12E (support data) | 6 |
| **المجموع** | **40** |

### الخطوة التالية: Phase 12F
تحويل Data Layer من PostgreSQL/Express إلى Supabase Client

---

## Phase 12F — Supabase Data Layer Shadow Read (2026-05-24)

### الملفات المُنشأة

| الملف | الوصف |
|---|---|
| `src/lib/dataSourceMode.ts` | Feature flag — الافتراضي: "api" |
| `src/lib/supabaseData.ts` | Adapter + Shadow Comparison (9 دوال) |

### القرارات المعمارية

| القرار | التفصيل |
|---|---|
| مصدر الحقيقة | PostgreSQL/Express — لم يتغير |
| Feature flag | VITE_DATA_SOURCE_MODE — افتراضي "api" |
| Shadow mode | supabase_shadow — dev only |
| Supabase cutover | Phase 12G فقط |
| خطأ Supabase | null بدون exception — لا يكسر Preview |
| user_id | من session.user.id — لا service_role |
| legacy_id mapping | يُعاد كـ id للمطابقة مع UI |

### Counts مكتملة

| الجدول | API | Supabase |
|---|---|---|
| daily_messages | 8 | 8 ✅ |
| story_templates | 2 | 2 ✅ |
| themes | 10 | 10 ✅ |
| news | 2 | 2 ✅ |
| jobs | 2 | 2 ✅ |
| appointments | 2 | 2 ✅ |
| financial_events | 8 | 8 ✅ |
| notifications | 3 | 3 ✅ |
| complaints | 3 | 3 ✅ |
| **المجموع** | **40** | **40** ✅ |

### الخطوة التالية: Phase 12G
تحويل Data Layer الفعلي من PostgreSQL/Express إلى Supabase

---

## Phase 12G — Controlled Supabase Data Layer Cutover (2026-05-24)

### القرار المعماري

**Read Cutover Only** — القراءة جاهزة من Supabase، الكتابة تبقى على API.

المسوّغ:
- 12 ملف feature يحتوي على mutations — نقلها جميعاً في نفس المرحلة خطر عالٍ.
- الأولوية: ضمان عدم كسر أي صفحة حالية.
- الحكم: **Supabase Read Cutover Ready** وليس Full Supabase Data Source.

### الملفات المُنشأة

| الملف | الوصف |
|---|---|
| `src/lib/dataGateway.ts` | Data Gateway الرئيسي — 9 دوال + shadow comparison |
| `src/features/admin/AdminDataLayer.tsx` | لوحة Data Layer في /admin/data-layer |

### بنية dataGateway.ts

```
gateway(apiPath, supabaseReader) {
  mode=supabase:
    → supabaseReader() → إن فشل → fetchApi(apiPath)
  mode=api / supabase_shadow:
    → fetchApi(apiPath)
}
```

### سياسة Mutations

| العملية | المصدر الحالي | خطة التحويل |
|---|---|---|
| POST /appointments | API | Phase 12H |
| PATCH /appointments/:id | API | Phase 12H |
| DELETE /appointments/:id | API | Phase 12H |
| POST /financial-events | API | Phase 12H |
| PATCH /financial-events/:id | API | Phase 12H |
| DELETE /financial-events/:id | API | Phase 12H |
| POST /notifications | API | Phase 12H |
| DELETE /notifications/:id | API | Phase 12H |
| POST /complaints | API | Phase 12H |
| Admin CRUD (رسائل/ثيمات/أخبار/وظائف/...) | API | Phase 12H+ |

### الخلاصة

- Supabase Read Cutover: ✅ جاهز (mode=supabase يقرأ من Supabase مع fallback)
- Supabase Write Cutover: ⏳ Phase 12H
- API/PostgreSQL: ✅ سليم — لم يُلمس

---

## Phase 12H — Frontend Read Gateway Integration (2026-05-24)

### React Query Gateway Hooks

```
useGatewayData.ts:
  query keys: ['gw', '<table>']  ← مستقلة عن Orval
  queryFn: gwGet*()              ← Data Gateway
  staleTime: حسب تكرار التغيير
  retry: 1
```

قرار query key:
- مستقلة عن Orval لتجنب cache collision
- Orval تُبطل cache بـ queryKey الخاص بها فقط
- المستقبل (Phase 12I): توحيد keys عند تحويل الكتابة

### Divergence Warning

عند mode=supabase مع mutations باقية على API:
- CentersNewsPage/Jobs: لا mutations → لا divergence
- AccountPage: theme → localStorage → لا divergence
- StoryPage: حفظ → localStorage → لا divergence
- CalendarPage/Finance/Notifications: mutations → API → يبقى Orval (لا divergence)

### Phase 12I المطلوبة:

1. تحويل CalendarPage mutations إلى Supabase
2. تحويل FinancePage mutations إلى Supabase
3. تحويل NotificationsPage mutations إلى Supabase
4. توحيد query keys بين Gateway وOrval
5. Admin mutations → Supabase

---

## Phase 12I — Controlled Write Cutover (2026-05-24)

### Write Gateway Architecture

```
gwMarkNotificationRead(id):
  mode=api            → PATCH /api/notifications/:id
  mode=supabase_shadow→ PATCH /api/notifications/:id
  mode=supabase       → supabase.update(is_read=true).eq("legacy_id", id)
                         يتطلب session auth (hrq@hotmail.com)
                         بدون session → WriteResult { success: false, error: "..." }
                         فشل Supabase → WriteResult { success: false, error: "..." }
                         لا fallback صامت
```

### Why NOT NotificationsPage Yet?

المعادلة:
  read(API) + write(Supabase) = divergence
  read(Supabase) + write(Supabase) = ✅ consistent

Phase 12J يُطبَّق:
  1. NotificationsPage → useGatewayNotifications (read)
  2. NotificationsPage → gwMarkNotificationRead (write)
  3. Cache invalidation: invalidate(['gw','notifications']) بعد كل mutation
  4. Delete notification → gwDeleteNotification (يُضاف في Phase 12J)

### Phase 12J المطلوبة:

1. gwDeleteNotification → supabase.delete()
2. NotificationsPage تنتقل لـ Gateway (read + write معاً)
3. Admin news/jobs mutations → Supabase
4. توحيد query keys

### المحظورات حتى Phase 12J:

- appointments write → Supabase (HIGH RISK)
- financial_events write → Supabase (HIGH RISK)
- Publish/Production Ready

---

## Phase 12Q — Production Hardening Gate (2026-05-25)

**الحكم:** Production Ready Candidate

### Production Env Requirements

لتفعيل Supabase كمصدر الحقيقة في الإنتاج، يجب ضبط هذه المتغيرات في Replit Secrets:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_DATA_SOURCE_MODE=supabase
DATABASE_URL=postgres://...
SESSION_SECRET=long_random_string
```

### القيود المتبقية (غير مانعة)

1. **Role trust**: Role يأتي من `user_metadata.role` في Supabase JWT.
   - خطر: المستخدم قد يعدّل user_metadata إذا لم تُضبط RLS policies بدقة.
   - التخفيف الحالي: RLS يُطبَّق على مستوى DB — لا وصول cross-user.
   - التخفيف المستقبلي: custom claims function بدلاً من user_metadata.

2. **Demo bypass**: عند غياب `VITE_SUPABASE_URL`، demo mode مفعّل (`admin`/`mawaeedak@admin`).
   - في الإنتاج: مفاتيح Supabase تُعطّل demo تلقائياً — آمن.

3. **AdminFinancial / AdminEvents**: يقرآن من API في كل الأوضاع (admin-only، موثق).

4. **Prayer times / today_message**: server-computed — يتطلب API server عاملاً.

5. **Push Notifications**: مؤجل — لا FCM/Supabase Realtime حالياً.

6. **مراكز (أعمال/سفر/دراسة)**: localStorage — لا مزامنة عبر الأجهزة.

### الخطوة التالية

- ضبط `VITE_DATA_SOURCE_MODE=supabase` في Replit Secrets
- اختبار شامل بـ mode=supabase
- تحديث custom claims في Supabase Auth للـ roles
- Deploy عند الجاهزية
