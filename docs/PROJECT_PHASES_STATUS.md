# مواعيدك — حالة المراحل الرسمية

آخر تحديث: 2026-06-02

الغرض من هذا الملف هو تثبيت حالة المشروع داخل المستودع حتى لا يعيد أي وكيل بناء أو Codex تنفيذ مراحل منتهية أو يخلط بينها وبين المراحل المتبقية.

## الحكم الحالي

```text
Publishable Preview+
```

المشروع ليس Production Ready حتى تنجح براهين Phase 4 live smoke بالكامل ويتم تطبيق الهوية الجديدة على النسخة المنشورة.

---

## المراحل المنتهية والمعتمدة

| المرحلة | الحالة | ملاحظات |
|---|---:|---|
| Base App + Preview | ✅ | التطبيق الأساسي موجود ويعمل كنسخة Preview. |
| Calendar / Appointments | ✅ | التقويم والمواعيد الأساسية منجزة. |
| Finance / Salaries / Support Dates | ✅ | صفحات الرواتب والدعم والبيانات المالية الأساسية منجزة. |
| Story Today | ✅ | قصة اليوم/البطاقة اليومية منجزة كوظيفة أساسية. |
| Notifications | ✅ | مركز الإشعارات والمنطق الأساسي منجز. |
| Admin Dashboard | ✅ | لوحة المالك الأساسية والمتقدمة موجودة. |
| Theme Engine | ✅ | نظام الثيمات موجود. الهوية الرسمية الجديدة يجب أن تكون الافتراضية. |
| Centers / Services | ✅ | الخدمات/المراكز الأساسية موجودة. |
| Documentation + QA Hardening | ✅ | التوثيق وملفات QA الأساسية مضافة. |
| Supabase/Auth/RLS Readiness | ✅ | جاهزية التوثيق والطبقات موجودة، لكن الربط الحي لم يعتمد بعد. |
| GitHub Actions / CI | ✅ | تم إصلاح CI وتشغيله. |
| Phase 4 GitHub Actions Gate | ✅ | PASSED سابقاً عبر GitHub Actions. |
| Vercel Deployment Setup | ✅ | تم نشر نسخة على Vercel، لكنها لا تمثل آخر هوية/كود كامل. |
| Production Readiness Final Gate | ✅ | البوابة مضافة كـ workflow/script، لكنها تحتاج أسرار وتشغيل حي. |
| Visual Identity Adoption Decision | ✅ | الهوية الجديدة معتمدة رسمياً كقرار منتج ومصدر حقيقة. |
| .env.local Runtime Detection in Codex | ✅ | تم تحميل .env.local وظهرت الأسرار PRESENT في Codex حسب التقرير. |
| Supabase REST Smoke | ✅ | HTTP 200 حسب تقرير Codex. |
| Frontend Service Role Exposure Scan | ✅ | نجح حسب تقرير Codex. |
| Typecheck | ✅ | نجح حسب تقرير Codex الأخير. |
| Build | ✅ | نجح حسب تقرير Codex الأخير. |

---

## مراحل بدأت ولم تكتمل

| المرحلة | الحالة | السبب |
|---|---:|---|
| Phase 4 Admin Smoke Live Proof | 🟡 | توقف بسبب عدم تطابق live DB schema. |
| DB Proof | ❌ | يحتاج إصلاح توافق قاعدة البيانات الحية. |
| Admin Mutation Proof | ❌ | لم يعتمد بعد بسبب توقف DB/schema proof. |
| Guest/User Denial Proof | ❌ | لم يعتمد بعد. |
| Audit Log Proof | ❌ | لم يعتمد بعد. |
| تطبيق الهوية على Vercel | 🟡 | الهوية معتمدة، لكن النسخة المنشورة ما زالت قديمة. |
| Production Handover | ❌ | محجوب حتى نجاح كل live proofs. |

---

## آخر تقرير Codex معتمد

- `pnpm install --frozen-lockfile`: نجح.
- `pnpm run typecheck`: نجح.
- `pnpm run build`: نجح.
- `.env.local` تم تحميله بنجاح.
- الأسرار المطلوبة ظهرت `PRESENT`.
- Supabase REST smoke نجح HTTP 200.
- Frontend service-role exposure scan نجح.
- تم تثبيت `pg` و `@types/pg`.
- البلوكر الحالي لم يعد الأسرار، بل عدم تطابق قاعدة البيانات الحية مع الـ schema المتوقع.

