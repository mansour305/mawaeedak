--
-- rls_policies.sql
--
-- This file defines Row Level Security (RLS) policies for the Mawaeedak tables.  These
-- policies restrict access so that authenticated users can only view or modify
-- their own rows.  Admin tables (e.g. news, jobs) remain unrestricted.

-- Enable RLS on user‑owned tables
alter table appointments enable row level security;
alter table financial_events enable row level security;
alter table notifications enable row level security;

-- Policy: Allow authenticated users to read and write their own appointments
create policy if not exists appointments_select on appointments for select
  using (user_id = auth.uid());
create policy if not exists appointments_insert on appointments for insert
  with check (user_id = auth.uid());
create policy if not exists appointments_update on appointments for update
  using (user_id = auth.uid());
create policy if not exists appointments_delete on appointments for delete
  using (user_id = auth.uid());

-- Policy: Allow users to manage their own financial events
create policy if not exists financial_events_select on financial_events for select
  using (user_id = auth.uid());
create policy if not exists financial_events_insert on financial_events for insert
  with check (user_id = auth.uid());
create policy if not exists financial_events_update on financial_events for update
  using (user_id = auth.uid());
create policy if not exists financial_events_delete on financial_events for delete
  using (user_id = auth.uid());

-- Policy: Allow users to read/write their own notifications
create policy if not exists notifications_select on notifications for select
  using (user_id = auth.uid());
create policy if not exists notifications_insert on notifications for insert
  with check (user_id = auth.uid());
create policy if not exists notifications_update on notifications for update
  using (user_id = auth.uid());
create policy if not exists notifications_delete on notifications for delete
  using (user_id = auth.uid());

-- Policies for official data: read only for everyone (no writes via client).  Admin
-- operations should occur via server or through Supabase dashboard with elevated
-- privileges.
alter table official_financial_dates enable row level security;
create policy if not exists official_financial_dates_select on official_financial_dates
  for select using (true);

alter table official_prayer_times enable row level security;
create policy if not exists official_prayer_times_select on official_prayer_times
  for select using (true);

-- End of rls_policies.sql