--
-- roles_permissions.sql
--
-- This script sets up roles and assigns permissions to them within Supabase.  These
-- roles mirror the ones used in the Mawaeedak application.  Adjust as needed.

/*
  Create roles.  Supabase does not have a first‑class concept of RBAC at the SQL
  layer; instead, we use a simple `roles` table and an `admin_users` linking table
  to associate `auth.users` with a given role.  The app uses these roles to
  decide which administrative screens to show.  You may also implement Row
  Level Security conditions based on these roles if desired.
*/

insert into roles (name) values
  ('super_admin'),
  ('admin'),
  ('content_manager'),
  ('finance_manager'),
  ('user')
on conflict (name) do nothing;

-- Example: assign the initial admin (replace with real UUID)
\set admin_uuid '00000000-0000-0000-0000-000000000000'
insert into admin_users (user_id, role_name)
values (:'admin_uuid', 'super_admin')
on conflict (user_id) do nothing;

-- You can expand this script with additional permissions such as granting access
-- to specific Postgres roles or functions.  For example, to allow the admin to
-- insert/update/delete from official tables via the client API, you could
-- grant the `supabase_auth_admin` role to that user.  See Supabase docs for
-- details.

-- End of roles_permissions.sql