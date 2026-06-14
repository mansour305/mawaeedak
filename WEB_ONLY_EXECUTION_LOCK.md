# Web-only execution lock — مواعيدك

## القرار التنفيذي

هذا المستودع يُعامل حالياً كمشروع Web/PWA فقط.

## النطاق المسموح

- `artifacts/mawaeedak/`
- `artifacts/api-server/` فقط عند احتياج الويب للـ API
- `lib/api-spec/`
- `lib/api-client-react/`
- `lib/api-zod/`
- `lib/db/`
- `supabase/`
- `.github/workflows/`
- `scripts/`
- `package.json`
- `pnpm-lock.yaml`

## خارج النطاق

- Flutter
- Expo
- Android
- iOS native
- Windows compatibility work
- أي مجلد أو ملف Mobile لا يخدم تطبيق الويب مباشرة

## أمر الفحص المعتمد للويب فقط

```bash
pnpm run web:check
```

## ما ينفذه الأمر

```bash
pnpm run web:typecheck
pnpm run web:build
pnpm run web:smoke
```

## قاعدة العمل

أي تنفيذ قادم يجب أن يبدأ من تطبيق الويب في `artifacts/mawaeedak/`، ولا يتم لمس الخادم أو قاعدة البيانات إلا إذا كان التغيير مطلوباً مباشرة لميزة ويب ظاهرة أو API يستخدمه الويب.