## البلوكر الحالي

```text
Live Database Schema Alignment
```

خصوصاً جدول:

```text
financial_events
```

المشاكل المرصودة من Codex:

- عمود `amount` غير موجود في live Supabase schema بينما الكود/الاختبار توقعه.
- نوع `id` في live DB مختلف عن المتوقع.
- ظهر PostgreSQL error code `42804` أثناء proof.
- بعض proofs لم تعمل لأنها توقفت بعد DB/schema blocker.

---

## المرحلة الحالية الصحيحة

```text
PHASE 4 LIVE SCHEMA ALIGNMENT GATE
```

هدفها:

1. فحص جداول Supabase الحية.
2. مقارنة live schema مع schema المشروع.
3. إصلاح الاختلافات عبر migration آمن أو تحديث smoke test ليتوافق مع الحقيقة المعتمدة.
4. إعادة تشغيل:
   - typecheck
   - build
   - phase4-admin-smoke
5. عدم اعتماد PASSED إلا إذا نجحت:
   - DB proof
   - admin mutation proof
   - guest/user denial proof
   - audit log proof
   - service-role exposure scan

---

## ممنوعات صارمة

- ممنوع بدء Phase 5 قبل إنهاء Phase 4 live proofs.
- ممنوع اعتبار المشروع Production Ready مع فشل DB/Admin/Audit/RLS proofs.
- ممنوع طباعة أسرار أو commit أي قيمة سرية.
- ممنوع تغيير الهوية الرسمية أو الرجوع للثيم البني الداكن كافتراضي.
- ممنوع تعديل صفحات أو مزايا غير مرتبطة ببلوك Phase 4 الحالي.
- ممنوع اعتبار Vercel deployment الحالي نسخة نهائية لأنه يعرض نسخة قديمة.

---

## الهوية الرسمية

الهوية الرسمية المعتمدة موجودة في:

```text
docs/MAWAEEDAK_VISUAL_IDENTITY_SOURCE_OF_TRUTH.md
```

يجب تطبيقها كهوية افتراضية كاملة، لا كثيم اختياري.

الألوان الأساسية:

```text
#C9A063
#8A6B3D
#F3E8D6
#FAF7F2
#FFFFFF
```

---

## معيار الانتقال للمرحلة التالية

لا تنتقل لأي مرحلة جديدة إلا بعد:

```text
PASSED — PHASE 4 ADMIN CONTROL AND LIVE PERSISTENCE COMPLETE
```

ويجب أن يكون الحكم مبنياً على نتائج فعلية، لا على توقعات أو توثيق فقط.
## Latest Phase 4 Smoke Snapshot

Updated: 2026-06-02

### Current Gate

Phase 4 remains **NEEDS FIXES**.

Live environment loading is fixed and `work/phase4-admin-smoke.cjs` now reports step-by-step progress with bounded external calls. The latest blocker is not a missing secret or a hanging process. The live mutation proof fails because the live `financial_events` table requires `name_ar`, while the current smoke payload/API alignment does not yet satisfy that live schema.

### Verification Snapshot

| Check | Status | Evidence |
|---|---|---|
| Env loading | PASS | `.env.local` loads and reports PRESENT/MISSING only |
| `pnpm run typecheck` | PASS | Workspace typecheck completed |
| `pnpm run build` | PASS | API, app, and mockup sandbox build completed |
| DB proof | PASS | `select 1` succeeded with SSL |
| Supabase REST proof | PASS | REST probe returned HTTP 200 |
| Frontend service-role exposure scan | PASS | No frontend source/bundle reference found |
| Guest mutation denial | PASS | Guest create returned HTTP 401 |
| Admin mutation proof | FAIL | Live schema requires `financial_events.name_ar` |
| Audit proof | NOT COMPLETE | Admin mutation did not create the test record |

### Phase 4 Decision

Do not proceed to Phase 5 until admin mutation, public read, audit log proof, and guest/user audit denial all pass against the live runtime.
