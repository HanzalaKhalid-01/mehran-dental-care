-- ── Public website reviews ──────────────────────────────────────
-- Lets visitors submit a review directly on the site. Submissions start
-- as "pending" and are hidden from the public until a staff member
-- approves them from the portal (Reviews page). This is separate from
-- the existing `reviews` table (which is for internal, patient-linked
-- notes staff record themselves).

create table public_reviews (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  rating int not null check (rating between 1 and 5),
  comment text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz default now()
);

alter table public_reviews enable row level security;

-- Anyone (including anonymous site visitors) can submit a review.
create policy "anyone_can_submit_review" on public_reviews
  for insert
  with check (status = 'pending');

-- Anyone can read only the approved reviews (for the public testimonials section).
create policy "anyone_can_read_approved_reviews" on public_reviews
  for select
  using (status = 'approved');

-- Signed-in staff can see and manage everything (approve/reject/delete).
create policy "authenticated_full_access_public_reviews" on public_reviews
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create index public_reviews_status_idx on public_reviews (status, created_at desc);
