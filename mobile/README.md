# Mawaeedak Mobile

This folder is the native mobile app foundation for Mawaeedak using Expo and React Native.

## Scope

- Native mobile app path: `mobile/`
- Framework: Expo + React Native + Expo Router
- Language: TypeScript
- Direction: RTL-ready
- Timezone: `Asia/Riyadh`
- Data layer dependencies included: Supabase, TanStack Query, Zustand, React Hook Form, Zod
- Notifications dependency included: Expo Notifications
- Crash monitoring dependency included: Sentry React Native

## Install and run

```bash
cd mobile
npm install
npm run doctor
npm run typecheck
npm run start
```

## Build preparation

```bash
cd mobile
npm run prebuild
```

For cloud builds, use EAS after logging in:

```bash
cd mobile
npx eas build --profile preview --platform android
npx eas build --profile preview --platform ios
```

## Important rule

Do not add fake buttons or visual-only actions. Every visible button must have a real handler, loading state, success state, error state, data update, and verification.
