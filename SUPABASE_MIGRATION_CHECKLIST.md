# SUPABASE_MIGRATION_CHECKLIST.md — مواعيدك
**تاريخ الإنشاء:** 2026-05-24 | Phase 12A
**الحالة:** Draft — لم يُنفَّذ بعد

---

## قائمة التحقق قبل Migration

### Pre-flight

- [ ] تم أخذ backup كامل من PostgreSQL الحالي
- [ ] تم التحقق من سلامة الـ backup
- [ ] Supabase project يعمل وله URL + anon key
- [ ] تم مراجعة SUPABASE_MIGRATION_PLAN.md كاملاً
- [ ] تم الاتفاق على freeze period
- [ ] لا يوجد مستخدمون نشطون أثناء Migration

### Schema

- [ ] مقارنة أعمدة كل جدول Drizzle مع Supabase
- [ ] `appointments.user_id` عمود موجود أو مضاف في Supabase
- [ ] `financial_events.user_id` عمود موجود أو مضاف
- [ ] `notifications.user_id` عمود موجود أو مضاف
- [ ] لا مخالفات NOT NULL بدون default
- [ ] serial IDs متوافقة أو تم تحويل الاستراتيجية

### RLS

- [ ] RLS مفعّل على كل الجداول
- [ ] anon يستطيع SELECT من الجداول العامة (daily_messages, themes, news, jobs)
- [ ] anon لا يستطيع INSERT/UPDATE/DELETE
- [ ] authenticated يستطيع قراءة بياناته الخاصة فقط (appointments بـ user_id)
- [ ] admin يستطيع كل العمليات

### Roles & Auth

- [ ] `roles` table مُعبّأ (super_admin, admin, content_manager, finance_manager, user)
- [ ] `permissions` table مُعبّأ
- [ ] `role_permissions` table مُعبّأ
- [ ] hrq@hotmail.com في `admin_users` كـ super_admin
- [ ] hrq@hotmail.com في `user_roles` مرتبط بـ super_admin

---

## قائمة التحقق أثناء Migration

### Seed Admin-Managed Data

- [ ] `daily_messages`: نُقل 8 صف → تم التحقق من العدد
- [ ] `story_templates`: نُقل 2 صف → تم التحقق
- [ ] `themes`: نُقل 10 صف → تم التحقق
- [ ] `news`: نُقل 2 صف → تم التحقق
- [ ] `jobs`: نُقل 2 صف → تم التحقق
- [ ] `public_events`: لا بيانات (0) — تم التحقق

### Migrate User-Owned Data

- [ ] تم تحديد user_id لكل سجل
- [ ] `appointments`: نُقل 2 صف → تم التحقق
- [ ] `financial_events`: نُقل 8 صف → تم التحقق
- [ ] `notifications`: نُقل 3 صف → تم التحقق

### Migrate Admin Data

- [ ] `complaints`: نُقل 3 صف → تم التحقق
- [ ] `audit_logs`: نُقل 28 صف → تم التحقق

---

## قائمة التحقق بعد Migration

### Data Integrity

- [ ] تطابق عدد الصفوف في كل جدول (Drizzle = Supabase)
- [ ] لا nulls في حقول مطلوبة
- [ ] لا duplicates في primary keys
- [ ] timestamps صحيحة

### RLS Verification

- [ ] اختبر anon SELECT من `daily_messages` → نجح
- [ ] اختبر anon INSERT في `appointments` → فشل (42501)
- [ ] اختبر hrq SELECT من `appointments` → نجح (user_id يطابق)
- [ ] اختبر مستخدم آخر لا يرى appointments المستخدم الأول

### Application Testing

- [ ] الرئيسية تعمل ومواقيت الصلاة ظاهرة
- [ ] التقويم يعرض المواعيد
- [ ] المال يعرض الأحداث المالية
- [ ] ستوري اليوم يعرض القوالب
- [ ] الإشعارات تعمل
- [ ] المراكز — الأخبار والوظائف تظهر
- [ ] حسابي — الثيمات تظهر
- [ ] /admin يعمل بـ Supabase Auth
- [ ] hrq@hotmail.com يدخل كـ super_admin
- [ ] لا API 500

### Build & Typecheck

- [ ] `pnpm run typecheck` → 0 أخطاء
- [ ] `PORT=5173 BASE_PATH=/ pnpm --filter @workspace/mawaeedak run build` → ناجح
- [ ] `pnpm --filter @workspace/api-server run build` → ناجح

