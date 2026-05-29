# DATA_SOURCE_MAP.md — مواعيدك
**تاريخ الإنشاء:** 2026-05-24 | Phase 12A

خريطة شاملة لمصادر البيانات الحالية ومقابلاتها في Supabase.

---

## ملخص المصادر الحالية

| المصدر | الاستخدام | الحالة |
|---|---|---|
| **PostgreSQL (Drizzle/Express)** | 12 جدول، كل البيانات التشغيلية | مصدر الحقيقة الحالي |
| **localStorage** | رحلات السفر، مهام العمل، مسودة الستوري، الإعدادات الشخصية | بيانات محلية |
| **Supabase** | Auth فقط — /admin login | يعمل |
| **External API** | مواقيت الصلاة (Aladhan) | يعمل |

---

## جدول مصادر البيانات التفصيلي

| الصفحة/الميزة | المصدر الحالي | جدول PostgreSQL (Drizzle) | جدول Supabase | عامة/خاصة | يحتاج user_id | يحتاج Migration | درجة المخاطر | القرار المقترح |
|---|---|---|---|---|---|---|---|---|
| **الرئيسية — رسالة اليوم** | PostgreSQL API | `daily_messages` | `daily_messages` | عامة (admin_managed) | لا | نعم | منخفضة | seed + بيانات حالية |
| **الرئيسية — مواقيت الصلاة** | Aladhan API خارجي | `prayer_times` (cache) | غير موجود | عامة | لا | لا | منخفضة | يبقى external API |
| **الرئيسية — العدادات المالية** | PostgreSQL API | `financial_events` | `financial_events` | مشتركة حالياً* | نعم (مستقبلاً) | نعم | متوسطة | migration + إضافة user_id |
| **التقويم — المواعيد** | PostgreSQL API | `appointments` | `appointments` | مشتركة حالياً* | نعم (مستقبلاً) | نعم | متوسطة | migration + إضافة user_id |
| **المال — الأحداث المالية** | PostgreSQL API | `financial_events` | `financial_events` | مشتركة حالياً* | نعم (مستقبلاً) | نعم | متوسطة | migration + إضافة user_id |
| **المال — الحاسبات** | حسابات محلية | — | — | محلية | لا | لا | لا يوجد | يبقى محلياً |
| **ستوري اليوم — القوالب** | PostgreSQL API | `story_templates` | `story_templates` | عامة (admin_managed) | لا | نعم | منخفضة | seed + بيانات حالية |
| **ستوري اليوم — المسودة** | localStorage | `mawaeedak_story_v1` | — | محلية | لا | لا | لا يوجد | يبقى localStorage |
| **الإشعارات** | PostgreSQL API | `notifications` | `notifications` | مشتركة حالياً* | نعم (مستقبلاً) | نعم | متوسطة | migration + إضافة user_id |
| **الإشعارات — التفضيلات** | localStorage | — | `notification_preferences` | خاصة | نعم | لا (بيانات جديدة) | منخفضة | ربط بـ Supabase مباشرة |
| **مراكز — الأعمال** | localStorage | — | — | محلية | لا | لا | لا يوجد | يبقى localStorage |
| **مراكز — السفر** | localStorage | `mawaeedak_travel_v1` | — | محلية | لا | لا | لا يوجد | يبقى localStorage |
| **مراكز — الدراسة** | حسابات محلية | — | — | محلية | لا | لا | لا يوجد | يبقى محلياً |
| **مراكز — الأخبار** | PostgreSQL API | `news` | `news` | عامة (admin_managed) | لا | نعم | منخفضة | seed + بيانات حالية |
| **مراكز — الوظائف** | PostgreSQL API | `jobs` | `jobs` | عامة (admin_managed) | لا | نعم | منخفضة | seed + بيانات حالية |
| **مراكز — التهاني** | حسابات محلية | — | — | محلية | لا | لا | لا يوجد | يبقى محلياً |
| **مراكز — الشكاوى** | PostgreSQL API | `complaints` | `complaints` | مشتركة | user_id اختياري | نعم | منخفضة | migration |
| **حسابي — الملف الشخصي** | localStorage (`app-user`) | — | `profiles` | خاصة | نعم | لا (بيانات جديدة) | منخفضة | ربط بـ Supabase مستقبلاً |
| **حسابي — الثيمات** | PostgreSQL API | `themes` | `themes` | عامة (admin_managed) | لا | نعم | منخفضة | seed + بيانات حالية |
| **حسابي — الثيم المختار** | localStorage (`app-mode`) | — | `profiles.theme_preference` | خاصة | نعم | لا (بيانات جديدة) | منخفضة | ربط بـ Supabase مستقبلاً |
| **الإدارة — Auth** | Supabase Auth | — | `auth.users` + `user_roles` | خاصة | نعم | تم | لا يوجد | يعمل |
| **الإدارة — الأحداث** | PostgreSQL API | `public_events` | `public_events` | عامة (admin_managed) | لا | نعم | منخفضة | seed |
| **الإدارة — الرسائل** | PostgreSQL API | `daily_messages` | `daily_messages` | عامة (admin_managed) | لا | نعم | منخفضة | seed |
| **Audit Logs** | PostgreSQL API | `audit_logs` | `audit_logs` | admin_managed | لا | نعم | منخفضة | migration |

