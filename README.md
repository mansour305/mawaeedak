# مواعيدك — Saudi Heritage Daily Planner

منصة سعودية ذكية تجمع المواعيد اليومية والمالية ومواقيت الصلاة والأخبار والوظائف وأدوات الاحتساب في مكان واحد.

---

## حالة الجاهزية

**الحكم الحالي: Build-stable Web/PWA preparation with mobile install path**

- `pnpm install` ✅
- `pnpm run typecheck` ✅
- `pnpm run build` ✅ بعد تثبيت إعدادات `PORT` و`BASE_PATH` الافتراضيّة في الواجهة
- `manifest.json` وملفات الأيقونات محدثة للتحضير لإضافة التطبيق إلى الشاشة الرئيسية
- بوابة الإدارة لا تعتمد على `localStorage` للفصل بين المستخدم/المالك
- ويب/PWA قابل للإطلاق محلياً؛ النشر الخارجي يتطلب حساب نشر صالح (مثل Vercel) وتهيئة بيئة الإنتاج

---

## تشغيل المشروع

```bash
# تثبيت التبعيات
pnpm install --frozen-lockfile

# API server (port 8080, proxied at /api)
pnpm --filter @workspace/api-server run dev

# Frontend (proxied at /)
pnpm --filter @workspace/mawaeedak run dev
```

### متغيرات البيئة المطلوبة

```
DATABASE_URL=postgres://...
SESSION_SECRET=...
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_DATA_SOURCE_MODE=supabase   # أو api للاختبار المحلي
```

انظر `.env.example` للمتغيرات الكاملة.

---

## أوامر البناء والتحقق

```bash
# تثبيت متوافق مع pnpm monorepo
pnpm install --frozen-lockfile

# typecheck كامل (الأسرع للتحقق)
pnpm run typecheck

# build production
pnpm run build

# build الواجهة فقط (لا يعتمد على متغيرات محلية)
pnpm --filter @workspace/mawaeedak run build

# build الخادم فقط
pnpm --filter @workspace/api-server run build

# codegen من OpenAPI
pnpm --filter @workspace/api-spec run codegen

# push DB schema (dev only)
pnpm --filter @workspace/db run push
```

## Production Deployment (Vercel)

- **Production URL**: `https://mawaeedak-api-server.vercel.app/`
- **Deployment provider**: Vercel
- **Vercel config**: إضافة `vercel.json` مع rewrite لـ SPA وتوجيه الأصول الثابتة.
- **Build command**: `pnpm --filter @workspace/mawaeedak run build`
- **Output directory**: `artifacts/mawaeedak/dist/public`
- **Environment variable names only**: `VITE_DATA_SOURCE_MODE`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `PORT`, `BASE_PATH`
- **Production smoke results**:
  - `/` → 200 OK
  - `/login` → 200 OK (SPA shell)
  - `/register` → 200 OK (SPA shell)
  - `/account` → 200 OK (SPA shell)
  - `/finance` → 200 OK (SPA shell)
  - `/story` → 200 OK (SPA shell)
  - `/notifications` → 200 OK (SPA shell)
  - `/admin` → 200 OK (SPA shell)
- **PWA smoke results**:
  - `/manifest.json` → 200 OK
  - `/icons/icon-192.svg` → 200 OK
  - `/icons/icon-512.svg` → 200 OK
- **Remaining limitations**:
  - لا توجد قيود تشغيلية متبقية في التحقق البيئي الحالي بعد إعادة نشر Vercel.
  - حماية `/admin` تعتمد على الحارس التشغيلي للواجهة مع بقاء التحقق الأمني في وقت التشغيل.

## PWA / Mobile Install

- `manifest.json` موجود ويستخدم `start_url: /` و`display: standalone`
- الأيقونات الأساسية متوفرة ضمن `public/icons/`
- **iPhone Safari**: فتح الصفحة → Share → Add to Home Screen → Install.
- **Android Chrome**: ⋮ menu → Install app / Add to Home screen.
- يمكن إضافة التطبيق إلى الشاشة الرئيسية من Safari على iPhone أو Chrome على Android
- لا يتم الادعاء بالجاهزية native دون حساب App Store/Google Play وسلاسل توقيع وتخطيط الأيقونات/الشرائح

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
