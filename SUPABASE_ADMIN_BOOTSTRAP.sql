-- ============================================================
-- SUPABASE_ADMIN_BOOTSTRAP.sql — مواعيدك
-- ============================================================
-- الغرض: ربط مستخدم موجود في auth.users بدور super_admin
--
-- المتطلبات قبل التشغيل:
--   1. أنشئ المستخدم يدوياً من:
--      Supabase Dashboard → Authentication → Users → Add user
--      Email: hrq@hotmail.com
--      (كلمة المرور تُختار هناك — لا تضعها هنا أبداً)
--
--   2. شغّل SUPABASE_MISSING_TABLES_FIX.sql أولاً
--
--   3. ثم شغّل هذا الملف
--
-- هذا الملف آمن تماماً:
--   - لا ينشئ كلمة مرور
--   - لا يُخزّن أي secret
--   - لا DROP
--   - ON CONFLICT DO NOTHING على كل INSERT
-- ============================================================

DO $$
DECLARE
  v_user_id        UUID;
  v_super_admin_id UUID;
BEGIN

  -- 1. جلب user_id من auth.users بالبريد
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'hrq@hotmail.com'
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE NOTICE 'المستخدم hrq@hotmail.com غير موجود في auth.users.';
    RAISE NOTICE 'أنشئه يدوياً من: Supabase Dashboard → Authentication → Users → Add user';
    RAISE NOTICE 'ثم أعد تشغيل هذا الملف.';
    RETURN;
  END IF;

  RAISE NOTICE 'وُجد المستخدم: %', v_user_id;

  -- 2. إنشاء profile إذا لم يكن موجوداً
  INSERT INTO public.profiles (id, display_name)
  VALUES (v_user_id, 'مالك المنصة')
  ON CONFLICT (id) DO NOTHING;

  RAISE NOTICE 'Profile: جاهز';

  -- 3. جلب role_id لـ super_admin
  SELECT id INTO v_super_admin_id
  FROM public.roles
  WHERE name = 'super_admin'
  LIMIT 1;

  IF v_super_admin_id IS NULL THEN
    RAISE NOTICE 'دور super_admin غير موجود — شغّل SUPABASE_MISSING_TABLES_FIX.sql أولاً';
    RETURN;
  END IF;

  -- 4. ربط المستخدم بدور super_admin
  INSERT INTO public.user_roles (user_id, role_id)
  VALUES (v_user_id, v_super_admin_id)
  ON CONFLICT (user_id, role_id) DO NOTHING;

  RAISE NOTICE 'user_roles: super_admin مرتبط بـ %', v_user_id;

  -- 5. إضافته إلى admin_users
  INSERT INTO public.admin_users (user_id)
  VALUES (v_user_id)
  ON CONFLICT (user_id) DO NOTHING;

  RAISE NOTICE 'admin_users: تم التسجيل';

  -- 6. تعيين role في user_metadata (اختياري — يساعد auth.ts في قراءة الدور)
  UPDATE auth.users
  SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb)
                        || '{"role": "super_admin", "display_name": "مالك المنصة"}'::jsonb
  WHERE id = v_user_id;

  RAISE NOTICE 'user_metadata: role=super_admin ✅';
  RAISE NOTICE '✅ تم ربط hrq@hotmail.com بدور super_admin بنجاح';

END $$;

-- ============================================================
-- للتحقق بعد التشغيل:
-- ============================================================
-- SELECT u.email, r.name AS role
-- FROM auth.users u
-- JOIN public.user_roles ur ON ur.user_id = u.id
-- JOIN public.roles r       ON r.id = ur.role_id
-- WHERE u.email = 'hrq@hotmail.com';
-- ============================================================
