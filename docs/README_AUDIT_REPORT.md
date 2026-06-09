# تقرير مراجعة README.md — مواعيدك

**تاريخ المراجعة:** 2026-06-09
**المراجع:** Codex Agent
**ملف المراجعة:** `/workspace/project/mawaeedak/README.md`

---

## 1. ملخص تنفيذي

| البند | التقييم |
|---|---|
| الدقة التقنية | ⚠️ يحتاج تحديث |
| التغطية الشاملة | ⚠️ ناقصة |
| التوافق مع الوثائق | ⚠️ غير متسق |
| تحديث الحالة | ❌ غير محدث |

---

## 2. المشكلات الرئيسية المكتشفة

### 2.1 وصف المشروع غير دقيق

**المشكلة:** README يصف المجلد بأنه يحتوي "تعديلات مقترحة على مخطط قاعدة البيانات" فقط، بينما المشروع في الحقيقة هو تطبيق ويب متكامل (SPA) monorepo بميزات متعددة.

**الواقع:**
- المشروع: تطبيق **مواعيدك** - تطبيق جدولة/جدول مواعيد
- البنية: pnpm monorepo مع React/Vite + Express API + PostgreSQL/Drizzle
- الميزات: التقويم، المالية، الإشعارات، الستوري، المراكز، لوحة الإدارة
- Supabase: مُدمج كـ Phase 12 مع Auth/RLS/Gateway

**الموقع:** `README.md` السطور 1-4

---

### 2.2 غياب وصف بنية Monorepo

**المشكلة:** لا يوجد أي ذكر لبنية monorepo أو الأدلة والمكتبات المشاركة.

**الواقع:**
```
artifacts/
  mawaeedak/      # SPA - React 18 + Vite + Tailwind v4
  api-server/     # API - Express 5 + TypeScript

lib/
  api-spec/       # OpenAPI 3.1 YAML
  api-client-react/  # React Query hooks (Orval)
  api-zod/        # Zod v4 schemas (Orval)
  db/             # Drizzle ORM schema
```

**التأثير:** المطور الجديد لا يفهم بنية المشروع.

---

### 2.3 عدم ذكر Supabase/Auth/RLS

**المشكلة:** README لا يذكر Supabase على الإطلاق رغم أنه مكون رئيسي Phase 12.

**الواقع:**
- Supabase Auth مع `hrq@hotmail.com` (super_admin)
- 40 صف منقول إلى Supabase
- RLS policies مُطبقة
- Data Gateway مُعد للتبديل بين API/Supabase
- Feature flag: `VITE_DATA_SOURCE_MODE`

**الموقع:** غياب كامل لأي ذكر لـ Supabase

---

### 2.4 وصف الجداول غير كامل

**المشكلة:** README يصف 12 جدول لكن لا يذكر الجداول الجديدة المضافة (official_financial_dates, official_prayer_times, automation_logs, social_automation, app_settings).

**الجداول الموجودة فعلياً:**
```typescript
appointments.ts, audit_logs.ts, automation_logs.ts, complaints.ts,
daily_messages.ts, financial_events.ts, jobs.ts, news.ts,
notifications.ts, official_financial_dates.ts, official_prayer_times.ts,
prayer_times.ts, public_events.ts, social_automation.ts,
story_templates.ts, themes.ts, app_settings.ts
```

**عدد الجداول الفعلي:** 17 جدول (وليس 12)

---

### 2.5 غياب أي ذكر للميزات الرئيسية

**المشكلة:** README لا يذكر:
- Theme Engine (10 ثيمات)
- PWA/Service Worker
- Error Boundary
- RTL Support
- Push Notifications (مؤجل)
- مراكز الخدمات الثمانية
- لوحة الإدارة
- Story Today

---

### 2.6 غياب المعلومات الأمنية

**المشكلة:** لا يوجد أي ذكر لـ:
- Supabase Auth
- RLS Policies
- Admin middleware (requireAdmin)
- Security measures
- Production vs Demo auth

---

### 2.7 غياب Mobile/Expo

**المشكلة:** README لا يذكر وجود تطبيق mobile في `mobile/README.md`.

**الواقع:**
- Expo + React Native
- RTL-ready
- Supabase + TanStack Query
- Sentry React Native

---

## 3. تحليل الفجوات

### 3.1 مقارنة README vs ARCHITECTURE.md

| المحتوى | في README | في ARCHITECTURE |
|---|---|---|
| وصف المشروع كـ SPA | ❌ | ✅ |
| بنية Monorepo | ❌ | ✅ |
| Frontend stack | ❌ | ✅ |
| API Server stack | ❌ | ✅ |
| Database schema | ⚠️ جزئي | ✅ |
| Supabase/Auth | ❌ | ✅ |
| Data Gateway | ❌ | ✅ |
| RTL/Arabic | ❌ | ✅ |
| Theme Engine | ❌ | ✅ |
| PWA features | ❌ | ✅ |
| Mobile path | ❌ | ✅ |
| Security model | ❌ | ✅ |

---

## 4. حالة المشروع الفعلية

