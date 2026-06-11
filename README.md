# 🕌 مواعيدك — Mawaeedak

<div align="center">

**تطبيق ويب عربي متكامل لإدارة المواعيد والمواعيد المالية**

*سعودي فاخر · RTL-first · Web-First*

[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=black)](https://supabase.com)

</div>

---

## 🌐 نظرة عامة

**مواعيدك** هو تطبيق ويب عربي متكامل يساعد المستخدمين على:

- 📅 إدارة المواعيد والتقويم الشخصي
- 💰 تتبع الرواتب والمواعيد المالية (راتب، دعم، فواتير)
- 🕌 عرض مواقيت الصلاة مع عد تنازلي للصلاة القادمة
- 📲 إنشاء ومشاركة ستوريات يومية
- 🏢 الوصول السريع لخدمات متعددة (الأعمال، السفر، الدراسة، الأخبار، الوظائف، الشكاوى)

### ✨ الملامح الرئيسية

| الميزة | الوصف |
|---|---|
| **RTL Arabic UI** | واجهة عربية كاملة من اليمين لليسار |
| **Theme Engine** | 10 ثيمات قابلة للتخصيص مع حفظ التفضيل |
| **PWA Support** | إصدار PWA متكامل مع manifest.json |
| **Admin Dashboard** | لوحة إدارة كاملة للوحة التحكم |
| **Responsive Design** | تصميم متجاوب لجميع أحجام الشاشات |

---

## 🏗️ بنية المشروع

```
mawaeedak/
├── artifacts/
│   ├── mawaeedak/            # SPA — React 18 + Vite + Tailwind v4
│   │   ├── src/
│   │   │   ├── pages/        # صفحات المسارات
│   │   │   ├── features/     # مكونات الميزات
│   │   │   ├── components/   # مكونات UI
│   │   │   ├── hooks/        # React hooks
│   │   │   └── lib/          # أدوات مساعدة
│   │   └── package.json
│   │
│   └── api-server/           # API — Express 5 + TypeScript
│       ├── src/
│       │   ├── routes/       # مسارات API
│       │   ├── middleware/    # middleware (requireAdmin)
│       │   └── index.ts
│       └── package.json
│
├── lib/                      # مكتبات مشتركة
│   ├── api-client-react/     # Generated API client
│   ├── api-zod/              # Zod schemas
│   ├── db/                   # Drizzle ORM schemas
│   └── shared/               # Shared utilities
│
├── .github/workflows/        # CI/CD pipelines
├── package.json              # pnpm workspaces root
├── AGENTS.md                 # Agent instructions
├── ARCHITECTURE.md           # Architecture docs
└── .env.example              # Environment template
```

---

## 🛠️ التقنيات المستخدمة

### Web Stack

| التقنية | الإصدار | الغرض |
|---|---|---|
| **Vite** | 6+ | Bundler |
| **React** | 18+ | إطار عمل UI |
| **Tailwind CSS** | 4+ | تنسيق CSS |
| **wouter** | 3+ | Router خفيف |
| **shadcn/ui** | — | مكونات UI |
| **Recharts** | 2+ | رسوم بيانية |
| **date-fns** | 3+ | معالجة التواريخ |

### Backend Stack

| التقنية | الإصدار | الغرض |
|---|---|---|
| **Express** | 5.2+ | إطار عمل API |
| **Drizzle ORM** | — | ORM لقاعدة البيانات |
| **Zod** | 4+ | التحقق من المدخلات |
| **Pino** | 10+ | logging |
| **node-cron** | 4+ | مهام مجدولة |

### Data & Auth

| التقنية | الغرض |
|---|---|
| **Supabase** | Auth, Database, RLS |
| **PostgreSQL** | مصدر البيانات الرئيسي |
| **localStorage** | البيانات المحلية |

---

## 📦 التثبيت والتشغيل

```bash
# تثبيت من الجذر
pnpm install

# فحص الأنواع
pnpm run typecheck

# البناء
pnpm run build

# تشغيل API Server
cd artifacts/api-server && pnpm run dev

# تشغيل Web App
cd artifacts/mawaeedak && pnpm run dev
```

---

## 🔐 الأمان والتحقق

### Supabase Auth

```
• تسجيل دخول بـ email + password
• JWT token مع user_metadata.role
• Roles: admin, super_admin, content_manager, finance_manager
```

### Row Level Security (RLS)

```
• جداول user-owned: appointments, financial_events, notifications
• جداول admin-managed: daily_messages, themes, news, jobs
• Guest/Demo: localStorage auth (dev only)
```

### Admin Protection

```
• Server-side middleware (requireAdmin)
• Bearer JWT verification via Supabase Auth API
• ALLOWED_ROLES: admin, super_admin
• 401 بدون token | 403 بدون صلاحية | 503 بدون Supabase
```

### Security Measures

| الإجراء | الحالة |
|---|---|
| Admin mutation protection | ✅ مطبق |
| Guest mutation denial | ✅ مطبق |
| Frontend service-role exposure | ✅ غير موجود |
| RLS policies | ✅ مطبقة |
| Environment secrets | ✅ محمي |

---

## 🎨 الهوية البصرية

### الثيمات المتاحة

| الثيم | الوصف | الاستخدام |
|---|---|---|
| Gold Desert | ذهبي فاخر | الثيم الافتراضي |
| Olive Garden | زيتوني هادئ | ثيم بديل |
| Mist Blue | أزرق غائم | ثيم بديل |
| + 7 ثيمات إضافية | متنوع | قابل للتخصيص |

### الألوان الأساسية

| اللون | Hex | الاستخدام |
|---|---|---|
| ذهبي فاخر | `#C9A063` | Primary, CTA |
| بني دافئ | `#8A6B3D` | Secondary, Headers |
| بيج رملي | `#F3E8D6` | Backgrounds |
| كريمي فاتح | `#FAF7F2` | Main Background |
| نص أساسي | `#2F2B25` | Text |

### الخطوط

```
• Cairo — واجهة ونصوص
• Tajawal — أرقام
```

---

## 📊 خريطة البيانات

### مصادر البيانات

| المصدر | الاستخدام | الحالة |
|---|---|---|
| **PostgreSQL (Drizzle)** | البيانات التشغيلية | ✅ Production |
| **Supabase** | Auth + RLS | ✅ Production |
| **Aladhan API** | مواقيت الصلاة | ✅ External |
| **localStorage** | بيانات محلية | ✅ Cache |

### جداول قاعدة البيانات (17 جدول)

| الجدول | النوع | user_id | RLS |
|---|---|---|---|
| appointments | user-owned | ✅ | ✅ |
| financial_events | user-owned | ✅ | ✅ |
| notifications | user-owned | ✅ | ✅ |
| daily_messages | admin-managed | ❌ | ❌ عام |
| themes | admin-managed | ❌ | ❌ عام |
| news | admin-managed | ❌ | ❌ عام |
| jobs | admin-managed | ❌ | ❌ عام |
| story_templates | admin-managed | ❌ | ❌ عام |
| complaints | shared | اختياري | ✅ |
| audit_logs | admin-managed | ❌ | ✅ admin |
| prayer_times | cache | ❌ | ❌ عام |
| official_financial_dates | admin-managed | ❌ | ❌ عام |
| official_prayer_times | admin-managed | ❌ | ❌ عام |
| public_events | admin-managed | ❌ | ❌ عام |
| app_settings | admin-managed | ❌ | ❌ عام |
| automation_logs | admin-managed | ❌ | ✅ admin |
| social_automation | admin-managed | ❌ | ✅ admin |

### Data Gateway (Phase 12)

```typescript
// أوضاع مصدر البيانات
VITE_DATA_SOURCE_MODE=api           // PostgreSQL/Express (افتراضي)
VITE_DATA_SOURCE_MODE=supabase_shadow // API + Supabase للمقارنة
VITE_DATA_SOURCE_MODE=supabase       // Supabase مصدر الحقيقة
```

---

## 🔌 API Reference

### Base URL

```
/api  — proxied by reverse proxy
```

### Endpoints (17+ endpoint)

| Method | Endpoint | الوصف | Auth |
|---|---|---|---|
| GET | `/api/healthz` | فحص الصحة | ❌ |
| GET/POST/PUT/DELETE | `/api/appointments` | المواعيد | Admin |
| GET/POST/PUT/DELETE | `/api/financial-events` | الأحداث المالية | Admin |
| GET/POST/PUT/DELETE | `/api/notifications` | الإشعارات | Admin |
| GET/POST/PUT/DELETE | `/api/daily-messages` | رسائل اليوم | Admin |
| GET/POST/PUT/DELETE | `/api/themes` | الثيمات | Admin |
| GET/POST/PUT/DELETE | `/api/news` | الأخبار | Admin |
| GET/POST/PUT/DELETE | `/api/jobs` | الوظائف | Admin |
| GET/POST | `/api/complaints` | الشكاوى | User |
| GET/POST/PUT/DELETE | `/api/story-templates` | قوالب الستوري | Admin |
| GET/POST | `/api/audit-logs` | سجل النشاطات | Admin |
| GET/POST/PUT/DELETE | `/api/public-events` | الأحداث العامة | Admin |
| GET | `/api/admin/*` | إحصائيات الإدارة | Admin |

---

## 🧪 الاختبار

### Smoke Checklist

```bash
# فحص الأنواع
pnpm run typecheck

# البناء
pnpm run build

# تشغيل API
cd artifacts/api-server && pnpm run dev

# تشغيل Web
cd artifacts/mawaeedak && pnpm run dev
```

### Production Readiness Gates

| المرحلة | الحالة | التفاصيل |
|---|---|---|
| Phase 4 Admin Smoke | ✅ | مجتاز |
| Typecheck | ✅ | 0 أخطاء |
| Build | ✅ | ناجح |
| RLS Policies | ✅ | مطبقة |
| Guest Denial | ✅ | يعمل |

---

## 📁 هيكل الملفات المهمة

```
├── AGENTS.md                          # تعليمات Codex Agent
├── ARCHITECTURE.md                    # البنية التقنية الكاملة
├── DATA_SOURCE_MAP.md                 # خريطة مصادر البيانات
├── DESIGN_GUIDELINES.md               # إرشادات التصميم
├── ENV_EXAMPLE.md                     # متغيرات البيئة
├── artifacts/
│   ├── mawaeedak/                     # تطبيق الويب
│   └── api-server/                    # خادم API
└── lib/                               # مكتبات مشتركة
```

---

## 🚀 النشر

### Vercel (Web)

```bash
# ربط مع GitHub
# النشر تلقائي مع GitHub Actions
```

### متغيرات البيئة المطلوبة

```env
# Supabase (مطلوب للإنتاج)
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...

# API Server
DATABASE_URL=postgresql://...
SESSION_SECRET=...

# Data Source Mode
VITE_DATA_SOURCE_MODE=api
```

---

## 🤝 المساهمة

1. اقرأ `AGENTS.md` قبل أي مهمة
2. Work in controlled narrow tasks
3. لا تدّعِ Production Ready بدون evidence
4. لا تحرق usage limits بـ scans واسعة

---

## 📞 الدعم

- **Documentation:** راجع `lib/` للمكتبات المشتركة
- **Architecture:** راجع `ARCHITECTURE.md`

---

## 📄 الترخيص

MIT License

---

<div align="center">

**صُنع بـ ❤️ للعالم العربي**

</div>
