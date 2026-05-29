-- ============================================================
-- RLS_POLICIES_FIX.sql — مواعيدك
-- ============================================================
-- الغرض: سياسات RLS للجداول السبعة الجديدة
-- شغّل هذا الملف بعد SUPABASE_MISSING_TABLES_FIX.sql
--
-- تعليمات التشغيل:
--   Supabase Dashboard → SQL Editor → New Query → الصق هذا الملف → Run
--
-- آمن تماماً: IF NOT EXISTS — لا DROP — لا تعديل على سياسات سابقة
-- ============================================================

-- ============================================================
-- 1. roles — قراءة عامة فقط (أسماء الأدوار ليست سرية)
-- ============================================================
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'roles' AND policyname = 'roles_select_public'
  ) THEN
    CREATE POLICY "roles_select_public"
      ON public.roles FOR SELECT
      USING (true);
  END IF;
END $$;

-- ============================================================
-- 2. permissions — قراءة عامة (أسماء الصلاحيات ليست سرية)
-- ============================================================
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'permissions' AND policyname = 'permissions_select_public'
  ) THEN
    CREATE POLICY "permissions_select_public"
      ON public.permissions FOR SELECT
      USING (true);
  END IF;
END $$;

-- ============================================================
-- 3. role_permissions — قراءة عامة
-- ============================================================
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'role_permissions' AND policyname = 'role_permissions_select_public'
  ) THEN
    CREATE POLICY "role_permissions_select_public"
      ON public.role_permissions FOR SELECT
      USING (true);
  END IF;
END $$;

-- ============================================================
-- 4. user_roles — المستخدم يرى أدواره فقط
-- ============================================================
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_roles' AND policyname = 'user_roles_select_own'
  ) THEN
    CREATE POLICY "user_roles_select_own"
      ON public.user_roles FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- ============================================================
-- 5. admin_users — المستخدم يرى سجله فقط
--    (الكتابة عبر api-server بـ service_role فقط)
-- ============================================================
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'admin_users' AND policyname = 'admin_users_select_own'
  ) THEN
    CREATE POLICY "admin_users_select_own"
      ON public.admin_users FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- ============================================================
-- 6. notification_preferences — المستخدم يرى/يعدّل تفضيلاته فقط
-- ============================================================
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'notification_preferences' AND policyname = 'notif_prefs_select_own'
  ) THEN
    CREATE POLICY "notif_prefs_select_own"
      ON public.notification_preferences FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'notification_preferences' AND policyname = 'notif_prefs_insert_own'
  ) THEN
    CREATE POLICY "notif_prefs_insert_own"
      ON public.notification_preferences FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'notification_preferences' AND policyname = 'notif_prefs_update_own'
  ) THEN
    CREATE POLICY "notif_prefs_update_own"
      ON public.notification_preferences FOR UPDATE
      USING  (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- ============================================================
-- 7. app_settings — قراءة عامة / الكتابة عبر service_role فقط
-- ============================================================
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'app_settings' AND policyname = 'app_settings_select_public'
  ) THEN
    CREATE POLICY "app_settings_select_public"
      ON public.app_settings FOR SELECT
      USING (true);
  END IF;
END $$;

-- ============================================================
-- ملاحظات
-- ============================================================
-- • الكتابة على roles/permissions/role_permissions/admin_users/app_settings
--   تتم عبر api-server بـ service_role فقط (لا تُضف INSERT policies هنا)
-- • user_roles INSERT يتم عبر trigger أو api-server بعد إنشاء المستخدم
-- • DO $$ BEGIN ... END $$ يتجنب خطأ "policy already exists"
-- ============================================================
