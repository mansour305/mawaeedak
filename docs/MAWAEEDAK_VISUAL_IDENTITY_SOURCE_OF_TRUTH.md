# مواعيدك — الهوية الرسمية المعتمدة

هذه الوثيقة هي مصدر الحقيقة البصري الرسمي لتطبيق مواعيدك.

## الحكم

الهوية المعتمدة هي الهوية الكريمية الذهبية الهادئة ذات الطابع السعودي الفاخر. الصور المرجعية التي أرسلها المالك بتاريخ 2026-06-01 إلزامية وليست إلهاماً.

## الألوان الرسمية

- الذهبي الفاخر: #C9A063
- البني الدافئ: #8A6B3D
- البيج الرملي: #F3E8D6
- الكريمي الفاتح: #FAF7F2
- الأبيض الدافئ: #FFFFFF
- الزيتوني الهادئ: #6F7C5B
- الأزرق الغائم: #8FA1B3
- الرمادي الناعم: #DCD7CF
- الوردي الترابي: #E9D7C8
- النص الأساسي: #2F2B25
- النص الثانوي: #6F6557

## قواعد التطبيق

- الهوية الرسمية هي الافتراضية وليست ثيم اختياري.
- لا يجوز رجوع الثيم البني الداكن كواجهة افتراضية.
- كل الصفحات يجب أن تعمل Mobile-first RTL.
- الصفحة الرئيسية والخدمات والمزيد والقائمة الجانبية ولوحة المالك يجب أن تطابق المراجع البصرية.
- لا تظهر أدوات مالك للمستخدم العادي.
- لا تظهر صفحات فارغة أو أزرار غير عاملة.

## معيار القبول

لا تعتمد أي نسخة للإطلاق إلا إذا ظهرت الخلفية الكريمية، البطاقات الناعمة، الذهبي الرسمي، الشعار الرسمي، والصور المعمارية السعودية بشكل واضح في الواجهة المنشورة.
## Phase 2 Baseline Notes

Updated: 2026-06-02

This document records the approved Phase 2 visual direction so future implementation work stays aligned.

## Direction

- Arabic-first RTL interface.
- Warm white base with gold accents.
- Calm Saudi-inspired visual details.
- Rounded cards and soft borders.
- Bottom navigation tabs: الرئيسية، الرواتب، الخدمات، التقويم، المزيد.
- Side menu items: الرئيسية، بطاقة يومية أرسلها، شارك التطبيق، سياسة الخصوصية، الشروط والأحكام، المساعدة والدعم، تسجيل الخروج or تسجيل الدخول for guests.

## Core Screens

The mandatory app baseline remains:

- Home
- Salaries and support
- Services
- Calendar and appointments
- More/account
- Login/auth
- Notifications
- Daily share
- Privacy
- Terms
- Support
- Admin, protected from guest/user access

## Security Boundary

Visual implementation must not weaken the Phase 4 boundary:

- No service-role secret in frontend source or bundle.
- No admin token in `VITE_*`.
- No demo admin bypass.
- `/admin` remains guarded by server-side role checks.