### Security

- [ ] لا service_role في أي ملف frontend
- [ ] لا hardcoded keys
- [ ] لا hardcoded passwords (باستثناء demo fallback في auth.ts)
- [ ] Supabase anon key فقط في VITE_SUPABASE_ANON_KEY

---

## Rollback Checklist

عند الفشل في أي خطوة:

- [ ] تشغيل `psql "$DATABASE_URL" < backup_YYYYMMDD.sql`
- [ ] إعادة Express routes من git
- [ ] التحقق أن التطبيق يعمل من PostgreSQL الأصلي
- [ ] إلغاء أي RLS changes في Supabase
- [ ] توثيق سبب الفشل في QA_REPORT

---

## الحالة الحالية (2026-05-24)

| العنصر | الحالة |
|---|---|
| Backup | ❌ لم يُأخذ |
| Schema Validation | ⚠️ فرق في user_id + ID type |
| Seed Admin Data | ⏳ SQL جاهز — ينتظر تشغيل Supabase SQL Editor |
| Migrate User Data | ❌ لم يُنفَّذ |
| RLS | ✅ مفعّل (يمنع anon INSERT) |
| Auth | ✅ يعمل |
| Build | ✅ ناجح |
| Typecheck | ✅ ناجح |

**الخلاصة:** المشروع في حالة Migration Ready للبيانات الثابتة (admin-managed)، ويحتاج schema fix لـ user_id قبل migration البيانات الشخصية.

---

## Phase 12D — User-owned Core Data Migration (2026-05-24)

| الخطوة | الحالة |
|---|---|
| تشخيص appointments schema | ✅ مكتمل |
| تشخيص financial_events schema | ✅ مكتمل |
| التحقق من توافق الأعمدة | ✅ 100% توافق |
| تجهيز SUPABASE_USER_CORE_MIGRATION.sql | ✅ جاهز |
| RAISE EXCEPTION إذا user غير موجود | ✅ موجود |
| WHERE NOT EXISTS — idempotent | ✅ موجود |
| تجهيز SUPABASE_USER_CORE_VERIFY.sql | ✅ جاهز |
| تجهيز SUPABASE_USER_CORE_COUNTS.md | ✅ جاهز |
| تشغيل migration فعلياً | ⏳ ينتظر Supabase SQL Editor |
| build ناجح | ✅ 15.20s |
| typecheck ناجح | ✅ 0 أخطاء |

---

## Phase 12D Verification — مكتملة (2026-05-24)

| المقياس | النتيجة |
|---|---|
| appointments في Supabase | ✅ 2 صف |
| financial_events في Supabase | ✅ 8 صف |
| كل الصفوف مربوطة بـ hrq@hotmail.com | ✅ 10/10 |
| 0 صف بدون user_id | ✅ |
| legacy_id في كل الصفوف | ✅ |
| migration_batch محفوظ | ✅ |
| 0 duplicates | ✅ |
| notifications لم تُنقل | ✅ |
| complaints لم تُنقل | ✅ |
| build ناجح | ✅ 15.14s |
| typecheck ناجح | ✅ 0 أخطاء |
| **الحكم** | **✅ User Core Migration Applied** |

---

## Phase 12E — Support Data Migration Preparation (2026-05-24)

| الخطوة | الحالة |
|---|---|
| تشخيص notifications schema PG | ✅ — id, title, body, type, is_read, created_at |
| تشخيص complaints schema PG | ✅ — id, type, message, contact, status, created_at |
| تشخيص Supabase notifications | ✅ — + user_id(nullable CASCADE) + migration cols |
| تشخيص Supabase complaints | ✅ — + user_id(nullable SET NULL) + migration cols |
| التحقق من توافق الأعمدة | ✅ 100% توافق كامل |
| قرار user_id notifications | ✅ hrq@hotmail.com UUID |
| قرار user_id complaints | ✅ NULL (مرسِلون مجهولون) |
| تجهيز SUPABASE_SUPPORT_DATA_MIGRATION.sql | ✅ جاهز |
| RAISE EXCEPTION إذا user غير موجود | ✅ |
| WHERE NOT EXISTS — idempotent | ✅ |
| تجهيز SUPABASE_SUPPORT_DATA_VERIFY.sql | ✅ جاهز |
| تجهيز SUPABASE_SUPPORT_DATA_COUNTS.md | ✅ جاهز |
| SQL safety: لا DROP/TRUNCATE/DELETE | ✅ |
| SQL safety: لا appointments/financial_events | ✅ |
| SQL safety: لا profiles/user_roles/admin_users | ✅ |
| تشغيل migration فعلياً | ⏳ ينتظر Supabase SQL Editor |
| build ناجح | ✅ 15.11s |
| typecheck ناجح | ✅ 0 أخطاء |
| **الحكم** | **⏳ Support Data Migration Ready — Needs SQL Run** |

