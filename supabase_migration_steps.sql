--
-- supabase_migration_steps.sql
--
-- This script outlines the SQL operations required to finish the Supabase migration for the
-- Mawaeedak application.  It covers aligning the schema, seeding static tables, migrating
-- user‑owned data, migrating admin‑managed data, creating roles and permissions, and
-- verifying row counts.  **Do not run this as a single transaction**; instead, execute
-- each section in order and validate the results before proceeding.

/*
  1. Schema Alignment (Phase M1)
     Ensure your Supabase tables match the definitions in the local project.  For
     example, add `user_id`, `confirmed` and `source` columns to existing tables
     and create the official lookup tables.  Use IF NOT EXISTS to avoid errors.
*/
alter table if exists appointments add column if not exists user_id uuid;
alter table if exists financial_events add column if not exists user_id uuid;
alter table if exists financial_events add column if not exists confirmed boolean default false;
alter table if exists financial_events add column if not exists source text;
alter table if exists notifications add column if not exists user_id uuid;

-- Create official tables if they don't exist
create table if not exists official_financial_dates (
  id serial primary key,
  key_name text not null,
  name_ar text not null,
  due_date date not null,
  is_confirmed boolean not null default false,
  authority text,
  source_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table if not exists official_prayer_times (
  id serial primary key,
  city_key text not null,
  city_name_ar text not null,
  date_gregorian date not null,
  date_hijri text not null,
  fajr time not null,
  sunrise time not null,
  dhuhr time not null,
  asr time not null,
  maghrib time not null,
  isha time not null,
  is_confirmed boolean not null default false,
  authority text,
  source_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

/*
  2. Seed Static Data (Phase M2)
     Insert your admin‑managed tables such as themes, story templates, daily messages,
     news and jobs.  Replace the sample values below with your actual data.  Use
     ON CONFLICT to avoid duplicate inserts.
*/
insert into themes (id, name, primary_color, secondary_color) values
  (1, 'الافتراضي', '#F5F5F5', '#FFC107')
  on conflict (id) do nothing;

-- Example: Insert a story template
insert into story_templates (id, title, body_markdown, image_url) values
  (1, 'مثال ستوري', '## مرحباً\nهذا مثال على قصة.', 'https://example.com/story.jpg')
  on conflict (id) do nothing;

-- Example: Insert a daily message
insert into daily_messages (id, title, body, publish_date) values
  (1, 'رسالة اليوم', 'نص الرسالة اليومية.', current_date)
  on conflict (id) do nothing;

-- Insert sample news and jobs
insert into news (id, title, body, category, source, is_published) values
  (1, 'خبر تجريبي', 'هذا مثال على خبر.', 'عام', 'الجهة', true)
  on conflict (id) do nothing;

insert into jobs (id, title, employer, sector, city, apply_url, is_active) values
  (1, 'وظيفة تجريبية', 'شركة تجريبية', 'خاص', 'الرياض', 'https://example.com/apply', true)
  on conflict (id) do nothing;

/*
  3. Migrate User‑Owned Data (Phase M3)
     Copy existing user data from your legacy database into Supabase and assign
     `user_id` appropriately.  The example below links all demo data to a single
     demo user; adapt it to your needs.
*/
-- Assume you have created a demo user and know its UUID (replace with real value).
\set demo_user_uuid '00000000-0000-0000-0000-000000000000'

-- Migrate appointments to Supabase
insert into appointments (id, title, description, start_date, end_date, is_full_day, user_id)
select id, title, description, start_date, end_date, is_full_day, :'demo_user_uuid'
from legacy_appointments
on conflict (id) do nothing;

-- Migrate financial events
insert into financial_events (id, name, type, next_date, amount, user_id, confirmed, source)
select id, name, type, next_date, amount, :'demo_user_uuid', false, 'legacy'
from legacy_financial_events
on conflict (id) do nothing;

-- Migrate notifications
insert into notifications (id, title, body, created_at, is_read, user_id)
select id, title, body, created_at, is_read, :'demo_user_uuid'
from legacy_notifications
on conflict (id) do nothing;

/*
  4. Migrate Admin‑Managed Data (Phase M4)
     These tables (complaints, audit_logs, public_events) do not have user_id columns.
     Insert them directly from your legacy sources.  Provide additional columns as
     necessary (e.g. severity, status).
*/
insert into complaints (id, subject, body, created_at, status)
select id, subject, body, created_at, status
from legacy_complaints
on conflict (id) do nothing;

insert into audit_logs (id, action, user_email, created_at, details)
select id, action, user_email, created_at, details
from legacy_audit_logs
on conflict (id) do nothing;

insert into public_events (id, title, description, event_date, location)
select id, title, description, event_date, location
from legacy_public_events
on conflict (id) do nothing;

/*
  5. Seed Roles and Admin Users (Phase M5)
     Create roles and assign an initial admin user.  Make sure your `auth.users`
     table contains the corresponding admin user before running these inserts.
*/
insert into roles (name) values
  ('super_admin'), ('admin'), ('content_manager'), ('finance_manager'), ('user')
  on conflict (name) do nothing;

-- Example: assign the demo user as super_admin
insert into admin_users (user_id, role_name)
values (:'demo_user_uuid', 'super_admin')
on conflict (user_id) do nothing;

/*
  6. Verify Counts (Phase M6)
     After migration, compare the row counts between Supabase tables and your legacy
     data sources.  Replace the table names and counts below with your actual ones.
*/
-- Example validation queries:
-- select 'appointments' as table, count(*) from appointments;
-- select 'financial_events' as table, count(*) from financial_events;
-- select 'notifications' as table, count(*) from notifications;
-- Compare these counts with counts from your legacy database.

-- End of supabase_migration_steps.sql