> *مشتركة حالياً: لا يوجد user_id في schema الحالي — كل البيانات global

---

## فحص كل جدول

### جداول Drizzle (PostgreSQL الحالي)

| الجدول | في PostgreSQL | في Supabase | بيانات حالية | يحتاج Migration | user-owned | admin-managed | يحتاج RLS | يحتاج Seed |
|---|---|---|---|---|---|---|---|---|
| `appointments` | ✅ 2 صف | ✅ موجود | نعم | نعم | نعم (مستقبلاً) | لا | نعم | لا |
| `financial_events` | ✅ 8 صف | ✅ موجود | نعم | نعم | نعم (مستقبلاً) | لا | نعم | لا |
| `daily_messages` | ✅ 8 صف | ✅ موجود | نعم | نعم | لا | نعم | لا (عامة) | نعم |
| `story_templates` | ✅ 2 صف | ✅ موجود | نعم | نعم | لا | نعم | لا (عامة) | نعم |
| `themes` | ✅ 10 صف | ✅ موجود | نعم | نعم | لا | نعم | لا (عامة) | نعم |
| `notifications` | ✅ 3 صف | ✅ موجود | نعم | نعم | نعم (مستقبلاً) | لا | نعم | لا |
| `public_events` | ✅ 0 صف | ✅ موجود | لا | نعم (seed) | لا | نعم | لا (عامة) | نعم |
| `news` | ✅ 2 صف | ✅ موجود | نعم | نعم | لا | نعم | لا (عامة) | نعم |
| `jobs` | ✅ 2 صف | ✅ موجود | نعم | نعم | لا | نعم | لا (عامة) | نعم |
| `complaints` | ✅ 3 صف | ✅ موجود | نعم | نعم | اختياري | لا | نعم | لا |
| `audit_logs` | ✅ 28 صف | ✅ موجود | نعم | نعم | لا | نعم | نعم (admin فقط) | لا |
| `prayer_times` | ✅ (cache) | ❌ غير موجود | cache فقط | لا | لا | لا | لا | لا |

### جداول Supabase فقط (غير موجودة في Drizzle)

| الجدول | في PostgreSQL | في Supabase | الغرض | user-owned | admin-managed | يحتاج Seed |
|---|---|---|---|---|---|---|
| `profiles` | ❌ | ✅ | ملف المستخدم الشخصي | نعم | لا | لا (auto-created) |
| `roles` | ❌ | ✅ | تعريف الأدوار | لا | نعم | نعم |
| `permissions` | ❌ | ✅ | تعريف الصلاحيات | لا | نعم | نعم |
| `role_permissions` | ❌ | ✅ | ربط دور بصلاحيات | لا | نعم | نعم |
| `user_roles` | ❌ | ✅ | ربط مستخدم بدور | نعم | نعم | نعم (hrq→super_admin) |
| `admin_users` | ❌ | ✅ | قائمة المسؤولين | لا | نعم | نعم |
| `notification_preferences` | ❌ | ✅ | تفضيلات الإشعارات | نعم | لا | لا |
| `app_settings` | ❌ | ✅ | إعدادات التطبيق | لا | نعم | نعم |