---

## Phase 12E Verification — مكتملة (2026-05-24)

| المقياس | النتيجة |
|---|---|
| notifications في Supabase | ✅ 3 صف |
| complaints في Supabase | ✅ 3 صف |
| notifications مرتبطة بـ hrq@hotmail.com | ✅ 3/3 |
| complaints.user_id = NULL | ✅ 3/3 |
| legacy_id في كل الصفوف | ✅ |
| migration_batch محفوظ | ✅ phase_12e_support_seed_2026_05_24 |
| 0 duplicates | ✅ |
| appointments بقيت 2 | ✅ |
| financial_events بقيت 8 | ✅ |
| build ناجح | ✅ 15.38s |
| typecheck ناجح | ✅ 0 أخطاء |
| إجمالي Supabase | 40 صف ✅ |
| **الحكم** | **✅ Support Data Migration Applied** |

---

## Phase 12F — Supabase Data Layer Shadow Read (2026-05-24)

| الخطوة | الحالة |
|---|---|
| تشخيص Data Layer الحالي | ✅ |
| تشخيص API schemas + hooks | ✅ |
| تحديد shape الواجهة لكل جدول | ✅ |
| تحديد اختلافات الأعمدة | ✅ |
| إنشاء dataSourceMode.ts | ✅ |
| Feature flag افتراضي "api" | ✅ |
| إنشاء supabaseData.ts | ✅ |
| 9 دوال قراءة Supabase | ✅ |
| Shadow comparison utility | ✅ |
| legacy_id → id mapping | ✅ |
| amount numeric → Number() | ✅ |
| null-safe — لا exceptions | ✅ |
| لا service_role | ✅ |
| لا JWTs hardcoded | ✅ |
| API لا يزال المصدر الافتراضي | ✅ |
| لا تغيير في مصدر الحقيقة | ✅ |
| build ناجح | ✅ 15.08s |
| typecheck ناجح | ✅ 0 أخطاء |
| **الحكم** | **✅ Data Layer Shadow Ready** |

---

## Phase 12G — Controlled Supabase Data Layer Cutover (2026-05-24)

| الخطوة | الحالة |
|---|---|
| تشخيص response shapes لـ 9 endpoints | ✅ كل endpoints تُعيد plain array |
| تحديد Mutations في features | ✅ موثَّقة — 12 ملف |
| القرار: Read Cutover فقط (mutations على API) | ✅ |
| توثيق القرار في QA_REPORT قبل التنفيذ | ✅ |
| إنشاء src/lib/dataGateway.ts | ✅ |
| gateway يدعم mode=api | ✅ |
| gateway يدعم mode=supabase_shadow | ✅ |
| gateway يدعم mode=supabase مع fallback | ✅ |
| fetchApi helper — plain array + {data:[...]} | ✅ |
| 9 دوال gwGet* (قراءة فقط) | ✅ |
| gwRunShadowComparison — يجمع API counts + يقارن | ✅ |
| إنشاء AdminDataLayer.tsx — لوحة طبقة البيانات | ✅ |
| إضافة /admin/data-layer إلى App router | ✅ |
| إضافة "طبقة البيانات" في قائمة Admin | ✅ |
| mutations تبقى على API بالكامل | ✅ |
| لا service_role | ✅ |
| لا أسرار hardcoded | ✅ |
| لا DROP/TRUNCATE/DELETE | ✅ |
| لا بيانات جديدة نُقلت | ✅ |
| لا تغيير في التصميم | ✅ |
| API endpoints سليمة | ✅ |
| PostgreSQL سليم | ✅ |
| build ناجح | ✅ |
| typecheck ناجح | ✅ 0 أخطاء |
| **الحكم** | **✅ Supabase Read Cutover Ready** |

---

## Phase 12H — Frontend Read Gateway Integration (2026-05-24)

