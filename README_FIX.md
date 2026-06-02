# MAWAEEDAK runtime + time + identity fix v3

ارفع مجلد `artifacts` كاملًا إلى جذر المستودع واستبدل الملفات الحالية بنفس المسارات.

هذا الإصلاح يعالج:

1. مشكلة صيغة الوقت 12/24 في مواقيت الصلاة والتقويم والستوري.
2. تثبيت Hook موحد للوقت: `useTimeFormat`.
3. إضافة أدوات آمنة لتحويل الوقت: `lib/timeFormat.ts`.
4. إصلاحات React Query v5 الموجودة في الحزمة السابقة.
5. إضافة ملف هوية بصري موحد `mawaeedak-brand-lock.css` لاستخدامه كقفل ألوان/هوية.

بعد الرفع:

- اعمل Commit.
- اعمل Redeploy من Vercel.
- افتح الموقع في نافذة Incognito للتأكد من عدم وجود Cache قديم.

ملاحظة مهمة:
لو لم يظهر ملف الهوية CSS تلقائيًا، أضف هذا السطر في ملف CSS الرئيسي للتطبيق:

@import "./styles/mawaeedak-brand-lock.css";