---

## الاختلافات الحرجة بين Schema الحالي وSupabase

| الاختلاف | الوصف | درجة الخطورة | الحل المقترح |
|---|---|---|---|
| **غياب user_id** | جداول appointments/financial_events/notifications لا تحتوي `user_id` في Drizzle | عالية | إضافة عمود `user_id uuid` + migration |
| **prayer_times** | موجود في Drizzle كـ cache، غير موجود في Supabase | منخفضة | يبقى cache محلي أو يُحذف |
| **نوع ID** | Drizzle يستخدم `serial` (integer)، Supabase يستخدم `uuid` | عالية | الجداول المشتركة تحتاج تعديل أو wrapper |
| **عدم وجود `owner_id`** | Drizzle tables ليست مربوطة بـ user | عالية | إضافة foreign key لـ `auth.users(id)` |
| **created_at type** | Drizzle timestamp، Supabase timestamptz | منخفضة | قابل للتحويل |

---

## ملخص القرارات

| التصنيف | الجداول |
|---|---|
| **يبقى في PostgreSQL/Express** (لا تغيير الآن) | الكل — مصدر الحقيقة الحالي |
| **أولوية migration عالية** | `daily_messages`, `story_templates`, `themes`, `news`, `jobs` (admin-managed، بلا user_id) |
| **أولوية migration متوسطة** | `appointments`, `financial_events`, `notifications`, `complaints` (تحتاج user_id) |
| **يبقى localStorage** | مهام العمل، رحلات السفر، مسودة الستوري، الثيم المختار، الملف الشخصي |
| **Supabase Auth فقط** | /admin — يعمل بالفعل |
| **Supabase جاهز للربط** | `profiles`, `notification_preferences` (بيانات جديدة) |

---

## تحديث Phase 12C — Admin Seed Status (2026-05-24)

### حالة جداول admin-managed بعد Phase 12C

| الجدول | PostgreSQL (الحالي) | Supabase Seed | الأعمدة المُضافة |
|---|---|---|---|
| `daily_messages` | 8 صف ✅ | SQL جاهز ⏳ | legacy_id, migrated_at, migration_batch |
| `story_templates` | 2 صف ✅ | SQL جاهز ⏳ | legacy_id, migrated_at, migration_batch |
| `themes` | 10 صف ✅ | SQL جاهز ⏳ | legacy_id, migrated_at, migration_batch |
| `news` | 2 صف ✅ | SQL جاهز ⏳ | legacy_id, migrated_at, migration_batch |
| `jobs` | 2 صف ✅ | SQL جاهز ⏳ | legacy_id, migrated_at, migration_batch |
| `public_events` | 0 صف | متجاهل | — |

**مصدر الحقيقة:** PostgreSQL/Express/Drizzle — لا تغيير

---

## تحديث Phase 12D — User-owned Core Migration Status (2026-05-24)

| الجدول | PostgreSQL (الحالي) | Supabase Seed | user_id |
|---|---|---|---|
| `appointments` | 2 صف ✅ | SQL جاهز ⏳ | hrq@hotmail.com UUID |
| `financial_events` | 8 صف ✅ | SQL جاهز ⏳ | hrq@hotmail.com UUID |
| `notifications` | لم تُنقل | — | — |
| `complaints` | لم تُنقل | — | — |

**مصدر الحقيقة:** PostgreSQL/Express/Drizzle — لا تغيير

---

## تحديث Phase 12D Verification (2026-05-24)

### الحالة النهائية لكل الجداول في Supabase

