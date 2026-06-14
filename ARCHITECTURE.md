# Architecture — مواعيدك (Web/PWA Only)

## نظرة عامة

تطبيق Web/PWA أحادي الصفحة (SPA) مبني على pnpm monorepo، بثلاثة أجزاء رئيسية:

```
Frontend (React/Vite)  →  API Server (Express 5)  →  PostgreSQL (Supabase)
```

**ملاحظة**: تم إزالة جميع مكونات Mobile/Flutter/Expo. التطبيق الآن Web/PWA فقط.

---

## بنية Monorepo

```
artifacts/
  mawaeedak/          # SPA — React 18 + Vite + Tailwind v4
  api-server/         # API — Express 5 + TypeScript

lib/
  api-spec/           # OpenAPI 3.1 YAML — source of truth
  api-client-react/   # Generated: React Query hooks (Orval)
  api-zod/            # Generated: Zod v4 schemas (Orval)
  db/                 # Drizzle ORM schema + client
```

---

## Frontend — `artifacts/mawaeedak`

**Stack**: React 18, Vite, Tailwind CSS v4, wouter, Tanstack Query, shadcn/ui, Tajawal font

**RTL-first**: جميع الواجهة بالعربية مع direction:rtl

**Routing**: wouter (client-side SPA)

```
src/
  App.tsx              # Root — ErrorBoundary + Router
  pages/               # صفحات كل مسار
  features/            # صفحات المميزات (home/calendar/finance/centers/admin/…)
  components/
    layout/            # AppShell + TopBar + BottomNav
    ui/                # shadcn/ui components
    ErrorBoundary.tsx  # Error Boundary عربي يغلّف كامل التطبيق
  hooks/
    useStore.tsx       # Global state (StoreProvider)
    useTheme.ts        # Theme engine hook
  lib/
    utils.ts           # Hijri/Gregorian date utilities
```

**Theme Engine**: CSS variables مع `data-theme` attribute — ثيمات في PostgreSQL
- **الثيم الافتراضي العام**: يضبطه المالك من `/admin/themes` ويُخزَّن في جدول `app_settings` عبر Express (`PUT /api/settings/default-theme` محمي بـ `requireAdmin`). يقرأه `useTheme` من `GET /api/settings/default-theme` (عام).
- **الثيم الشخصي**: يختاره المستخدم من `/account` ويُحفظ محلياً (`localStorage: app-theme`) ويتجاوز الافتراضي العام. "العودة للافتراضي" تمسح التفضيل الشخصي.

**Auth & Admin Protection**:
- الواجهة: Supabase Auth (JWT). توكن الجلسة يُرفق تلقائياً على الـ hooks المولّدة وعلى النداءات الخام عبر `authedFetch`/`apiAuth.ts`.
- الخادم: middleware `requireAdmin` يحمي المسارات الإدارية — يتحقق من Bearer JWT عبر `${SUPABASE_URL}/auth/v1/user` ويسمح فقط بالأدوار `admin`/`super_admin` (401 بدون توكن، 403 لدور غير مصرّح، 503 عند غياب إعداد Supabase في الخادم).
- لا يوجد تجاوز عبر localStorage للحماية الخادمية — admin الوهمي المحلي لا يملك JWT ويُرفض.

---

## API Server — `artifacts/api-server`

**Stack**: Express 5, TypeScript, Drizzle ORM, Zod v4

**Contract-first**: المسارات مُعرَّفة أولاً في `lib/api-spec/openapi.yaml` → codegen

**Base path**: `/api`

**المسارات الحالية** (17+ endpoint):
```
GET/POST/PUT/DELETE /api/appointments
GET/POST/PUT/DELETE /api/financial-events
GET/POST/PUT/DELETE /api/notifications
GET/POST/PUT/DELETE /api/daily-messages
GET/POST/PUT/DELETE /api/themes
GET/POST/PUT/DELETE /api/news
GET/POST/PUT/DELETE /api/jobs
GET/POST            /api/complaints
GET/POST/PUT/DELETE /api/story-templates
GET/POST            /api/audit-logs
GET/POST/PUT/DELETE /api/public-events
GET                 /api/admin/*
GET                 /api/healthz
```

