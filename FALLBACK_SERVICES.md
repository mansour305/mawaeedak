# Fallback Services — مواعيدك

هذا الملف يوثق كل الخدمات أو البيانات التي تعمل حالياً بـ fallback أو demo mode أو localStorage بدلاً من الخدمات الإنتاجية الحقيقية.

---

## 1. Auth — Demo Mode

**الحالة**: Demo mode — localStorage فقط

**كيف يعمل الآن**:
- بيانات الدخول محفوظة في الكود: `admin` / `mawaeedak@admin`
- عند الدخول الناجح → `localStorage.setItem("admin_authenticated", "true")`
- لا JWT، لا session server-side، لا Supabase Auth

**البنية التحتية الجاهزة (Phase 11)**:
- `src/lib/supabase.ts` — Supabase client مع fallback (null عند غياب المفاتيح)
- `src/lib/auth.ts` — Auth service موحد: `authSignIn`, `authSignOut`, `getAuthSession`
- عند إضافة `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` → يُفعَّل تلقائياً

**الحالة بعد Phase 11C**:
- المفاتيح أُضيفت ✅ — Supabase متصل ✅
- AdminLayout ما زال demo guard ⚠️ — لم يُحدَّث بعد
- 7 جداول ناقصة في Supabase تمنع تفعيل roles كاملاً

**الاستبدال المطلوب**:
- إنشاء الجداول الناقصة (roles, permissions, role_permissions, user_roles, admin_users, notification_preferences, app_settings)
- استبدال `AdminLayout` ليستخدم `authSignIn` من `src/lib/auth.ts`
- إنشاء admin user في Supabase Auth Dashboard

---

## 2. Push Notifications — مؤجل

**الحالة**: الإشعارات المعروضة داخلية فقط (PostgreSQL) — Push حقيقية مؤجلة

**كيف يعمل الآن**:
- الإشعارات تُخزَّن في جدول `notifications` في DB
- المستخدم يرى الإشعارات عند فتح الصفحة
- لا Web Push API، لا Service Worker، لا Firebase

**الاستبدال المستقبلي**:
- Firebase Cloud Messaging (FCM) أو Supabase Realtime
- Service Worker لاستقبال Push في الخلفية
- صريح في الواجهة: "Push Notifications مؤجل لإصدار لاحق"

---

## 3. Service Worker / Offline Support — مؤجل

**الحالة**: غير موجود

**كيف يعمل الآن**:
- manifest.json موجود ومحدث (lang/dir/icon)
- لا vite-plugin-pwa، لا service worker
- التطبيق يتطلب اتصال internet لكل طلب API

**الاستبدال المستقبلي**:
- vite-plugin-pwa + Workbox
- Offline fallback page
- Cache للمحتوى الثابت (themes/prayers)

---

## 4. مواقيت الصلاة — تقديرية

**الحالة**: بيانات تقديرية / static

**كيف يعمل الآن**:
- الأوقات مُعادة من `prayer_times` table في DB أو محسوبة محلياً
- ليست من API رسمي (وزارة الشؤون الإسلامية)
- موثق في `/disclaimer`: "مواقيت الصلاة تقديرية"

**الاستبدال المستقبلي**:
- API رسمي للأوقات
- أو مكتبة حساب موثوقة (adhan-js) مع إحداثيات المدينة

---

## 5. سلم الرواتب — تقديري

**الحالة**: بيانات تقديرية ليست رسمية

**كيف يعمل الآن**:
- بيانات محلية في الكود (4 سلالم: أ، ب، ج، د)
- ليست من مصدر رسمي حكومي
- موثق في `/disclaimer`

**الاستبدال المستقبلي**:
- ربط ببيانات رسمية من الجهات الحكومية

---

## 6. الحاسبات المالية — تقديرية

**الحالة**: حسابات تقديرية

**كيف تعمل الآن**:
- حاسبة الزكاة، حاسبة القرض، حاسبة الادخار
- نتائجها تقديرية وليست فتوى شرعية أو نصيحة مالية رسمية
- موثق في `/disclaimer`

---

## 7. الأخبار والوظائف — admin_managed

**الحالة**: بيانات يدوية يديرها المسؤول

**كيف تعمل الآن**:
- لوحة الإدارة `/admin/news-jobs` لإضافة/تعديل/حذف
- ليست من API إخباري خارجي (RSS/API)
- موثق في `/disclaimer`: "بيانات المحتوى إدارية"

**الاستبدال المستقبلي**:
- ربط RSS feed أو news API خارجي
- scraping أو integration رسمي

---

## 8. مركز الأعمال والسفر والدراسة — localStorage

**الحالة**: بيانات محلية في المتصفح فقط

**كيف تعمل الآن**:
- `mawaeedak_work_tasks_v1` — مهام الأعمال
- مفاتيح مماثلة للسفر والدراسة
- البيانات تُفقد عند مسح localStorage

**الاستبدال المستقبلي**:
- نقل البيانات لـ PostgreSQL + API endpoints
- مزامنة عبر الأجهزة بعد Auth

---

## 9. تفضيلات المستخدم — localStorage

**الحالة**: محفوظة محلياً

**ما يُحفظ**:
- الثيم المختار (`mawaeedak_theme`)
- إعدادات الإشعارات (`mawaeedak_notification_prefs`)
- إعدادات الصلاة والمدينة
- ستوري اليوم المحفوظ
- Dark/Light mode

**الاستبدال المستقبلي**:
- جدول `notification_preferences` أو `user_settings` في Supabase
- مزامنة بعد Auth

---

## ملخص — جدول المقارنة

| الخدمة | الحالة الآن | الإنتاج المستقبلي |
|---|---|---|
| Auth | localStorage demo | Supabase Auth |
| RLS | غير مطبّق | Supabase RLS |
| Push | مؤجل | FCM / Supabase Realtime |
| Offline | مؤجل | vite-plugin-pwa + Workbox |
| مواقيت الصلاة | تقديرية | API رسمي |
| سلم الرواتب | تقديري | مصدر رسمي |
| حاسبات | تقديرية | كذلك (إخلاء مسؤولية) |
| أخبار/وظائف | admin_managed | API خارجي |
| مراكز (أعمال/سفر/دراسة) | localStorage | Supabase DB |
| تفضيلات | localStorage | Supabase DB |