| الجدول | PostgreSQL | Supabase | user_id | الحكم |
|---|---|---|---|---|
| `appointments` | 2 صف ✅ | 2 صف ✅ | hrq UUID ✅ | Applied |
| `financial_events` | 8 صف ✅ | 8 صف ✅ | hrq UUID ✅ | Applied |
| `notifications` | 3 صف | 0 صف | — | ⏳ Phase 12E |
| `complaints` | 3 صف | 0 صف | — | ⏳ Phase 12E |
| `daily_messages` | 8 صف ✅ | 8 صف ✅ | — | Applied (12C) |
| `themes` | 10 صف ✅ | 10 صف ✅ | — | Applied (12C) |
| `news` | 2 صف ✅ | 2 صف ✅ | — | Applied (12C) |
| `jobs` | 2 صف ✅ | 2 صف ✅ | — | Applied (12C) |
| `story_templates` | 2 صف ✅ | 2 صف ✅ | — | Applied (12C) |

**مصدر الحقيقة الحالي:** PostgreSQL/Express/Drizzle — لا تغيير حتى Phase 12F

---

## تحديث Phase 12E — Support Data Migration Ready (2026-05-24)

| الجدول | PostgreSQL | Supabase | user_id | الحكم |
|---|---|---|---|---|
| `notifications` | 3 صف ✅ | SQL جاهز ⏳ | hrq UUID | Needs SQL Run |
| `complaints` | 3 صف ✅ | SQL جاهز ⏳ | NULL | Needs SQL Run |
| `appointments` | 2 صف ✅ | 2 صف ✅ | hrq UUID ✅ | Applied (12D) |
| `financial_events` | 8 صف ✅ | 8 صف ✅ | hrq UUID ✅ | Applied (12D) |

**بعد تشغيل 12E: إجمالي Supabase = 40 صف**
**مصدر الحقيقة الحالي:** PostgreSQL/Express/Drizzle — لا تغيير حتى Phase 12F

---

## تحديث Phase 12E Verification (2026-05-24)

### الحالة النهائية لكل الجداول في Supabase — 40 صف

| الجدول | PostgreSQL | Supabase | user_id | الحكم |
|---|---|---|---|---|
| `daily_messages` | 8 ✅ | 8 ✅ | — | Applied (12C) |
| `story_templates` | 2 ✅ | 2 ✅ | — | Applied (12C) |
| `themes` | 10 ✅ | 10 ✅ | — | Applied (12C) |
| `news` | 2 ✅ | 2 ✅ | — | Applied (12C) |
| `jobs` | 2 ✅ | 2 ✅ | — | Applied (12C) |
| `appointments` | 2 ✅ | 2 ✅ | hrq UUID ✅ | Applied (12D) |
| `financial_events` | 8 ✅ | 8 ✅ | hrq UUID ✅ | Applied (12D) |
| `notifications` | 3 ✅ | 3 ✅ | hrq UUID ✅ | Applied (12E) |
| `complaints` | 3 ✅ | 3 ✅ | NULL ✅ | Applied (12E) |

**مصدر الحقيقة الحالي:** PostgreSQL/Express/Drizzle — لا تغيير حتى Phase 12F

---

## تحديث Phase 12F — Supabase Shadow Read (2026-05-24)

### Data Layer Architecture

```
الحالي (Phase 12F):
  UI → Orval hooks → Express API → PostgreSQL
                                     ↑
                              مصدر الحقيقة

Shadow (عند VITE_DATA_SOURCE_MODE=supabase_shadow):
  UI → Orval hooks → Express API → PostgreSQL  ← يُعرض للمستخدم
  supabaseData.ts → Supabase DB               ← مقارنة فقط

القادم (Phase 12G):
  UI → supabaseData.ts → Supabase DB  ← مصدر الحقيقة الجديد
```

### الملفات الجديدة

| الملف | الدور |
|---|---|
| `src/lib/dataSourceMode.ts` | Feature flag ("api" افتراضياً) |
| `src/lib/supabaseData.ts` | 9 دوال قراءة + runShadowComparison |

### Shadow Comparison المتوقع (API = Supabase = 40 صف)

