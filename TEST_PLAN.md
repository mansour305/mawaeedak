# Mawaeedak Test Plan

This document outlines a set of recommended tests to verify the functionality and performance of the Mawaeedak web application after completing phases 1–7 of the migration.

## Unit Tests

* **Database Models and RLS Policies**
  * Verify that creating an appointment inserts the correct `user_id` and is restricted by RLS.
  * Test that financial events, notifications and appointments cannot be read or modified by other users.
  * Ensure that official data tables (financial dates and prayer times) are read‑only via the client.

* **Utility Functions**
  * Test date and time calculations (e.g. next prayer determination, financial countdown calculations) with edge cases such as end‑of‑month and daylight savings changes.
  * Test data formatting helpers (e.g. converting city names to keys).

## Integration Tests

* **Supabase Integration**
  * Authenticate using Supabase Auth and verify that protected endpoints return only the logged‑in user’s data.
  * Insert, update and delete appointments and ensure that the UI updates accordingly via React Query invalidation.
  * Create financial events and verify that they appear in both the admin dashboard and the user’s finance page.
  * Subscribe/unsubscribe to notifications and verify that the push subscription is stored on the server.

* **Admin Workflows**
  * Create, edit and delete news, jobs, themes, story templates and daily messages through the admin interface, ensuring that changes propagate to the user interface.
  * Add new official prayer times and financial dates through the admin panels and confirm they override fallback data on the user pages.

## End‑to‑End Tests

* **User Journey**
  * New user registration → login → onboarding → setting preferences.
  * Adding appointments, editing and deleting them, and verifying the calendar display.
  * Viewing news, jobs and other centers, using search/filtering functionality, and interacting with saving/sharing actions.
  * Using the home page to see upcoming appointments, next prayer countdown and financial events; toggling themes and verifying persistence.

* **Offline and Push Notifications**
  * Simulate offline mode by disabling network and verify that cached pages load correctly (home, finance, calendar, news).
  * Trigger a push notification on the server (e.g. new daily message or prayer reminder) and ensure it appears on the client when online.

## Performance & Accessibility Tests

* Measure time to first meaningful paint and overall load time on mobile devices using Lighthouse.
* Verify that all interactive elements are reachable via keyboard navigation and labelled properly for screen readers (WCAG 2.1 compliance).
* Ensure that color contrast meets accessibility guidelines.

Following this plan helps ensure that the application remains stable, secure and accessible as new features and data sources are integrated.