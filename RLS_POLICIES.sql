-- ============================================================
-- RLS Policies — مواعيدك
-- ============================================================
-- سياسات Row-Level Security المقترحة لـ Supabase.
-- الحالة الحالية: غير مطبّقة — Supabase غير متصل.
-- هذا الملف توثيق مستقبلي فقط.
-- ============================================================

-- ============================================================
-- profiles — كل مستخدم يرى ويعدّل ملفه الشخصي فقط
-- ============================================================
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================================
-- appointments — المستخدم يرى/يعدّل مواعيده فقط
-- ============================================================
CREATE POLICY "appointments_select_own"
  ON public.appointments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "appointments_insert_own"
  ON public.appointments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "appointments_update_own"
  ON public.appointments FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "appointments_delete_own"
  ON public.appointments FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- financial_events — المستخدم يرى/يعدّل أحداثه المالية فقط
-- ============================================================
CREATE POLICY "financial_events_select_own"
  ON public.financial_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "financial_events_insert_own"
  ON public.financial_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "financial_events_update_own"
  ON public.financial_events FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "financial_events_delete_own"
  ON public.financial_events FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- notifications — المستخدم يرى إشعاراته فقط
-- ============================================================
CREATE POLICY "notifications_select_own"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "notifications_update_own"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "notifications_delete_own"
  ON public.notifications FOR DELETE
  USING (auth.uid() = user_id);

-- Admin يرسل إشعارات لكل المستخدمين — عبر service_role (خادم فقط)

-- ============================================================
-- complaints — المستخدم يرسل شكواه فقط
-- ============================================================
CREATE POLICY "complaints_insert_any"
  ON public.complaints FOR INSERT
  WITH CHECK (true); -- أي مستخدم مسجل يمكنه الإرسال

CREATE POLICY "complaints_select_own"
  ON public.complaints FOR SELECT
  USING (auth.uid() = user_id);

-- Admin يرى كل الشكاوى — عبر service_role

-- ============================================================
-- daily_messages — قراءة عامة للمحتوى النشط
-- ============================================================
ALTER TABLE public.daily_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "daily_messages_select_active"
  ON public.daily_messages FOR SELECT
  USING (is_active = TRUE);

-- Admin يكتب — عبر service_role

-- ============================================================
-- themes — قراءة عامة للثيمات المتاحة
-- ============================================================
ALTER TABLE public.themes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "themes_select_available"
  ON public.themes FOR SELECT
  USING (is_active = TRUE AND is_available = TRUE);

-- ============================================================
-- story_templates — قراءة عامة للقوالب النشطة
-- ============================================================
ALTER TABLE public.story_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "story_templates_select_active"
  ON public.story_templates FOR SELECT
  USING (is_active = TRUE);

-- ============================================================
-- news — قراءة عامة للأخبار المنشورة
-- ============================================================
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;

CREATE POLICY "news_select_published"
  ON public.news FOR SELECT
  USING (is_published = TRUE);

-- ============================================================
-- jobs — قراءة عامة للوظائف النشطة
-- ============================================================
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "jobs_select_active"
  ON public.jobs FOR SELECT
  USING (is_active = TRUE);

-- ============================================================
-- public_events — قراءة عامة للأحداث النشطة
-- ============================================================
ALTER TABLE public.public_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_events_select_active"
  ON public.public_events FOR SELECT
  USING (is_active = TRUE);

-- ============================================================
-- audit_logs — قراءة إدارية فقط (عبر service_role)
-- ============================================================
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- لا سياسة عامة — القراءة عبر service_role في api-server فقط

-- ============================================================
-- ملاحظات تطبيق
-- ============================================================
-- 1. service_role key تتجاوز RLS — استخدمها في api-server فقط
-- 2. anon key في الواجهة → RLS يطبَّق تلقائياً
-- 3. Admin operations → عبر api-server (service_role) → audit_log
-- 4. لا تضع service_role في VITE_ variables