| الجدول | API | Supabase | Match |
|---|---|---|---|
| daily_messages | 8 | 8 | ✅ |
| story_templates | 2 | 2 | ✅ |
| themes | 10 | 10 | ✅ |
| news | 2 | 2 | ✅ |
| jobs | 2 | 2 | ✅ |
| appointments | 2 | 2 | ✅ |
| financial_events | 8 | 8 | ✅ |
| notifications | 3 | 3 | ✅ |
| complaints | 3 | 3 | ✅ |

**مصدر الحقيقة:** PostgreSQL/Express/Drizzle — لا تغيير حتى Phase 12G

---

## تحديث Phase 12G — Data Gateway Cutover (2026-05-24)

### الملفات الجديدة

| الملف | الدور |
|---|---|
| `src/lib/dataGateway.ts` | Data Gateway — يوجّه القراءة حسب الوضع |
| `src/features/admin/AdminDataLayer.tsx` | لوحة مقارنة طبقة البيانات في /admin/data-layer |

### Data Gateway — gwGet functions

| الدالة | API Path | Supabase Reader |
|---|---|---|
| `gwGetDailyMessages` | /api/daily-messages | getDailyMessagesFromSupabase |
| `gwGetStoryTemplates` | /api/story-templates | getStoryTemplatesFromSupabase |
| `gwGetThemes` | /api/themes | getThemesFromSupabase |
| `gwGetNews` | /api/news | getNewsFromSupabase |
| `gwGetJobs` | /api/jobs | getJobsFromSupabase |
| `gwGetAppointments` | /api/appointments | getAppointmentsFromSupabase |
| `gwGetFinancialEvents` | /api/financial-events | getFinancialEventsFromSupabase |
| `gwGetNotifications` | /api/notifications | getNotificationsFromSupabase |
| `gwGetComplaints` | /api/complaints | getComplaintsFromSupabase |

### قرار Mutations

**Read Cutover فقط** — كل عمليات POST/PATCH/DELETE تبقى على API/PostgreSQL.
الحكم: **Supabase Read Cutover Ready** وليس Full Supabase Data Source.

### Data Flow المعتمد

```
mode=api (الافتراضي):
  غير متأثر — Orval hooks → Express API → PostgreSQL

mode=supabase_shadow:
  Orval hooks → Express API → PostgreSQL (للواجهة)
  gwRunShadowComparison → Supabase (مقارنة في /admin/data-layer)

mode=supabase:
  gwGet* → Supabase → PostgreSQL/API (fallback)
  Mutations: Express API → PostgreSQL (لم تتغير)
```

---

## تحديث Phase 12H — Frontend Read Gateway Integration (2026-05-24)

### ملف جديد

| الملف | الدور |
|---|---|
| `src/hooks/useGatewayData.ts` | React Query hooks تغلّف gwGet* للقراءة |

### تصنيف الصفحات

| الصفحة | مصدر القراءة | مصدر الكتابة | الملاحظة |
|---|---|---|---|
| CentersNewsPage | Gateway (gw:news) | — | read-only ✅ |
| CentersJobsPage | Gateway (gw:jobs) | — | read-only ✅ |
| AccountPage | Gateway (gw:themes) | localStorage | theme ✅ |
| StoryPage | Gateway (gw:story-templates) + Orval | localStorage | templates ✅ |
| CalendarPage | Orval → API | Orval → API | Phase 12I |
| FinancePage | Orval → API | Orval → API | Phase 12I |
| NotificationsPage | Orval → API | Orval → API | Phase 12I |
| HomePage | Orval → API | — | Phase 12I |
| Admin pages | Orval → API | Orval → API | Phase 12I |

---

## تحديث Phase 12I — Controlled Write Cutover (2026-05-24)

### ملفات جديدة / محدّثة

| الملف | التغيير |
|---|---|
| `src/lib/supabaseData.ts` | WriteResult + markNotificationReadInSupabase + markAllNotificationsReadInSupabase |
| `src/lib/dataGateway.ts` | gwMarkNotificationRead + gwMarkAllNotificationsRead |
| `src/features/admin/AdminDataLayer.tsx` | Write Test UI + mutations inventory |

### سياسة الكتابة الكاملة