| الخطوة | الحالة |
|---|---|
| تشخيص Orval hooks في كل الصفحات | ✅ |
| تصنيف: read-only vs read+write | ✅ |
| إنشاء useGatewayData.ts (9 hooks) | ✅ |
| CentersNewsPage → useGatewayNews | ✅ |
| CentersJobsPage → useGatewayJobs | ✅ |
| AccountPage → useGatewayThemes | ✅ |
| StoryPage templates → useGatewayStoryTemplates | ✅ |
| CalendarPage → يبقى Orval (CRUD مختلط) | ⏳ Phase 12I |
| FinancePage → يبقى Orval (CRUD مختلط) | ⏳ Phase 12I |
| NotificationsPage → يبقى Orval (mark-read + delete) | ⏳ Phase 12I |
| HomePage → يبقى Orval (endpoints خاصة) | ⏳ Phase 12I |
| mutations لم تتحول | ✅ |
| لا service_role | ✅ |
| لا DROP/TRUNCATE/DELETE | ✅ |
| build ناجح | ✅ |
| typecheck ناجح | ✅ 0 أخطاء |
| **الحكم** | **✅ Frontend Read Cutover Ready** |

---

## Phase 12I — Controlled Write Cutover (2026-05-24)

| الخطوة | الحالة |
|---|---|
| تأكيد dataSourceMode يقرأ env | ✅ يعمل صحيح |
| جرد كل mutations + تصنيف | ✅ 12 mutation مُصنَّفة |
| اختيار نطاق منخفض الخطورة | ✅ notifications mark-read |
| تبرير الاختيار | ✅ idempotent + RLS متوافق |
| فحص RLS notifications_update_own | ✅ auth.uid() = user_id |
| إضافة markNotificationReadInSupabase | ✅ |
| إضافة markAllNotificationsReadInSupabase | ✅ |
| إضافة gwMarkNotificationRead | ✅ |
| إضافة gwMarkAllNotificationsRead | ✅ |
| Write Test في AdminDataLayer | ✅ |
| mode=api: لا كتابة لـ Supabase | ✅ |
| mode=supabase_shadow: لا كتابة لـ Supabase | ✅ |
| mode=supabase: يكتب لـ Supabase (test) | ✅ |
| لا fallback صامت لـ API عند فشل Supabase | ✅ |
| لا service_role | ✅ |
| لا DROP/TRUNCATE/DELETE | ✅ |
| لا أسرار hardcoded | ✅ |
| لا Publish | ✅ |
| appointments/financial_events write: ممنوع | ✅ لم تُلمس |
| NotificationsPage: تبقى على Orval | ✅ Phase 12J |
| build ناجح | ✅ |
| typecheck ناجح | ✅ 0 أخطاء |
| **الحكم** | **✅ Partial Write Cutover Ready** |

---

## Phase 12J — Notifications Read+Write Consistency (2026-05-24)

| الخطوة | الحالة |
|---|---|
| تشخيص NotificationsPage الحالية | ✅ |
| فحص unreadCount في TopBar | ✅ |
| فحص RLS policies للـ 3 عمليات | ✅ |
| فحص data shape API vs Supabase | ✅ |
| إضافة deleteNotificationInSupabase | ✅ |
| إضافة gwDeleteNotification | ✅ |
| إعادة كتابة NotificationsPage — Gateway read | ✅ |
| إعادة كتابة NotificationsPage — mark-read Gateway | ✅ |
| إعادة كتابة NotificationsPage — mark-all-read Gateway | ✅ |
| إعادة كتابة NotificationsPage — delete Gateway | ✅ |
| Cache invalidation بعد كل write | ✅ |
| Loading states لكل عملية | ✅ |
| Error toast بدون كسر الصفحة | ✅ |
| mode=api يعمل | ✅ |
| mode=supabase_shadow يعمل | ✅ |
| mode=supabase يقرأ ويكتب بشكل متسق | ✅ |
| لا تحويل نطاقات أخرى | ✅ |
| لا service_role | ✅ |
| لا DROP/TRUNCATE/DELETE (schema-level) | ✅ |
| build ناجح | ✅ |
| typecheck ناجح | ✅ 0 أخطاء |
| **الحكم** | **✅ Notifications Gateway Cutover Ready** |

---

## Phase 12K — Notification System Full Consistency (2026-05-25)