### 4.1 المرحلة الحالية

```
Publishable Preview+ (وليس Production Ready)
```

**الشرط للنتقال لـ Production Ready:**
- Phase 4 Admin Smoke Live Proof
- DB Proof
- Admin Mutation Proof
- Guest/User Denial Proof
- Audit Log Proof
- Vercel Deployment اختبار

### 4.2 الملفات الحرجة غير مذكورة

| الملف | الوصف | الحالة |
|---|---|---|
| `AGENTS.md` | تعليمات Codex | ❌ غير مذكور |
| `ARCHITECTURE.md` | البنية الكاملة | ❌ غير مذكور |
| `DATA_SOURCE_MAP.md` | خريطة البيانات | ❌ غير مذكور |
| `SMOKE_CHECKLIST.md` | قائمة الاختبار | ❌ غير مذكور |
| `docs/PRODUCTION_READINESS_*.md` | بوابات الإنتاج | ❌ غير مذكور |

---

## 5. المخاطر

### 5.1 خطر معلوماتي

**المستوى:** متوسط

- المطور الجديد سيقرأ README ولا يفهم المشروع
- لا يعرف Supabase أو Auth أو RLS
- لا يعرف بنية Monorepo
- لا يعرف الميزات الرئيسية
- قد يفترض أن المشروع " مجرد تعديلات على قاعدة البيانات"

### 5.2 خطر تشويش

**المستوى:** مرتفع

- المعلومات الموجودة مضللة
- تصف المشروع بشكل خاطئ
- لا تعكس الواقع الفعلي

---

## 6. التوصيات

### 6.1 تحديث README فوراً

يجب أن يتضمن README:

1. **وصف المشروع:** تطبيق ويب متكامل لإدارة المواعيد والمواعيد المالية
2. **البنية:** Monorepo مع artifacts/lib
3. **التقنيات:** React 18, Vite, Tailwind v4, Express 5, Drizzle ORM, Supabase
4. **الميزات:** التقويم، المالية، الإشعارات، الستوري، المراكز، الإدارة
5. **Supabase:** Auth + RLS + Gateway
6. **RTL:** عربي أولاً
7. **الروابط:** AGENTS.md, ARCHITECTURE.md, docs/

### 6.2 محتوى README المُوصى به

```markdown
# مواعيدك — Mawaeedak

تطبيق ويب (SPA) لإدارة المواعيد والمواعيد المالية بأسلوب سعودي فاخر.

## التقنيات

- **Frontend:** React 18, Vite, Tailwind CSS v4, RTL
- **API:** Express 5, TypeScript, Drizzle ORM
- **Auth:** Supabase Auth + RLS
- **Mono-repo:** pnpm workspaces

## الميزات الرئيسية

- التقويم والمواعيد
- إدارة الرواتب والدعم
- الإشعارات
- ستوري اليوم
- المراكز الثمانية
- لوحة إدارة كاملة

## البدء

```bash
pnpm install
pnpm run build
```

## الوثائق

- [ARCHITECTURE.md](ARCHITECTURE.md) - البنية الكاملة
- [AGENTS.md](AGENTS.md) - تعليمات Codex
- [docs/](docs/) - وثائق إضافية

## الحالة

`Publishable Preview+` — راجع `docs/PRODUCTION_READINESS_*.md`
```

---

## 7. الحكم النهائي

| المعيار | التقييم |
|---|---|
| الدقة | ❌ غير دقيق |
| الاكتمال | ❌ ناقص جداً |
| التوافق | ❌ غير متسق مع الواقع |
| الفائدة | ❌ لا يساعد المطور الجديد |

### الحكم: **يحتاج تحديث عاجل**

---

## 8. الملفات المُراجَعة

- `/workspace/project/mawaeedak/README.md` - الأساسي
- `/workspace/project/mawaeedak/ARCHITECTURE.md` - المرجعية
- `/workspace/project/mawaeedak/docs/CODEX_START_HERE.md`
- `/workspace/project/mawaeedak/docs/PROJECT_PHASES_STATUS.md`
- `/workspace/project/mawaeedak/docs/OPEN_ISSUES_LEDGER.md`
- `/workspace/project/mawaeedak/docs/API_AUDIT_REPORT.md`
- `/workspace/project/mawaeedak/docs/SECURITY_RISK_REGISTER.md`
- `/workspace/project/mawaeedak/docs/PRODUCTION_READINESS_*.md`
- `/workspace/project/mawaeedak/DATA_SOURCE_MAP.md`
- `/workspace/project/mawaeedak/SMOKE_CHECKLIST.md`
- `/workspace/project/mawaeedak/ENV_EXAMPLE.md`
- `/workspace/project/mawaeedak/mobile/README.md`
- `/workspace/project/mawaeedak/package.json`
- `/workspace/project/mawaeedak/artifacts/mawaeedak/package.json`
- `/workspace/project/mawaeedak/artifacts/api-server/package.json`
- `/workspace/project/mawaeedak/lib/db/src/schema/`

---

**التقرير من إعداد Codex Agent — 2026-06-09**