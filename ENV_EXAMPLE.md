# Environment Variables — مواعيدك

## المطلوب حالياً (API/PostgreSQL)

| المتغير | الوصف | مطلوب |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | ✅ نعم |
| `SESSION_SECRET` | Express session secret (عشوائي وطويل) | ✅ نعم |

## Supabase (مفعّل — Phase 12)

| المتغير | الوصف | ملاحظة |
|---|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL | آمن للواجهة — VITE_ |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/public key | آمن للواجهة مع RLS — VITE_ |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | **خادم فقط — لا تضعه كـ VITE_** |
| `SUPABASE_URL` | نفس قيمة `VITE_SUPABASE_URL` — للخادم | يستخدمها `requireAdmin` للتحقق من JWT المالك |
| `SUPABASE_ANON_KEY` | نفس قيمة `VITE_SUPABASE_ANON_KEY` — للخادم | apikey لطلب `/auth/v1/user` في `requireAdmin` |

> **تحذير أمني**: لا تضع `SUPABASE_SERVICE_ROLE_KEY` في أي متغير يبدأ بـ `VITE_`. هذا المتغير يُدمج في bundle الواجهة ويصبح عاماً للجميع. استخدمه في `api-server` فقط.
>
> **حماية الإدارة (server-side)**: المسارات الإدارية في Express (`/api/admin/stats`، `/api/audit-logs`، `PUT /api/settings/default-theme`، `PATCH /api/themes/:id`) محمية بـ middleware `requireAdmin`. يتحقق من Bearer JWT عبر `${SUPABASE_URL}/auth/v1/user` ويسمح فقط بالأدوار `admin` / `super_admin`. بدون `SUPABASE_URL` + `SUPABASE_ANON_KEY` في الخادم يرجع 503.

## Data Source Mode (Phase 12)

| المتغير | القيم | الوصف |
|---|---|---|
| `VITE_DATA_SOURCE_MODE` | `api` (افتراضي) | PostgreSQL/Express |
| `VITE_DATA_SOURCE_MODE` | `supabase_shadow` | API للعرض + Supabase للمقارنة |
| `VITE_DATA_SOURCE_MODE` | `supabase` | Supabase مصدر الحقيقة (إنتاج) |

**للإنتاج مع Supabase:**
```
VITE_DATA_SOURCE_MODE=supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

**ملاحظة:** الافتراضي `api` للسلامة — لا يتغير داخل الكود. يُضبط فقط عبر env.

## Firebase (مستقبلي — اختياري للـ Push Notifications)

| المتغير | الوصف |
|---|---|
| `VITE_FIREBASE_API_KEY` | Firebase API key |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |
| `VITE_FIREBASE_VAPID_KEY` | VAPID key للـ Push |

## ملاحظات

- `PORT` يُوفَّر تلقائياً من workflow — لا تحتاج تعيينه في `.env`
- `BASE_PATH` كذلك يُوفَّر من workflow
- انظر `.env.example` لنموذج كامل
- أي قيمة غير صحيحة لـ `VITE_DATA_SOURCE_MODE` تُعيد `api` تلقائياً