| الخطوة | الحالة |
|---|---|
| تشخيص TopBar hook الحالي | ✅ |
| تشخيص AdminNotifications | ✅ |
| قرار send: يبقى API (موثَّق) | ✅ |
| قرار TopBar count: Gateway | ✅ |
| قرار AdminNotifications read: Gateway | ✅ |
| قرار AdminNotifications delete: Gateway | ✅ |
| إضافة getUnreadNotificationsCountFromSupabase | ✅ |
| إضافة gwGetUnreadNotificationsCount | ✅ |
| إضافة gwQueryKeys.unreadCount | ✅ |
| إضافة useGatewayUnreadCount | ✅ |
| تحديث TopBar | ✅ |
| تحديث AdminNotifications | ✅ |
| Invalidation: gwQueryKeys.unreadCount بعد كل write | ✅ |
| Invalidation: gwQueryKeys.notifications بعد كل write | ✅ |
| Orval keys invalidation للتوافق مع send | ✅ |
| لا service_role | ✅ |
| لا DROP/TRUNCATE | ✅ |
| لا أسرار hardcoded | ✅ |
| build ناجح | ✅ |
| typecheck ناجح | ✅ 0 أخطاء |
| **الحكم** | **✅ Notification System Consistent** |

---

## Phase 12L — Admin News/Jobs CRUD Gateway Cutover (2026-05-25)

| الخطوة | الحالة |
|---|---|
| تشخيص AdminNewsJobs hooks الحالية (Orval) | ✅ |
| تشخيص news/jobs id type (integer مباشر — row.id) | ✅ |
| إضافة createNewsInSupabase + NewsPayload interface | ✅ |
| إضافة updateNewsInSupabase | ✅ |
| إضافة deleteNewsInSupabase | ✅ |
| إضافة createJobInSupabase + JobPayload interface | ✅ |
| إضافة updateJobInSupabase | ✅ |
| إضافة deleteJobInSupabase | ✅ |
| تحديث imports في dataGateway.ts | ✅ |
| إضافة gwCreateNews / gwUpdateNews / gwDeleteNews | ✅ |
| إضافة gwCreateJob / gwUpdateJob / gwDeleteJob | ✅ |
| AdminNewsJobs: read → useGatewayNews / useGatewayJobs | ✅ |
| AdminNewsJobs: write → gw* async functions | ✅ |
| Invalidation: gwQueryKeys.news + getListNewsQueryKey | ✅ |
| Invalidation: gwQueryKeys.jobs + getListJobsQueryKey | ✅ |
| mode=api: fetch /api/news /api/jobs | ✅ |
| mode=supabase_shadow: fetch API (لا Supabase write) | ✅ |
| mode=supabase: Supabase INSERT/UPDATE/DELETE | ✅ |
| لا fallback صامت في write عند mode=supabase | ✅ |
| error toast عند فشل write | ✅ |
| CentersNewsPage / CentersJobsPage سليمتان | ✅ |
| Calendar / Finance / Themes لم تُلمس | ✅ |
| لا service_role | ✅ |
| لا أسرار hardcoded | ✅ |
| لا DROP/TRUNCATE/DELETE | ✅ |
| typecheck ناجح (0 أخطاء) | ✅ |
| build ناجح (14.25s) | ✅ |
| **الحكم** | **✅ Admin News/Jobs CRUD Gateway Ready** |

---

## Phase 12M — Admin Content CRUD Gateway Cutover (2026-05-25)
### Themes + Story Templates + Daily Messages