---

## Data Layer — PostgreSQL + Drizzle ORM

**12 جدول** في `lib/db/src/schema/`:

| الجدول | الوصف |
|---|---|
| `appointments` | مواعيد المستخدم (CRUD كامل) |
| `financial_events` | أحداث مالية (راتب/دعم/فاتورة) |
| `notifications` | إشعارات داخلية |
| `daily_messages` | رسائل اليوم (admin_managed) |
| `themes` | تعريف الثيمات العشرة |
| `news` | أخبار (admin_managed) |
| `jobs` | وظائف (admin_managed) |
| `prayer_times` | مواقيت الصلاة (تقديرية/static) |
| `public_events` | أحداث عامة (admin_managed) |
| `complaints` | شكاوى ومقترحات المستخدمين |
| `audit_logs` | سجل نشاطات الإدارة |
| `story_templates` | قوالب ستوري اليوم |

**ملاحظة**: الجداول الحالية لا تحتوي `user_id` — بياناتها مشتركة (demo mode). عند ربط Supabase، يُضاف `user_id UUID REFERENCES auth.users` + RLS.

---

## Notification Center

- إشعارات داخلية فقط (قاعدة بيانات)
- Push Notifications: **مؤجل** (لا Firebase/Supabase Realtime حالياً)
- Admin يرسل إشعاراً → يُخزَّن في DB → يظهر للمستخدمين

---

## PWA / Error Boundary / 404

- **manifest.json**: موجود مع `lang:ar`, `dir:rtl`, `favicon.svg` icon
- **Service Worker**: **مؤجل** — لا vite-plugin-pwa حالياً
- **Offline Fallback**: **مؤجل**
- **Error Boundary**: `src/components/ErrorBoundary.tsx` — يغلّف كامل App
- **صفحة 404**: `src/pages/not-found.tsx` — عربية مع ثيم التطبيق

---

## Story Today

1. يجلب قوالب من DB (`story_templates`)
2. يجلب رسالة اليوم من DB (`daily_messages`)
3. يجلب العدادات المالية من DB (`financial_events`)
4. المستخدم يختار قالباً ويعدّل النص
5. نسخ / مشاركة (Web Share API) / حفظ (localStorage)

---

## Centers — المراكز الثمانية

| المركز | مصدر البيانات |
|---|---|
| الأعمال | localStorage (`mawaeedak_work_tasks_v1`) |
| السفر | localStorage |
| الدراسة | localStorage |
| الأخبار | PostgreSQL (`news`) |
| الوظائف | PostgreSQL (`jobs`) |
| التهاني | static templates في الكود |
| الشكاوى | PostgreSQL (`complaints`) |
| اتصل بنا (ستوري) | يعيد توجيه لـ StoryPage |

---

## Admin Workflows

- Auth: demo mode (localStorage `admin_authenticated`)
- لوحة التحكم: إدارة كاملة لجميع جداول DB
- audit_logs: يُسجَّل كل إجراء إداري
- AdminNotifications: إرسال إشعار → `/api/notifications` POST

---

## Data Layer — Phase 12G (Supabase Read Cutover Ready)

### الحالة الحالية (2026-05-24)

```
mode=api (الافتراضي):
  Orval hooks → Express API → PostgreSQL

mode=supabase_shadow:
  Orval hooks → Express API → PostgreSQL   ← واجهة المستخدم
  gwRunShadowComparison → Supabase         ← مقارنة /admin/data-layer

mode=supabase:
  gwGet*() → Supabase → fallback → API    ← قراءة
  Mutations (POST/PATCH/DELETE) → API     ← كتابة (لم تتحول بعد)
```

### الملفات المضافة

| الملف | الدور |
|---|---|
| `src/lib/dataSourceMode.ts` | Feature flag — `DATA_SOURCE_MODE` (افتراضي: "api") |
| `src/lib/supabaseData.ts` | 9 دوال قراءة من Supabase + runShadowComparison |
| `src/lib/dataGateway.ts` | Gateway — يوجّه القراءة حسب الوضع |
| `src/features/admin/AdminDataLayer.tsx` | لوحة Data Layer في /admin/data-layer |

