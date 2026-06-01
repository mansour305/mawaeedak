# Smoke Checklist — مواعيدك

قائمة الاختبار الدخاني الإلزامي قبل أي نشر أو إصدار.

---

## بيئة الاختبار

- URL: Preview في Replit أو `localhost:80`
- بيانات Admin: `admin` / `mawaeedak@admin`

---

## 1. التحقق من البناء

- [ ] `pnpm run typecheck` → 0 أخطاء
- [ ] `PORT=5173 BASE_PATH=/ pnpm --filter @workspace/mawaeedak run build` → ناجح
- [ ] `pnpm --filter @workspace/api-server run build` → ناجح

---

## 2. الرئيسية

- [ ] فتح `/` → التاريخ الهجري والميلادي ظاهران
- [ ] رسالة اليوم ظاهرة (من DB)
- [ ] مواقيت الصلاة ظاهرة
- [ ] عدادات مالية ظاهرة
- [ ] لا شاشة بيضاء
- [ ] لا أخطاء console حرجة

---

## 3. التقويم

- [ ] فتح `/calendar` → يعمل
- [ ] إضافة موعد جديد → يُحفظ في DB
- [ ] تعديل موعد → يُحدَّث
- [ ] حذف موعد → يُحذف
- [ ] عرض شهري/أسبوعي/يومي يعملون

---

## 4. المال

- [ ] فتح `/finance` → يعمل
- [ ] إضافة راتب/دعم/فاتورة → يُحفظ
- [ ] الحاسبات تعمل (حاسبة الزكاة، القرض، الادخار)
- [ ] تبويب سلم الرواتب يعمل

---

## 5. ستوري اليوم

- [ ] فتح `/story` → يعمل
- [ ] اختيار قالب → المعاينة تتحدث
- [ ] تعديل النص → المعاينة الحية تتحدث
- [ ] زر النسخ → يعمل
- [ ] زر المشاركة → يعمل أو fallback للنسخ
- [ ] زر الحفظ → يُخزَّن في localStorage

---

## 6. الإشعارات

- [ ] فتح `/notifications` → يعمل
- [ ] تحديد إشعار كمقروء → يتغير
- [ ] حذف إشعار → يُحذف
- [ ] عداد الإشعارات في الهيدر يتحدث

---

## 7. تغيير الثيم

- [ ] فتح `/account` → يعمل
- [ ] اختيار ثيم مختلف → يُطبَّق فوراً
- [ ] بعد reload → الثيم محفوظ

---

## 8. المراكز الثمانية

- [ ] فتح `/centers` → يعمل
- [ ] مركز الأعمال → إضافة/تعديل/حذف مهمة
- [ ] مركز السفر → إضافة رحلة
- [ ] مركز الدراسة → عداد الأيام يعمل
- [ ] مركز الأخبار → البحث يعمل
- [ ] مركز الوظائف → البحث يعمل
- [ ] مركز التهاني → اختيار نوع + نسخ
- [ ] مركز الشكاوى → إرسال شكوى → يُحفظ في DB
- [ ] اتصل بنا → إرسال رسالة

---

## 9. حسابي

- [ ] فتح `/account` → يعمل
- [ ] تعديل الاسم → يُحفظ
- [ ] إعدادات الإشعارات → تُحفظ في localStorage
- [ ] Dark/Light mode → يعمل

---

## 10. لوحة الإدارة

- [ ] فتح `/admin` → يظهر صفحة الدخول
- [ ] الدخول بـ `admin` / `mawaeedak@admin` → يعمل
- [ ] Dashboard → الإحصاءات ظاهرة
- [ ] إرسال إشعار من AdminNotifications → يظهر في `/notifications`
- [ ] إدارة الأخبار → CRUD يعمل
- [ ] إدارة الوظائف → CRUD يعمل
- [ ] إدارة الثيمات → toggle يعمل
- [ ] سجل النشاطات → ظاهر

---

## 11. الصفحات القانونية

- [ ] فتح `/privacy` → يعمل + لافتة demo ظاهرة
- [ ] فتح `/terms` → يعمل + لافتة demo ظاهرة
- [ ] فتح `/disclaimer` → يعمل + لافتة demo ظاهرة
- [ ] فتح `/support` → يعمل

---

## 12. Error Handling

- [ ] فتح `/not-found-test` → صفحة 404 عربية تظهر
- [ ] زر "العودة للرئيسية" في 404 → يعمل
- [ ] Error Boundary لا يظهر عند استخدام عادي

---

## 13. PWA

- [ ] manifest.json موجود ومحدث
- [ ] `name`, `short_name`, `lang:ar`, `dir:rtl` موجودة
- [ ] icon يشير لـ `favicon.svg`

---

## 14. API

- [ ] `GET /api/healthz` → 200
- [ ] لا توجد API 500
- [ ] جميع API endpoints تعيد 200/201/204

---

## 15. Mobile UX

- [ ] لا overflow أفقي
- [ ] Bottom navigation لا يغطي المحتوى
- [ ] Touch targets مناسبة

---

## الحكم

| الشرط | مطلوب |
|---|---|
| typecheck = 0 أخطاء | ✅ إلزامي |
| build ناجح | ✅ إلزامي |
| لا شاشة بيضاء | ✅ إلزامي |
| لا API 500 | ✅ إلزامي |
| 404 عربية تعمل | ✅ إلزامي |
| Theme Engine يعمل | ✅ إلزامي |
| جميع المراحل 1-10 سليمة | ✅ إلزامي |

**إذا اجتاز الكل → Publishable Preview**
**إذا فشل بند إلزامي → Needs Fixes**

## Phase 4 Live Env/RLS Gate - 2026-06-01

- [x] Worktree safety gate executed on clean cloned `main`.
- [x] Secret availability checked without printing values.
- [x] `work/phase4-admin-smoke.cjs` added for safe PRESENT/MISSING diagnostics.
- [x] `pnpm install --frozen-lockfile` passes in this runtime.
- [x] `pnpm run typecheck` passes in this runtime.
- [x] `pnpm run build` passes in this runtime.
- [x] Frontend service-role exposure scan passes.
- [ ] `DATABASE_URL` present in this runtime.
- [ ] Supabase server/client env present in this runtime.
- [ ] Admin auth env present in this runtime.
- [ ] Live DB connection proof.
- [ ] Supabase REST proof.
- [ ] Guest/user denial proof for protected admin mutation.
- [ ] Admin create/update/deactivate proof for official financial override.
- [ ] Public active override read proof.
- [ ] Audit log write/read proof.

Current smoke status: live env is available and DB/Supabase probes pass, but Phase 4 remains NEEDS FIXES. Latest blocker: admin mutation fails because live `financial_events.name_ar` is NOT NULL, so the test record cannot be created and audit proof cannot run.