| الخطوة | الحالة |
|---|---|
| تدقيق Phase 12L: news/jobs id = integer مباشر (row.id) — لا تعديل لازم | ✅ |
| تشخيص AdminThemes: update-only (لا create/delete) | ✅ |
| تشخيص AdminStory: full CRUD + toggle | ✅ |
| تشخيص AdminMessages: full CRUD (لا toggle منفصل — update is_active) | ✅ |
| إضافة ThemeUpdatePayload + updateThemeInSupabase | ✅ |
| إضافة StoryTemplatePayload + createStoryTemplateInSupabase | ✅ |
| إضافة updateStoryTemplateInSupabase | ✅ |
| إضافة deleteStoryTemplateInSupabase | ✅ |
| إضافة DailyMessagePayload + createDailyMessageInSupabase | ✅ |
| إضافة updateDailyMessageInSupabase | ✅ |
| إضافة deleteDailyMessageInSupabase | ✅ |
| تحديث imports في dataGateway.ts | ✅ |
| إضافة gwUpdateTheme | ✅ |
| إضافة gwCreateStoryTemplate / gwUpdateStoryTemplate / gwDeleteStoryTemplate | ✅ |
| إضافة gwCreateDailyMessage / gwUpdateDailyMessage / gwDeleteDailyMessage | ✅ |
| AdminThemes: read → useGatewayThemes / write → gwUpdateTheme | ✅ |
| AdminStory: read → useGatewayStoryTemplates / write → gw* async functions | ✅ |
| AdminMessages: read → useGatewayDailyMessages / write → gw* async functions | ✅ |
| Invalidation themes: gwQueryKeys.themes + getListThemesQueryKey | ✅ |
| Invalidation story: gwQueryKeys.storyTemplates + getListStoryTemplatesQueryKey | ✅ |
| Invalidation messages: gwQueryKeys.dailyMessages + getListDailyMessagesQueryKey | ✅ |
| mode=api: fetch /api/themes|story-templates|daily-messages | ✅ |
| mode=supabase_shadow: fetch API (لا Supabase write) | ✅ |
| mode=supabase: Supabase UPDATE/INSERT/DELETE | ✅ |
| لا fallback صامت في write عند mode=supabase | ✅ |
| error toast عند فشل write | ✅ |
| Theme Engine لم ينكسر | ✅ |
| StoryPage / AccountPage / HomePage سليمة | ✅ |
| Calendar / Finance لم يُلمسا | ✅ |
| appointments / financial_events لم يُلمسا | ✅ |
| لا service_role | ✅ |
| لا أسرار hardcoded | ✅ |
| لا DROP/TRUNCATE/DELETE | ✅ |
| typecheck ناجح (0 أخطاء) | ✅ |
| build ناجح (14.36s) | ✅ |
| **الحكم** | **✅ Admin Content CRUD Gateway Ready** |

---

## Phase 12N — Calendar Appointments Gateway Cutover (2026-05-25)

| الخطوة | الحالة |
|---|---|
| تدقيق CalendarPage: Orval hooks (useListAppointments, useCreate/Update/DeleteAppointment) | ✅ |
| تدقيق HomePage: useListUpcomingAppointments + useCreateAppointment (Orval) | ✅ |
| تدقيق id/legacy_id: مُهاجَر → legacy_id / جديد → Supabase.id | ✅ |
| استراتيجية update/delete: .or('legacy_id.eq.X,id.eq.X') | ✅ |
| استراتيجية create: INSERT بدون legacy_id → Supabase يُعيّن id | ✅ |
| استراتيجية filter: client-side (search + category) | ✅ |
| إضافة AppointmentPayload interface | ✅ |
| إضافة mapAppointmentRow helper | ✅ |
| إضافة getUpcomingAppointmentsFromSupabase | ✅ |
| إضافة createAppointmentInSupabase | ✅ |
| إضافة updateAppointmentInSupabase (.or filter) | ✅ |
| إضافة deleteAppointmentInSupabase (.or filter) | ✅ |
| تحديث imports في dataGateway.ts | ✅ |
| إضافة gwGetUpcomingAppointments | ✅ |
| إضافة gwCreateAppointment | ✅ |
| إضافة gwUpdateAppointment | ✅ |
| إضافة gwDeleteAppointment | ✅ |
| إضافة gwQueryKeys.upcomingAppointments | ✅ |
| إضافة useGatewayUpcomingAppointments(limit) | ✅ |
| CalendarPage: read → useGatewayAppointments | ✅ |
| CalendarPage: create → gwCreateAppointment (async) | ✅ |
| CalendarPage: update → gwUpdateAppointment (async) | ✅ |
| CalendarPage: delete → gwDeleteAppointment (async) | ✅ |
| CalendarPage: client-side filter (search + category) | ✅ |
| CalendarPage: invalidation شامل (gw + Orval keys) | ✅ |
| HomePage: upcoming → useGatewayUpcomingAppointments(5) | ✅ |
| HomePage: create → gwCreateAppointment (async) | ✅ |
| HomePage: invalidation شامل (gw + Orval keys) | ✅ |
| RLS user_id في create: getCurrentUserId() | ✅ |
| RLS user_id في update/delete: مُطبَّق بـ RLS تلقائياً | ✅ |
| mode=api: /api/appointments | ✅ |
| mode=supabase_shadow: /api/appointments | ✅ |
| mode=supabase: Supabase INSERT/UPDATE/DELETE | ✅ |
| لا fallback صامت في write عند mode=supabase | ✅ |
| error toast عند فشل write | ✅ |
| FinancePage لم يُلمس | ✅ |
| financial_events لم يُلمس | ✅ |
| لا service_role | ✅ |
| لا أسرار hardcoded | ✅ |
| لا DROP/TRUNCATE/DELETE غير مقصود | ✅ |
| typecheck ناجح (0 أخطاء) | ✅ |
| build ناجح | ✅ |
| **الحكم** | **✅ Calendar Appointments Gateway Ready** |