| الصفحة / الجدول | القراءة | الكتابة | الوضع |
|---|---|---|---|
| notifications (gateway test) | — | gwMarkNotificationRead → Supabase (mode=supabase) | Write Gateway |
| NotificationsPage | Orval → API | Orval → API | Phase 12J |
| CalendarPage | Orval → API | Orval → API | Phase 12J |
| FinancePage | Orval → API | Orval → API | Phase 12J |
| Admin pages | Orval → API | Orval → API | Phase 12J |
| CentersNewsPage | Gateway → Supabase/API | — | read-only |
| CentersJobsPage | Gateway → Supabase/API | — | read-only |
| AccountPage | Gateway → Supabase/API | localStorage | read-only |
| StoryPage | Gateway → Supabase/API | localStorage | read-only |

---

## تحديث Phase 12J — Notifications Read+Write Consistency (2026-05-24)

### ملفات مُعدَّلة

| الملف | التغيير |
|---|---|
| `src/lib/supabaseData.ts` | deleteNotificationInSupabase |
| `src/lib/dataGateway.ts` | gwDeleteNotification |
| `src/features/notifications/NotificationsPage.tsx` | Gateway read+write |

### خريطة البيانات المحدَّثة

| الصفحة | القراءة | الكتابة | ملاحظة |
|---|---|---|---|
| NotificationsPage | useGatewayNotifications | gwMark*/gwDelete | ✅ متسق Phase 12J |
| TopBar (عداد) | useGatewayUnreadCount | — | ✅ 12K |
| AdminNotifications | useGatewayNotifications | delete→Gateway / send→API | ✅ 12K |
| CentersNewsPage | useGatewayNews | — | read-only ✅ |
| CentersJobsPage | useGatewayJobs | — | read-only ✅ |
| AdminNewsJobs | useGatewayNews + useGatewayJobs | gwCreate/Update/Delete News/Job | ✅ 12L |
| AccountPage | useGatewayThemes | localStorage | read-only ✅ |
| StoryPage | useGatewayStoryTemplates | localStorage | read-only ✅ |
| CalendarPage | Orval → API | Orval → API | ⏳ Phase 12M+ |
| FinancePage | Orval → API | Orval → API | ⏳ Phase 12M+ |

---

## تحديث Phase 12L — Admin News/Jobs CRUD Gateway (2026-05-25)

### ملفات مُعدَّلة

| الملف | التغيير |
|---|---|
| `src/lib/supabaseData.ts` | 6 دوال جديدة: createNewsInSupabase / updateNewsInSupabase / deleteNewsInSupabase / createJobInSupabase / updateJobInSupabase / deleteJobInSupabase + NewsPayload + JobPayload |
| `src/lib/dataGateway.ts` | imports محدَّثة + gwCreateNews / gwUpdateNews / gwDeleteNews / gwCreateJob / gwUpdateJob / gwDeleteJob (6 دوال) |
| `src/features/admin/AdminNewsJobs.tsx` | إعادة كتابة كاملة — read: useGatewayNews/useGatewayJobs / write: gw* async functions |

### سلوك AdminNewsJobs بعد Phase 12L

| العملية | mode=api | mode=supabase_shadow | mode=supabase |
|---|---|---|---|
| قراءة news/jobs | API (Gateway hook) | API (Gateway hook) | Supabase |
| إضافة خبر/وظيفة | POST /api/news|jobs | POST /api/news|jobs | Supabase INSERT |
| تعديل خبر/وظيفة | PATCH /api/news|jobs/:id | PATCH /api/news|jobs/:id | Supabase UPDATE |
| حذف خبر/وظيفة | DELETE /api/news|jobs/:id | DELETE /api/news|jobs/:id | Supabase DELETE |
| فشل write عند supabase | — | — | toast خطأ صريح (لا fallback صامت) |

### خريطة البيانات الكاملة بعد Phase 12L

