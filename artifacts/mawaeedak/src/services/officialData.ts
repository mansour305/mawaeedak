import { supabase } from "@/lib/supabase";

/**
 * Fetch confirmed official financial dates from Supabase.
 *
 * Returns an array of records sorted by their occurrence date. Each record
 * includes `event_key`, `event_name_ar`, `occurrence_date_gregorian`,
 * `occurrence_date_hijri`, `source_authority`, and `source_url`.
 */
export async function fetchOfficialFinancialDates() {
  if (!supabase) {
    return { data: [], error: new Error("Supabase is not enabled") };
  }
  const { data, error } = await supabase
    .from("official_financial_dates")
    .select("*")
    .eq("is_confirmed", true)
    .order("occurrence_date_gregorian", { ascending: true });
  return { data, error };
}

/**
 * Fetch the next upcoming financial event for a given user and a given event key.
 * This helper queries the `financial_events` table scoped to the current
 * authenticated user. You must ensure that `supabase.auth.getUser()` has
 * been called to set the current session.
 */
export async function fetchNextFinancialEvent(eventKey: string) {
  if (!supabase) {
    return { data: null, error: new Error("Supabase is not enabled") };
  }
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) {
    return { data: null, error: new Error("User not authenticated") };
  }
  const { data, error } = await supabase
    .from("financial_events")
    .select("*")
    .eq("user_id", user.id)
    .eq("type", eventKey)
    .eq("is_active", true)
    .order("next_date", { ascending: true })
    .limit(1)
    .single();
  return { data, error };
}

/**
 * Fetch confirmed prayer times for a given city and date. When official
 * timings are not available, clients should fall back to computed or
 * approximate times. Use `cityKey` values matching the entries in
 * `official_prayer_times.city_key`.
 */
export async function fetchOfficialPrayerTimes(cityKey: string, dateIso: string) {
  if (!supabase) {
    return { data: null, error: new Error("Supabase is not enabled") };
  }
  const { data, error } = await supabase
    .from("official_prayer_times")
    .select("*")
    .eq("city_key", cityKey)
    .eq("date_gregorian", dateIso)
    .eq("is_confirmed", true)
    .single();
  return { data, error };
}

/**
 * Create a new official financial date record. Accepts an object with fields
 * matching the `official_financial_dates` table. Returns the inserted
 * record on success.
 */
export async function createOfficialFinancialDate(record: Record<string, any>) {
  if (!supabase) {
    return { data: null, error: new Error("Supabase is not enabled") };
  }
  const { data, error } = await supabase
    .from("official_financial_dates")
    .insert(record)
    .select()
    .single();
  return { data, error };
}

/**
 * Update an existing official financial date by ID. Accepts the record ID and
 * an object with updated fields. Returns the updated record on success.
 */
export async function updateOfficialFinancialDate(id: number, record: Record<string, any>) {
  if (!supabase) {
    return { data: null, error: new Error("Supabase is not enabled") };
  }
  const { data, error } = await supabase
    .from("official_financial_dates")
    .update(record)
    .eq("id", id)
    .select()
    .single();
  return { data, error };
}

/**
 * Delete an official financial date record by ID. Returns the deleted rows on
 * success.
 */
export async function deleteOfficialFinancialDate(id: number) {
  if (!supabase) {
    return { data: null, error: new Error("Supabase is not enabled") };
  }
  const { data, error } = await supabase
    .from("official_financial_dates")
    .delete()
    .eq("id", id);
  return { data, error };
}

/**
 * Create a new official prayer time record. Accepts an object matching
 * the `official_prayer_times` table.
 */
export async function createOfficialPrayerTime(record: Record<string, any>) {
  if (!supabase) {
    return { data: null, error: new Error("Supabase is not enabled") };
  }
  const { data, error } = await supabase
    .from("official_prayer_times")
    .insert(record)
    .select()
    .single();
  return { data, error };
}

/**
 * Update an existing official prayer time record by ID.
 */
export async function updateOfficialPrayerTime(id: number, record: Record<string, any>) {
  if (!supabase) {
    return { data: null, error: new Error("Supabase is not enabled") };
  }
  const { data, error } = await supabase
    .from("official_prayer_times")
    .update(record)
    .eq("id", id)
    .select()
    .single();
  return { data, error };
}

/**
 * Delete an official prayer time record by ID.
 */
export async function deleteOfficialPrayerTime(id: number) {
  if (!supabase) {
    return { data: null, error: new Error("Supabase is not enabled") };
  }
  const { data, error } = await supabase
    .from("official_prayer_times")
    .delete()
    .eq("id", id);
  return { data, error };
}

/**
 * Fetch all appointments for the current authenticated user. Returns an array
 * of appointment records from the `appointments` table. If a date is
 * specified, filters appointments for that date. Results are ordered by
 * date and time. Requires Supabase auth to be initialized.
 */
export async function fetchOfficialAppointments(date?: string) {
  if (!supabase) {
    return { data: [], error: new Error("Supabase is not enabled") };
  }
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) {
    return { data: [], error: userError ?? new Error("User not authenticated") };
  }
  let query = supabase
    .from("appointments")
    .select("*")
    .eq("user_id", userData.user.id)
    .order("date", { ascending: true })
    .order("time", { ascending: true });
  if (date) {
    query = query.eq("date", date);
  }
  const { data, error } = await query;
  return { data: data ?? [], error };
}

/**
 * Create a new appointment for the current user. Accepts an object with
 * fields matching the `appointments` table except `user_id` which will be
 * automatically filled with the authenticated user's ID. Returns the
 * inserted record on success.
 */
export async function createOfficialAppointment(record: Record<string, any>) {
  if (!supabase) {
    return { data: null, error: new Error("Supabase is not enabled") };
  }
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) {
    return { data: null, error: userError ?? new Error("User not authenticated") };
  }
  const insertRecord = { ...record, user_id: userData.user.id };
  const { data, error } = await supabase
    .from("appointments")
    .insert(insertRecord)
    .select()
    .single();
  return { data, error };
}

/**
 * Update an existing appointment for the current user. Accepts the
 * appointment ID and an object with the updated fields. Does not allow
 * changing the user_id. Returns the updated record on success.
 */
export async function updateOfficialAppointment(id: number, record: Record<string, any>) {
  if (!supabase) {
    return { data: null, error: new Error("Supabase is not enabled") };
  }
  const { data, error } = await supabase
    .from("appointments")
    .update(record)
    .eq("id", id)
    .select()
    .single();
  return { data, error };
}

/**
 * Delete an appointment by ID for the current user. Returns the deleted
 * record(s) on success.
 */
export async function deleteOfficialAppointment(id: number) {
  if (!supabase) {
    return { data: null, error: new Error("Supabase is not enabled") };
  }
  const { data, error } = await supabase
    .from("appointments")
    .delete()
    .eq("id", id);
  return { data, error };
}