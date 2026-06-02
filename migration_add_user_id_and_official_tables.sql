-- Migration script to support multi‑user data and official sources
-- =============================================

-- Add user_id to existing tables and new columns for official status.

-- 1. Appointments: associate records with the authenticated user
ALTER TABLE appointments
    ADD COLUMN IF NOT EXISTS user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Financial events: associate with user and add confirmed/source columns
ALTER TABLE financial_events
    ADD COLUMN IF NOT EXISTS user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    ADD COLUMN IF NOT EXISTS confirmed boolean NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS source text;

-- 3. Notifications: associate notifications with a user; allow null for broadcast
ALTER TABLE notifications
    ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- 4. Prayer times: we keep the existing table for fallback calculations.
-- A new table will store verified prayer times from official sources.

-- Create table for official financial dates (if it doesn't already exist)
CREATE TABLE IF NOT EXISTS official_financial_dates (
    id              serial PRIMARY KEY,
    event_key       text NOT NULL,
    event_name_ar   text NOT NULL,
    occurrence_date_gregorian date NOT NULL,
    occurrence_date_hijri     text,
    source_authority text NOT NULL,
    source_url      text,
    verified_at     timestamptz NOT NULL DEFAULT now(),
    is_confirmed    boolean NOT NULL DEFAULT false,
    created_at      timestamptz NOT NULL DEFAULT now()
);

-- Create table for official prayer times
CREATE TABLE IF NOT EXISTS official_prayer_times (
    id              serial PRIMARY KEY,
    city_key        text NOT NULL,
    city_name_ar    text NOT NULL,
    date_gregorian  date NOT NULL,
    date_hijri      text,
    fajr            text NOT NULL,
    sunrise         text NOT NULL,
    dhuhr           text NOT NULL,
    asr             text NOT NULL,
    maghrib         text NOT NULL,
    isha            text NOT NULL,
    source_authority text NOT NULL,
    source_url      text,
    verified_at     timestamptz NOT NULL DEFAULT now(),
    is_confirmed    boolean NOT NULL DEFAULT false,
    created_at      timestamptz NOT NULL DEFAULT now()
);

-- Indexes to speed up queries on dates and city keys
CREATE INDEX IF NOT EXISTS idx_official_financial_dates_key ON official_financial_dates(event_key, occurrence_date_gregorian);
CREATE INDEX IF NOT EXISTS idx_official_prayer_times_city_date ON official_prayer_times(city_key, date_gregorian);