---

## Phase 12O — Finance Events Gateway Cutover (2026-05-25)

| الخطوة | الحالة |
|---|---|
| تدقيق FinancePage: Orval hooks (useGetFinancialCountdown, useCreate/Update/Delete) | ✅ |
| تدقيق HomePage: useGetFinancialCountdown (Orval) | ✅ |
| تدقيق StoryPage: useGetFinancialCountdown (Orval) | ✅ |
| تحليل countdown calculation: Math.ceil((nextDate-now)/msPerDay) + is_active=true | ✅ |
| قرار cutover: كامل آمن — الحساب مطابق | ✅ |
| تحليل id/legacy_id strategy | ✅ |
| تحليل amount: numeric → Number() | ✅ |
| إضافة FinancialEventPayload interface | ✅ |
| إضافة getFinancialCountdownFromSupabase | ✅ |
| إضافة createFinancialEventInSupabase | ✅ |
| إضافة updateFinancialEventInSupabase (.or filter) | ✅ |
| إضافة deleteFinancialEventInSupabase (.or filter) | ✅ |
| تحديث imports في dataGateway.ts | ✅ |
| إضافة gwGetFinancialCountdown | ✅ |
| إضافة gwCreateFinancialEvent | ✅ |
| إضافة gwUpdateFinancialEvent | ✅ |
| إضافة gwDeleteFinancialEvent | ✅ |
| إضافة gwQueryKeys.financialCountdown | ✅ |
| إضافة useGatewayFinancialCountdown | ✅ |
| FinancePage: read → useGatewayFinancialCountdown | ✅ |
| FinancePage: create → gwCreateFinancialEvent (async) | ✅ |
| FinancePage: update → gwUpdateFinancialEvent (async) | ✅ |
| FinancePage: delete → gwDeleteFinancialEvent (async) | ✅ |
| FinancePage: invalidation → gwQueryKeys.financialCountdown + .financialEvents | ✅ |
| FinancePage: الحاسبات لم تُلمس (pure functions) | ✅ |
| FinancePage: ConfirmDialog سليم | ✅ |
| FinancePage: toast سليم | ✅ |
| HomePage: countdown → useGatewayFinancialCountdown | ✅ |
| StoryPage: countdown → useGatewayFinancialCountdown | ✅ |
| mode=api: /api/financial-events/countdown | ✅ |
| mode=supabase_shadow: /api/financial-events/countdown | ✅ |
| mode=supabase: Supabase SELECT is_active=true + compute days_remaining | ✅ |
| لا fallback صامت في write عند mode=supabase | ✅ |
| error toast عند فشل write | ✅ |
| amount: String() عند INSERT, Number() عند SELECT | ✅ |
| user_id في create: getCurrentUserId() | ✅ |
| CalendarPage لم يُلمس | ✅ |
| appointments لم يُلمس | ✅ |
| لا service_role | ✅ |
| لا أسرار hardcoded | ✅ |
| لا DROP/TRUNCATE/DELETE غير مقصود | ✅ |
| typecheck ناجح (0 أخطاء) | ✅ |
| build ناجح | ✅ |
| **الحكم** | **✅ Finance Events Gateway Ready** |

---

## Phase 12P — Final Gateway Coverage Audit (2026-05-25)