| الصفحة | القراءة | الكتابة | الاتساق |
|---|---|---|---|
| TopBar | useGatewayUnreadCount | — | ✅ 12K |
| NotificationsPage | useGatewayNotifications | gw* writes | ✅ 12J |
| AdminNotifications | useGatewayNotifications | delete→Gateway / send→API | ✅ 12K |
| CentersNewsPage | useGatewayNews | — | ✅ read-only |
| CentersJobsPage | useGatewayJobs | — | ✅ read-only |
| AdminNewsJobs | useGatewayNews + useGatewayJobs | gwCreate/Update/Delete News/Job | ✅ 12L |
| AdminThemes | useGatewayThemes | gwUpdateTheme | ✅ 12M |
| AdminStory | useGatewayStoryTemplates | gwCreate/Update/Delete StoryTemplate | ✅ 12M |
| AdminMessages | useGatewayDailyMessages | gwCreate/Update/Delete DailyMessage | ✅ 12M |
| AccountPage | useGatewayThemes | localStorage | ✅ |
| StoryPage | useGatewayStoryTemplates | localStorage | ✅ |
| CalendarPage | useGatewayAppointments | gwCreate/Update/Delete Appointment | ✅ 12N |
| HomePage (upcoming) | useGatewayUpcomingAppointments | gwCreateAppointment | ✅ 12N |
| FinancePage | useGatewayFinancialCountdown | gwCreate/Update/Delete FinancialEvent | ✅ 12O |
| HomePage (countdown) | useGatewayFinancialCountdown | — | ✅ 12O |
| StoryPage (counters) | useGatewayFinancialCountdown | — | ✅ 12O |

### Divergence المتبقي بعد Phase 12M

| النطاق | الوضع | المخاطرة |
|---|---|---|
| CalendarPage CRUD | Orval/API فقط | متوسطة (appointments — user-owned) |
| FinancePage CRUD | Orval/API فقط | متوسطة (financial_events — user-owned) |
| AdminNotifications send | API فقط (fan-out) | منخفضة (موثَّق عمداً) |

---

## تحديث Phase 12M — Admin Content CRUD Gateway (2026-05-25)

### ملفات مُعدَّلة

| الملف | التغيير |
|---|---|
| `src/lib/supabaseData.ts` | ThemeUpdatePayload + updateThemeInSupabase / StoryTemplatePayload + 3 دوال / DailyMessagePayload + 3 دوال |
| `src/lib/dataGateway.ts` | 7 gateway functions جديدة + imports |
| `src/features/admin/AdminThemes.tsx` | useGatewayThemes + gwUpdateTheme |
| `src/features/admin/AdminStory.tsx` | useGatewayStoryTemplates + gw* |
| `src/features/admin/AdminMessages.tsx` | useGatewayDailyMessages + gw* |

### خريطة البيانات الكاملة بعد Phase 12M

| الصفحة | القراءة | الكتابة | الاتساق |
|---|---|---|---|
| TopBar | useGatewayUnreadCount | — | ✅ 12K |
| NotificationsPage | useGatewayNotifications | gw* writes | ✅ 12J |
| AdminNotifications | useGatewayNotifications | delete→Gateway / send→API | ✅ 12K |
| CentersNewsPage | useGatewayNews | — | ✅ read-only |
| CentersJobsPage | useGatewayJobs | — | ✅ read-only |
| AdminNewsJobs | useGatewayNews + useGatewayJobs | gwCreate/Update/Delete | ✅ 12L |
| AdminThemes | useGatewayThemes | gwUpdateTheme | ✅ 12M |
| AdminStory | useGatewayStoryTemplates | gwCreate/Update/Delete | ✅ 12M |
| AdminMessages | useGatewayDailyMessages | gwCreate/Update/Delete | ✅ 12M |
| AccountPage | useGatewayThemes | localStorage | ✅ |
| StoryPage | useGatewayStoryTemplates | localStorage | ✅ |
| CalendarPage | useGatewayAppointments | gwCreate/Update/Delete Appointment | ✅ 12N |
| HomePage (upcoming) | useGatewayUpcomingAppointments | gwCreateAppointment | ✅ 12N |
| FinancePage | useGatewayFinancialCountdown | gwCreate/Update/Delete FinancialEvent | ✅ 12O |
| HomePage (countdown) | useGatewayFinancialCountdown | — | ✅ 12O |
| StoryPage (counters) | useGatewayFinancialCountdown | — | ✅ 12O |

