# مواعيدك — Saudi Heritage Daily Planner

منصة سعودية ذكية تجمع المواعيد اليومية والمالية ومواقيت الصلاة والأخبار والوظائف وأدوات الاحتساب في مكان واحد.

---

## حالة الجاهزية

**الحكم الحالي: Publishable Preview**

ليس Production Ready بعد لأن:
- Auth إنتاجي (Supabase) غير مفعّل — demo mode فقط
- RLS / Row-Level Security غير مطبّق على Supabase
- Push Notifications حقيقية غير مفعّلة
- Service Worker / Offline Support غير مفعّل
- بعض البيانات admin_managed أو fallback/تقديرية وليست رسمية
- الصفحات القانونية مسودة تشغيلية وليست مراجَعة قانونياً

---

## تشغيل المشروع

```bash
# API server (port 8080, proxied at /api)
pnpm --filter @workspace/api-server run dev

# Frontend (proxied at /)
pnpm --filter @workspace/mawaeedak run dev
```

### متغيرات البيئة المطلوبة

```
DATABASE_URL=postgres://...
SESSION_SECRET=...
```

انظر `.env.example` للمتغيرات الكاملة.

---

## أوامر البناء والتحقق

```bash
# typecheck كامل (الأسرع للتحقق)
pnpm run typecheck

# build production
PORT=5173 BASE_PATH=/ pnpm --filter @workspace/mawaeedak run build
pnpm --filter @workspace/api-server run build

# codegen من OpenAPI
pnpm --filter @workspace/api-spec run codegen

# push DB schema (dev only)
pnpm --filter @workspace/db run push
```

---

## البنية العامة

```
artifacts/
  mawaeedak/       # Frontend React + Vite + Tailwind v4
  api-server/      # Backend Express 5
  mockup-sandbox/  # Design canvas (dev only)
lib/
  api-spec/        # OpenAPI YAML (source of truth)
  api-client-react/ # Generated React Query hooks
  api-zod/         # Generated Zod schemas
  db/              # Drizzle ORM + PostgreSQL schema
```

---

## الوظائف المنفذة (Publishable Preview)

| الوظيفة | الحالة |
|---|---|
| الرئيسية — التاريخ الهجري/الميلادي + مواقيت الصلاة | ✅ |
| الرئيسية — رسالة اليوم من DB | ✅ |
| الرئيسية — عدادات مالية تنازلية | ✅ |
| التقويم — CRUD كامل للمواعيد | ✅ |
| المال — رواتب/دعم/فواتير + CRUD | ✅ |
| المال — حاسبات ذكية (تقديرية) | ✅ |
| المال — سلم الرواتب (تقديري) | ✅ |
| ستوري اليوم — توليد + نسخ + مشاركة + حفظ | ✅ |
| الإشعارات — CRUD + قراءة/حذف | ✅ |
| مركز الأعمال — مهام بـ localStorage | ✅ |
| مركز السفر — رحلات بـ localStorage | ✅ |
| مركز الدراسة — عداد أيام + تقدم | ✅ |
| مركز الأخبار — بحث في DB | ✅ |
| مركز الوظائف — بحث في DB | ✅ |
| مركز التهاني — 7 أنواع + نسخ/مشاركة | ✅ |
| مركز الشكاوى — نموذج → DB | ✅ |
| اتصل بنا — نموذج → DB | ✅ |
| حسابي — ملف شخصي + إعدادات | ✅ |
| Theme Engine — 10 ثيمات + تطبيق فوري | ✅ |
| لوحة الإدارة — إحصاءات + إدارة كاملة | ✅ |
| الصفحات القانونية — خصوصية/شروط/إخلاء | ✅ |
| Error Boundary عربي | ✅ |
| صفحة 404 عربية | ✅ |
| PWA Manifest | ✅ |

---

## القيود المتبقية

| القيد | الحالة |
|---|---|
| Auth إنتاجي (Supabase) | Demo mode — localStorage |
| RLS / Row-Level Security | غير مطبّق — مؤجل لـ Supabase |
| Push Notifications | مؤجل |
| Service Worker / Offline | مؤجل |
| مواقيت الصلاة | تقديرية — ليست من API رسمي |
| سلم الرواتب | تقديري — ليس رسمي من الحكومة |
| الحاسبات المالية | تقديرية |
| بيانات الأخبار والوظائف | admin_managed |
| الصفحات القانونية | مسودة تشغيلية |

---

## الانتقال إلى الإنتاج

**البنية التحتية جاهزة:**
- `src/lib/supabase.ts` — Supabase client مع fallback آمن
- `src/lib/auth.ts` — Auth service موحد (Supabase أو demo mode)
- `SUPABASE_SCHEMA.sql` — 12 جدول جاهزة للتنفيذ
- `RLS_POLICIES.sql` — سياسات RLS جاهزة للتنفيذ

**الحالة بعد Phase 11C (2026-05-24)**:
- ✅ `VITE_SUPABASE_URL` — مُضاف
- ✅ `VITE_SUPABASE_ANON_KEY` — مُضاف
- ✅ Supabase client متصل فعلاً
- ✅ 12/19 جداول موجودة في Supabase
- ✅ RLS مفعّل على الجداول الموجودة
- ⚠️ 7 جداول ناقصة (roles, permissions, role_permissions, user_roles, admin_users, notification_preferences, app_settings)
- ⚠️ /admin ما زال demo guard

**الخطوات المتبقية:**
1. شغّل SQL إنشاء الجداول الناقصة في Supabase SQL Editor (انظر QA_REPORT.md — Phase 11C)
2. أنشئ admin user في Supabase Auth Dashboard
3. استبدل `AdminLayout` ليستخدم `authSignIn` من `src/lib/auth.ts`
4. **Push**: ربط Firebase Cloud Messaging أو Supabase Realtime
5. **Service Worker**: تفعيل vite-plugin-pwa

---

## بيانات الدخول للإدارة (Demo)

- URL: `/admin`
- Username: `admin`
- Password: `mawaeedak@admin`

> تحذير: هذا وضع تطوير. في الإنتاج يتطلب Supabase Auth.

---

## الفونت والاتجاه

- الخط: Tajawal (Google Fonts)
- الاتجاه: RTL عربي حصراً
- الثيم الافتراضي: التراث التقني الفاخر (ذهبي/نحاسي/بيج)