| الخطوة | الحالة |
|---|---|
| تدقيق NotificationsPage — الكود الفعلي | ✅ Gateway Complete (12J/12K صحيح) |
| حسم تعارض التوثيق: تعليق useGatewayData.ts القديم | ✅ تم تحديث التعليق |
| تدقيق TopBar unread count | ✅ useGatewayUnreadCount |
| تدقيق AdminNotifications read/delete | ✅ Gateway |
| تدقيق AdminNotifications send | ✅ API Intentionally (fan-out) |
| تدقيق CalendarPage — Orval imports المتبقية | ✅ type + invalidation keys فقط |
| تدقيق AdminNewsJobs | ✅ Gateway Complete |
| تدقيق AdminThemes/Story/Messages | ✅ Gateway Complete |
| تدقيق AdminFinancial | ✅ API Intentionally (admin view كل المستخدمين) |
| تدقيق AdminEvents | ✅ API Intentionally (public_events ليس في Supabase) |
| تدقيق AdminDashboard/Reports | ✅ API Intentionally (server-computed) |
| تدقيق CentersNewsPage | ✅ Gateway Read Only |
| تدقيق CentersJobsPage | ✅ Gateway Read Only |
| تدقيق AccountPage | ✅ Gateway Read Only (themes) |
| تدقيق CentersComplaintsPage | ✅ API Intentionally (write-only form) |
| تدقيق HomePage | ✅ Gateway Complete (prayer/message API intentional) |
| تدقيق FinancePage | ✅ Gateway Complete (12O) |
| تدقيق StoryPage | ✅ Gateway (message API intentional) |
| تصنيف كل Orval imports المتبقية | ✅ موثق |
| Final Gateway Coverage Matrix | ✅ في QA_REPORT |
| تدقيق dataSourceMode: default=api | ✅ |
| تدقيق security: service_role | ✅ لا |
| تدقيق security: hardcoded secrets | ✅ لا |
| تدقيق security: DROP/TRUNCATE | ✅ لا |
| تحديث useGatewayData.ts header comment | ✅ |
| typecheck ناجح (0 أخطاء) | ✅ |
| build ناجح | ✅ |
| **الحكم** | **✅ Final Gateway Coverage Verified** |

---

## Phase 12Q — Production Hardening Gate (2026-05-25)

| الخطوة | الحالة |
|---|---|
| تدقيق dataSourceMode.ts | ✅ default=api مثبّت، كل الأوضاع تعمل |
| تحديث dataSourceMode.ts comment (Phase 12Q) | ✅ |
| إضافة VITE_DATA_SOURCE_MODE إلى .env.example | ✅ |
| إضافة VITE_DATA_SOURCE_MODE إلى ENV_EXAMPLE.md | ✅ |
| تدقيق AdminLayout guard | ✅ hasAdminAccess + ALLOWED_ROLES |
| تدقيق demo bypass في الإنتاج | ✅ آمن — Supabase keys تُعطّله |
| تدقيق role trust model | ✅ user_metadata.role — موثق كقيد |
| تدقيق service_role | ✅ لا — ANON_KEY فقط |
| تدقيق hardcoded secrets | ✅ لا |
| تدقيق DROP/TRUNCATE | ✅ لا |
| تقييم API intentionally كمانع إنتاج | ✅ لا شيء مانع |
| تحديث ARCHITECTURE.md | ✅ Security Model + Gateway Coverage |
| تحديث SUPABASE_MIGRATION_PLAN.md | ✅ Production Env Requirements |
| تحديث QA_REPORT.md | ✅ |
| typecheck ناجح (0 أخطاء) | ✅ |
| build ناجح (14.15s) | ✅ |
| **الحكم** | **✅ Production Ready Candidate** |

---

## Phase 12R — Production Deployment Verification (2026-05-25)

| الخطوة | الحالة |
|---|---|
| VITE_DATA_SOURCE_MODE=supabase ضُبط في Replit Secrets | ✅ |
| restart workflow لالتقاط المتغير الجديد | ✅ |
| browser console يؤكد وضع supabase | ✅ `[DataLayer] وضع البيانات: supabase` |
| [Supabase] متصل | ✅ |
| demo mode معطّل (Supabase keys موجودة) | ✅ |
| HomePage smoke test | ✅ |
| CalendarPage smoke test | ✅ `appointments → 0 صف` (RLS صحيح) |
| FinancePage smoke test | ✅ |
| StoryPage smoke test | ✅ `story-templates → 2 صف` |
| NotificationsPage smoke test | ✅ `notifications → 0 صف` (RLS صحيح) |
| CentersNewsPage smoke test | ✅ `news → 2 صف` |
| CentersJobsPage smoke test | ✅ `jobs → 2 صف` |
| AccountPage smoke test | ✅ `themes → 10 صف` |
| /admin guard مع Supabase Auth | ✅ |
| لا API 500 | ✅ |
| لا شاشة بيضاء | ✅ |
| لا console errors جوهرية | ✅ |
| security scan نظيف | ✅ |
| typecheck (0 أخطاء) | ✅ |
| build (14.29s) | ✅ |
| لا بيانات اختبارية متروكة | ✅ |
| التوثيق محدث | ✅ |
| **الحكم** | **✅ Production Ready** |