---

## تحديث Phase 12K — Notification System Full Consistency (2026-05-25)

### ملفات مُعدَّلة

| الملف | التغيير |
|---|---|
| `src/lib/supabaseData.ts` | `getUnreadNotificationsCountFromSupabase()` |
| `src/lib/dataGateway.ts` | `gwGetUnreadNotificationsCount()` |
| `src/hooks/useGatewayData.ts` | `gwQueryKeys.unreadCount` + `useGatewayUnreadCount()` |
| `src/components/layout/TopBar.tsx` | Gateway hook للعداد |
| `src/features/admin/AdminNotifications.tsx` | Gateway read + delete |

### خريطة نظام الإشعارات الكاملة

| المكوّن | القراءة | الكتابة | Gateway Key |
|---|---|---|---|
| TopBar | useGatewayUnreadCount | — | ['gw','unread-count'] |
| NotificationsPage | useGatewayNotifications | gw* functions | ['gw','notifications'] |
| AdminNotifications | useGatewayNotifications | gwDeleteNotification / useCreateNotification | ['gw','notifications'] |

### خريطة البيانات الكاملة بعد Phase 12K

| الصفحة | القراءة | الكتابة | الاتساق |
|---|---|---|---|
| TopBar | Gateway unreadCount | — | ✅ 12K |
| NotificationsPage | Gateway notifications | Gateway writes | ✅ 12J |
| AdminNotifications | Gateway notifications | delete→Gateway / send→API | ✅ 12K |
| CentersNewsPage | Gateway news | — | ✅ read-only |
| CentersJobsPage | Gateway jobs | — | ✅ read-only |
| AccountPage | Gateway themes | localStorage | ✅ |
| StoryPage | Gateway story-templates | localStorage | ✅ |
| CalendarPage | Orval → API | Orval → API | ⏳ Phase 12L |
| FinancePage | Orval → API | Orval → API | ⏳ Phase 12L |

---

## Phase 12P: Final Gateway Coverage Summary (2026-05-25)

### Gateway Complete (قراءة + كتابة — mode-aware)

| النطاق | الصفحات | المرحلة |
|---|---|---|
| appointments | CalendarPage + HomePage (upcoming) | 12N |
| financial_events | FinancePage + HomePage (countdown) + StoryPage | 12O |
| notifications | NotificationsPage + TopBar + AdminNotifications | 12J/12K |
| news | CentersNewsPage + AdminNewsJobs | 12H/12L |
| jobs | CentersJobsPage + AdminNewsJobs | 12H/12L |
| themes | AccountPage + AdminThemes | 12H/12M |
| story_templates | StoryPage + AdminStory | 12H/12M |
| daily_messages | HomePage + StoryPage + AdminMessages | 12H/12M |
| complaints | AdminDataLayer (read) | 12G |

### API Intentionally (لا تحويل مخطط — موثق)

| النطاق | السبب |
|---|---|
| prayer_times | server-computed — لا مكافئ Supabase |
| today_message | server-computed — لا مكافئ Supabase |
| admin stats | server-computed aggregate |
| audit_logs | server-only trail |
| public_events | ليس في Supabase schema |
| AdminFinancial CRUD | admin view كل users — لا RLS |
| notification send | fan-out server-side |
| complaints write | Orval form → API مباشرة |

### Remaining Orval Imports (مقبول — لا data fetching)

| الملف | الاستخدام | السبب |
|---|---|---|
| CalendarPage | getListAppointmentsQueryKey, type Appointment | cache invalidation + type فقط |
| NotificationsPage | getGetUnreadNotificationsCountQueryKey | cache invalidation فقط |
| AdminMessages/Story/Themes | get*QueryKey | cache invalidation فقط |
| AdminNewsJobs | getListNewsQueryKey, getListJobsQueryKey | cache invalidation فقط |
