-- Enables Supabase Realtime (live updates) for the tables the portal's
-- sidebar notification badges watch: new/booked appointments and pending
-- website reviews. Without this, INSERT/UPDATE events on these tables
-- won't be pushed to the browser, and the badge will only update on a
-- full page refresh.

alter publication supabase_realtime add table appointments;
alter publication supabase_realtime add table public_reviews;