### Supabase — الحالة (Phase 12Q)

- **Supabase Auth:** ✅ فعّال — hrq@hotmail.com (super_admin)
- **40 صف منقول:** daily_messages(8) + story_templates(2) + themes(10) + news(2) + jobs(2) + appointments(2) + financial_events(8) + notifications(3) + complaints(3)
- **ANON_KEY فقط** في الواجهة — لا service_role، لا hardcoded secrets
- **RLS:** user-owned tables تُرجع 0 صفوف بدون session (آمن)
- **Gateway Complete:** appointments، financial_events، notifications، news، jobs، themes، story_templates، daily_messages

### Gateway Coverage (Phase 12O/12P)

| النطاق | الحكم | الصفحات |
|---|---|---|
| appointments | Gateway Complete | CalendarPage + HomePage |
| financial_events | Gateway Complete | FinancePage + HomePage + StoryPage |
| notifications | Gateway Complete | NotificationsPage + TopBar + AdminNotifications |
| news | Gateway Complete | CentersNewsPage + AdminNewsJobs |
| jobs | Gateway Complete | CentersJobsPage + AdminNewsJobs |
| themes | Gateway Complete | AccountPage + AdminThemes |
| story_templates | Gateway Complete | StoryPage + AdminStory |
| daily_messages | Gateway Complete | HomePage + StoryPage + AdminMessages |
| prayer_times | API Intentionally | server-computed — لا مكافئ Supabase |
| today_message | API Intentionally | server-computed — لا مكافئ Supabase |
| admin stats + audit_logs | API Intentionally | server-computed aggregates |
| public_events | API Intentionally | ليس في Supabase schema |
| AdminFinancial CRUD | API Intentionally | admin view كل users — لا RLS |
| notification send | API Intentionally | fan-out server-side |
| complaints write | API Intentionally | Orval form submission |

### تغيير الوضع

```bash
# في Replit Secrets أو .env
VITE_DATA_SOURCE_MODE=api              # PostgreSQL/Express (الافتراضي الآمن)
VITE_DATA_SOURCE_MODE=supabase_shadow  # API للعرض + Supabase للمقارنة
VITE_DATA_SOURCE_MODE=supabase         # Supabase مصدر الحقيقة (الإنتاج)
```

**قاعدة مهمة:** القيمة الافتراضية `api` مثبتة في الكود لأسباب أمان. تُغيَّر فقط عبر env variable ولا تُعدَّل في `dataSourceMode.ts` مباشرة.

### Security Model

| الجانب | التفاصيل |
|---|---|
| Auth في الإنتاج | Supabase Auth (email + password) |
| Auth في demo | localStorage فقط (عند غياب VITE_SUPABASE_URL) |
| Role trust | user_metadata.role (يُضبط عند إنشاء المستخدم) |
| Admin guard | ALLOWED_ROLES: admin, super_admin, content_manager, finance_manager |
| Key في الواجهة | ANON_KEY فقط — محمي بـ RLS |
| service_role | ممنوع في الواجهة — server فقط |

> **ملاحظة أمنية:** Role يأتي من `user_metadata.role` في Supabase JWT. للإنتاج الحرج، يُوصى بـ custom claims function بدلاً من user_metadata لمنع المستخدم من تعديل دوره. موثق كقيد حالي غير مانع للاستخدام.

### التوافق مع Expo لاحقاً
- API Server يبقى مرجعاً مشتركاً بين Web و Expo
- Supabase client يعمل على React Native
- Store/hooks قابلة لإعادة الاستخدام

---

## Single Source of Truth

| البيانات | المصدر |
|---|---|
| API contracts | `lib/api-spec/openapi.yaml` |
| DB schema | `lib/db/src/schema/` |
| React Query hooks | `lib/api-client-react/src/generated/` |
| Zod schemas | `lib/api-zod/src/generated/api.ts` |
| Theme colors | PostgreSQL `themes` table + Supabase |
| User preferences | localStorage |
| Admin auth | Supabase Auth (إنتاج) / localStorage demo (بدون مفاتيح) |

