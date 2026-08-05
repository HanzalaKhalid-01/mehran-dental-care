# Mehran Dental Care — Clinic ERP & Accounting System
### Full Architecture & Implementation Blueprint
**Prepared for:** Mehran Dental Care, Hyderabad, Pakistan
**Budget:** $0 (free-tier stack, built to scale for years before any paid upgrade is required)
**Stack:** Next.js + TypeScript + TailwindCSS (PWA) · Cloudflare Pages · Supabase (DB + Auth + Storage) · WhatsApp Business (Click-to-Chat)

---

## 1. System Architecture

### 1.1 High-Level Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT (Browser / PWA)                    │
│   Next.js App (installed on receptionist tablet/phone)        │
│   - Service Worker (offline cache)                            │
│   - IndexedDB (offline queue for weak-signal moments)         │
└───────────────────────────┬─────────────────────────────────┘
                             │ HTTPS (REST/Realtime via Supabase JS SDK)
┌───────────────────────────▼─────────────────────────────────┐
│                    SUPABASE (Free Tier)                       │
│   - PostgreSQL Database (with Row Level Security)              │
│   - Supabase Auth (email/password + magic link)                │
│   - Supabase Storage (patient files, X-rays, receipts)         │
│   - Edge Functions (scheduled jobs / reminders logic)          │
│   - Realtime (live dashboard updates)                          │
└───────────────────────────┬─────────────────────────────────┘
                             │ Deep Links / Cloud API (optional Phase 3)
┌───────────────────────────▼─────────────────────────────────┐
│                    WhatsApp Business                          │
│   Phase 1: wa.me click-to-chat deep links (100% free)         │
│   Phase 3: WhatsApp Cloud API (free tier, official Meta)      │
└─────────────────────────────────────────────────────────────┘
```

**Why this is NOT "client-side only," and why that's the right call:** A pure client-side (browser-storage-only) accounting system would lose all financial data on cache clear, device change, or reinstall, and couldn't be shared between the doctor, receptionist, and you. Supabase's free tier gives you a real hosted Postgres database, real authentication, and real backups — while remaining **$0/month** and requiring no server you have to maintain. This is the best of both worlds: no backend *code* to write or host, but real data durability.

### 1.2 Frontend Structure (Next.js App Router)

```
app/
├── (auth)/
│   ├── login/page.tsx
│   └── reset-password/page.tsx
├── (dashboard)/
│   ├── layout.tsx                 # sidebar + role-based nav
│   ├── dashboard/page.tsx         # main widgets
│   ├── patients/
│   │   ├── page.tsx               # list
│   │   ├── [id]/page.tsx          # profile, history
│   │   └── new/page.tsx
│   ├── appointments/
│   │   ├── page.tsx               # calendar view
│   │   └── queue/page.tsx         # today's queue
│   ├── accounting/
│   │   ├── income/page.tsx
│   │   ├── expenses/page.tsx
│   │   ├── invoices/page.tsx
│   │   ├── reports/page.tsx       # P&L, cash, monthly
│   │   └── receivables/page.tsx
│   ├── inventory/page.tsx
│   ├── staff/page.tsx
│   ├── settings/page.tsx
│   └── reviews/page.tsx
├── api/                            # Next.js route handlers (thin — mostly Supabase does the work)
│   └── whatsapp/webhook/route.ts   # only needed in Phase 3 (Cloud API)
├── manifest.ts                     # PWA manifest
├── sw.ts                           # service worker
└── layout.tsx
```

### 1.3 Backend Architecture
There is **no custom backend server**. "Backend logic" lives in two free places:
1. **Supabase Postgres** — business rules enforced via Row Level Security (RLS) policies and Postgres functions/triggers (e.g., auto-calculate invoice totals, auto-decrement inventory on treatment use).
2. **Supabase Edge Functions** (Deno, free tier: 500K invocations/month) — scheduled jobs like "generate tomorrow's appointment reminders" or "flag overdue invoices."

### 1.4 Security Architecture
- **Row Level Security (RLS)** on every table — a receptionist role literally cannot query doctor-only fields at the database level, not just hidden in the UI.
- **Supabase Auth** issues short-lived JWTs; refresh tokens rotate automatically.
- **HTTPS everywhere** (Cloudflare Pages + Supabase both enforce TLS by default).
- **Audit log table** capturing who changed what, when (see §2).
- **Backups**: Supabase free tier retains daily backups for 7 days; supplement with a weekly automated CSV export to Google Drive (free) for long-term retention — see §10.

### 1.5 Deployment Architecture
- **Cloudflare Pages** (free tier: unlimited bandwidth, unlimited requests) — connects directly to your GitHub repo; every `git push` auto-deploys.
- **Domain**: use the free `*.pages.dev` subdomain initially (e.g., `mehran-dental.pages.dev`). If you want a real domain later, `.com` domains run ~$10/year — the only recurring cost in this entire stack, and it's optional.

---

## 2. Database Design (PostgreSQL / Supabase)

Below are the core tables. Full SQL is in §16.

| Table | Key Fields | Relationships |
|---|---|---|
| **patients** | id, full_name, phone, dob, gender, address, medical_history (jsonb), created_at | 1→many appointments, invoices |
| **doctors** | id, user_id (FK auth.users), full_name, specialization, phone | 1→many appointments, treatments |
| **staff** | id, user_id, full_name, role (enum: admin/doctor/receptionist), phone | — |
| **appointments** | id, patient_id, doctor_id, scheduled_at, status (enum: booked/confirmed/completed/cancelled/no_show), notes | FK patients, doctors |
| **treatments** | id, name, default_price, category | many→many via treatment_plans |
| **treatment_plans** | id, patient_id, doctor_id, treatment_id, status, planned_date | FK patients, doctors, treatments |
| **invoices** | id, patient_id, appointment_id, invoice_no, subtotal, discount, tax, total, status (unpaid/partial/paid), issued_at | FK patients, appointments |
| **invoice_items** | id, invoice_id, treatment_id, description, qty, unit_price, line_total | FK invoices |
| **payments** | id, invoice_id, amount, method (cash/card/easypaisa/jazzcash/bank), paid_at, received_by (staff_id) | FK invoices |
| **expenses** | id, category_id, description, amount, paid_at, paid_by, receipt_url | FK expense_categories |
| **expense_categories** | id, name (rent, salaries, supplies, utilities, marketing...) | — |
| **inventory** | id, item_name, unit, quantity_on_hand, reorder_level, supplier_id | FK suppliers |
| **suppliers** | id, name, phone, address | — |
| **reviews** | id, patient_id, rating, comment, source (google/internal), created_at | FK patients |
| **notifications** | id, type, recipient, payload (jsonb), status (pending/sent/failed), scheduled_for | — |
| **activity_logs** | id, user_id, action, table_name, record_id, old_value (jsonb), new_value (jsonb), created_at | audit trail |

**Design notes:**
- All monetary fields use `numeric(12,2)` — never `float`, to avoid rounding errors in accounting.
- `activity_logs` is populated automatically via Postgres triggers (`AFTER INSERT/UPDATE/DELETE`) on financial tables — this gives you a tamper-evident audit trail for free, addressing the accounting-integrity concern.

---

## 3. Accounting Module

- **Income Tracking** — every `payments` row rolls up automatically into daily/monthly income via a Postgres view (`v_daily_income`).
- **Expense Tracking** — categorized entries with optional receipt photo upload to Supabase Storage.
- **Profit & Loss** — computed view: `SUM(payments.amount) - SUM(expenses.amount)` grouped by month.
- **Cash Reports** — filter payments by `method = 'cash'` for daily till reconciliation.
- **Monthly Reports / Daily Revenue** — dashboard widgets pulling from views, refreshed via Supabase Realtime.
- **Outstanding Payments / Patient Receivables** — `invoices WHERE status IN ('unpaid','partial')`, joined to patient contact info so the receptionist can WhatsApp a reminder in one tap.
- **Expense Categories** — configurable list (rent, salaries, dental supplies, lab fees, utilities, marketing, misc).
- **Export to Excel/PDF** — client-side generation using **SheetJS** (xlsx) and **jsPDF** — both free, no backend needed, runs entirely in-browser.

---

## 4. Patient Management Module
- **Registration** — quick-add form (name + phone minimum; rest optional) so front-desk friction is near zero.
- **Visit History** — timeline view pulling appointments + invoices + treatment_plans per patient.
- **Medical History** — structured JSONB field (allergies, conditions, current medications) editable by doctor role only (RLS-enforced).
- **Diagnoses / Prescriptions** — free-text + structured fields, PDF-exportable prescription slip (clinic letterhead via jsPDF).
- **Follow-ups** — flag on treatment_plans (`follow_up_date`) auto-feeds the reminder automation in §6.
- **Attachments** — X-rays/photos uploaded to Supabase Storage (1GB free, ~2,000+ compressed images — plenty for years of a small clinic).

---

## 5. Appointment Management
- **Calendar View** — using **FullCalendar** (free, open-source) or a lightweight custom grid.
- **Booking** — receptionist picks patient (or quick-adds new), doctor, date/time, treatment type.
- **Status Pipeline** — booked → confirmed (after WhatsApp reply) → completed / cancelled / no-show.
- **Rescheduling** — drag-and-drop on calendar, auto-triggers a "your appointment moved" WhatsApp deep link.
- **Daily Queue Management** — simple ordered list for walk-ins, sorted by check-in time, visible on a tablet at the front desk.

---

## 6. WhatsApp Integration

### Phase 1 (Free, Zero Setup): Click-to-Chat Deep Links
Every automated "message" is really a **pre-filled WhatsApp link** that the receptionist taps to send — WhatsApp itself sends nothing automatically, but 90% of the manual typing work disappears.

```
https://wa.me/92XXXXXXXXXX?text=Hi%20{{patient_name}}%2C%20this%20is%20a%20reminder%20for%20your%20appointment%20at%20Mehran%20Dental%20Care%20tomorrow%20at%20{{time}}.
```

Workflows built this way:
| Trigger | When | Link generated from |
|---|---|---|
| Appointment Confirmation | On booking | appointments table |
| Appointment Reminder | 1 day before (dashboard shows a "send reminders" list each morning) | appointments today+1 |
| Due Payment Reminder | invoice unpaid > 7 days | invoices view |
| Review Request | 1 day after `status = completed` | appointments |
| Follow-up Reminder | `follow_up_date` reached | treatment_plans |
| Missed Appointment | `status = no_show` | appointments |

The dashboard's "Today's Actions" widget lists every patient who needs one of these messages **with a ready-made tap-to-send button** — this is fully free and requires no Meta approval process.

### Phase 3 (Optional, Still Free Tier): WhatsApp Cloud API
Once volume grows, upgrade to Meta's official **WhatsApp Cloud API** (free up to a generous monthly conversation quota) via a no-code automation layer:
- **n8n** (self-host free, or free cloud tier) or **Make.com** (free tier) watches Supabase for new rows (via webhook/Realtime) and auto-sends the WhatsApp message — no manual tapping required at all.
- This is the only point in the whole system where a small paid tier might eventually apply (only after exceeding free conversation limits — irrelevant at a single small clinic's volume for a long time).

---

## 7. Automation System (All Free)
- **Supabase Database Webhooks** → fire on `INSERT` into `appointments`/`invoices` → call an Edge Function or n8n webhook.
- **Scheduled Jobs** — Supabase Edge Functions + **pg_cron** (built into Supabase Postgres, free) runs daily at e.g. 8 AM to build the "reminders to send today" list.
- **Email** — free via **Resend** (3,000 emails/month free) or **Supabase's built-in SMTP**, for daily summary emails to the owner.
- **Browser Notifications** — PWA push notifications (free, via Web Push API) alert staff to new bookings without needing a paid push service.
- **WhatsApp Deep Links** — as above, the zero-cost automation backbone for Phase 1–2.

---

## 8. Dashboard Design — Widgets
- Today's Revenue (sum of today's payments)
- Monthly Revenue (current month, with prior-month comparison %)
- Patients Today (count + list, tap to open queue)
- Pending Appointments (today + tomorrow)
- Outstanding Dues (total receivable, top 5 overdue patients with WhatsApp button)
- Inventory Alerts (items below reorder_level)
- Review Score (average rating, trend)
- Growth Trends (patients/month line chart, last 12 months — using **Recharts**, free)

---

## 9. User Roles & Permissions (RLS-enforced, not just UI-hidden)

| Role | Access |
|---|---|
| **Admin** (you/owner) | Full access to all tables, reports, settings, user management |
| **Doctor** | Patient records (medical history, diagnoses), appointments, prescriptions, treatment plans — **no** access to expenses/salary data |
| **Receptionist** | Patients (contact info + booking), billing/invoices, appointments — **no** access to medical history detail or P&L reports |

Enforced via Postgres RLS policies referencing `auth.uid()` mapped to the `staff.role` column — this means even if someone bypasses the UI and queries the API directly, the database itself blocks unauthorized rows.

---

## 10. Security Plan
- **Role-based access** — as above, database-enforced.
- **Data protection** — RLS + HTTPS + Supabase's encryption at rest.
- **Backup strategy** — (a) Supabase automatic daily backups (7-day retention on free tier), (b) a weekly Edge Function that exports key tables to CSV and uploads to a free Google Drive folder for long-term/offsite retention — belt and suspenders at $0 cost.
- **Recovery plan** — documented step-by-step restore from either Supabase backup or the CSV export; test this once per quarter.
- **Audit logs** — `activity_logs` table (see §2) captures every financial record change, who did it, and old/new values.

---

## 11. Folder Structure (Production-Ready Next.js)

```
mehran-dental-erp/
├── app/                       # (see §1.2)
├── components/
│   ├── ui/                    # shared buttons, inputs, cards
│   ├── dashboard/
│   ├── patients/
│   ├── accounting/
│   └── whatsapp/
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── types.ts           # generated from Supabase schema
│   ├── whatsapp/
│   │   └── deepLink.ts
│   ├── pdf/
│   │   └── generateInvoice.ts
│   └── utils/
├── public/
│   ├── icons/                 # PWA icons
│   └── manifest.json
├── supabase/
│   ├── migrations/            # SQL migration files
│   └── functions/             # Edge Functions
├── types/
├── next.config.js
├── tailwind.config.ts
└── package.json
```

---

## 12. API Design (Mostly Supabase Auto-Generated + a Few Custom)

Supabase auto-generates REST + Realtime APIs for every table. Custom logic layers on top:

| Action | Method |
|---|---|
| `getPatients()`, `createPatient()`, `updatePatient()` | Supabase client SDK direct calls |
| `getTodayAppointments()` | Postgres view `v_today_appointments` via SDK |
| `createInvoice(items[])` | Postgres function `fn_create_invoice` (transactional — creates invoice + line items + updates inventory atomically) |
| `recordPayment(invoiceId, amount)` | Postgres function `fn_record_payment` (updates invoice status automatically) |
| `getMonthlyPL(month)` | Postgres view `v_monthly_pl` |
| `generateWhatsAppLink(patientId, template)` | Client-side utility, no network call needed |
| `/api/whatsapp/webhook` (Phase 3 only) | Next.js route handler receiving Cloud API events |

---

## 13. UI/UX Design Guide

**Color Palette** (calm, clinical, trustworthy — dental-appropriate):
- Primary: `#0EA5A4` (teal — clean/medical association)
- Secondary: `#1E3A5F` (deep navy — trust)
- Accent: `#F0B429` (warm amber — CTAs, alerts)
- Success: `#22C55E` · Warning: `#F59E0B` · Danger: `#EF4444`
- Neutral background: `#F8FAFC`, text: `#0F172A`

**Design System:** TailwindCSS with a small custom design-tokens file; **shadcn/ui** components (free, copy-paste, no runtime dependency) for forms/tables/modals — consistent and fast to build.

**Navigation Structure:** Left sidebar (desktop) collapsing to bottom tab bar (mobile/PWA) — Dashboard · Patients · Appointments · Accounting · Inventory · Reviews · Settings, filtered by role.

**Mobile-first requirement:** every screen designed at 375px width first, then expanded — since the receptionist will likely use a phone or small tablet.

---

## 14. Scalability Plan

**From 1 dentist / 1 branch → multiple dentists / multiple branches, without rewriting:**
- Add a `branches` table now (even with just one row) — every table (`appointments`, `invoices`, `staff`) carries a `branch_id` from day one. This is the single most important "future-proofing" decision — retrofitting a multi-branch column later is painful; including it now costs nothing.
- Supabase free tier supports up to 500MB database + 50,000 monthly active users — a single clinic won't approach this for years; multi-branch growth is handled by the same database with more rows, not new infrastructure.
- RLS policies already scope by role; extending them to scope by `branch_id` is a small policy change, not an architecture change.
- When you do outgrow the free tier (very unlikely for years), Supabase's paid "Pro" tier is a simple upgrade with no migration — same schema, same code.

---

## 15. Development Roadmap

**Phase 1 — MVP (Weeks 1–3)**
Patient registration, appointment booking/calendar, basic invoicing + payment recording, income/expense tracking, PWA install support, WhatsApp click-to-chat reminders (manual tap).

**Phase 2 — Core Accounting Depth (Weeks 4–6)**
Full P&L/cash reports, receivables dashboard, expense categories, Excel/PDF export, inventory tracking, audit logs, role-based permissions fully enforced.

**Phase 3 — Automation Upgrade (Weeks 7–9)**
WhatsApp Cloud API integration via n8n (auto-send, no manual tapping), scheduled reminder jobs via pg_cron, email daily summaries, browser push notifications.

**Phase 4 — Polish & Scale-Readiness (Weeks 10–12)**
Multi-branch support activated, advanced analytics/growth trends, review-request automation, backup/recovery drilled and documented, staff training materials.

---

## 16. SQL Schema (Core Tables)

```sql
-- Enable extensions
create extension if not exists "uuid-ossp";

create type user_role as enum ('admin', 'doctor', 'receptionist');
create type appt_status as enum ('booked','confirmed','completed','cancelled','no_show');
create type invoice_status as enum ('unpaid','partial','paid');
create type payment_method as enum ('cash','card','easypaisa','jazzcash','bank');

create table branches (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  address text,
  created_at timestamptz default now()
);

create table staff (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) unique,
  branch_id uuid references branches(id),
  full_name text not null,
  role user_role not null,
  phone text,
  created_at timestamptz default now()
);

create table patients (
  id uuid primary key default uuid_generate_v4(),
  branch_id uuid references branches(id),
  full_name text not null,
  phone text not null,
  dob date,
  gender text,
  address text,
  medical_history jsonb default '{}',
  created_at timestamptz default now()
);

create table doctors (
  id uuid primary key default uuid_generate_v4(),
  staff_id uuid references staff(id),
  specialization text,
  created_at timestamptz default now()
);

create table treatments (
  id uuid primary key default uuid_generate_v4(),
  branch_id uuid references branches(id),
  name text not null,
  default_price numeric(12,2) not null,
  category text
);

create table appointments (
  id uuid primary key default uuid_generate_v4(),
  branch_id uuid references branches(id),
  patient_id uuid references patients(id),
  doctor_id uuid references doctors(id),
  scheduled_at timestamptz not null,
  status appt_status default 'booked',
  notes text,
  created_at timestamptz default now()
);

create table treatment_plans (
  id uuid primary key default uuid_generate_v4(),
  patient_id uuid references patients(id),
  doctor_id uuid references doctors(id),
  treatment_id uuid references treatments(id),
  status text default 'planned',
  planned_date date,
  follow_up_date date,
  created_at timestamptz default now()
);

create table invoices (
  id uuid primary key default uuid_generate_v4(),
  branch_id uuid references branches(id),
  patient_id uuid references patients(id),
  appointment_id uuid references appointments(id),
  invoice_no text unique not null,
  subtotal numeric(12,2) not null default 0,
  discount numeric(12,2) not null default 0,
  tax numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  status invoice_status default 'unpaid',
  issued_at timestamptz default now()
);

create table invoice_items (
  id uuid primary key default uuid_generate_v4(),
  invoice_id uuid references invoices(id) on delete cascade,
  treatment_id uuid references treatments(id),
  description text,
  qty int default 1,
  unit_price numeric(12,2) not null,
  line_total numeric(12,2) not null
);

create table payments (
  id uuid primary key default uuid_generate_v4(),
  invoice_id uuid references invoices(id),
  amount numeric(12,2) not null,
  method payment_method not null,
  paid_at timestamptz default now(),
  received_by uuid references staff(id)
);

create table expense_categories (
  id uuid primary key default uuid_generate_v4(),
  name text unique not null
);

create table expenses (
  id uuid primary key default uuid_generate_v4(),
  branch_id uuid references branches(id),
  category_id uuid references expense_categories(id),
  description text,
  amount numeric(12,2) not null,
  paid_at timestamptz default now(),
  paid_by uuid references staff(id),
  receipt_url text
);

create table suppliers (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  phone text,
  address text
);

create table inventory (
  id uuid primary key default uuid_generate_v4(),
  branch_id uuid references branches(id),
  item_name text not null,
  unit text,
  quantity_on_hand numeric(12,2) default 0,
  reorder_level numeric(12,2) default 0,
  supplier_id uuid references suppliers(id)
);

create table reviews (
  id uuid primary key default uuid_generate_v4(),
  patient_id uuid references patients(id),
  rating int check (rating between 1 and 5),
  comment text,
  source text default 'internal',
  created_at timestamptz default now()
);

create table notifications (
  id uuid primary key default uuid_generate_v4(),
  type text not null,
  recipient text not null,
  payload jsonb,
  status text default 'pending',
  scheduled_for timestamptz,
  created_at timestamptz default now()
);

create table activity_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id),
  action text not null,
  table_name text not null,
  record_id uuid,
  old_value jsonb,
  new_value jsonb,
  created_at timestamptz default now()
);

-- Example RLS policy: receptionists cannot read medical_history detail
alter table patients enable row level security;

create policy "admin_full_access" on patients
  for all using (
    exists (select 1 from staff where staff.user_id = auth.uid() and staff.role = 'admin')
  );

create policy "doctor_read_write" on patients
  for select using (
    exists (select 1 from staff where staff.user_id = auth.uid() and staff.role = 'doctor')
  );

create policy "receptionist_limited" on patients
  for select using (
    exists (select 1 from staff where staff.user_id = auth.uid() and staff.role = 'receptionist')
  );
-- (Column-level restriction on medical_history handled via a view: v_patients_reception)
```

---

## 17. Supabase Setup Instructions

1. Go to **supabase.com** → New Project (free tier) → note your project URL + anon key.
2. In the SQL Editor, paste and run the schema from §16.
3. **Auth** → Enable Email provider; create staff accounts (admin creates doctor/receptionist logins from a Settings page — don't allow public sign-up).
4. **Storage** → Create two buckets: `patient-attachments` (private) and `receipts` (private). Set bucket policies so only authenticated staff can read/write.
5. **Database → Webhooks** → (Phase 3) add a webhook on `appointments` INSERT pointing to your n8n workflow URL.
6. Copy your Supabase URL + anon key into a `.env.local` file locally, and into Cloudflare Pages' environment variables for production.

## 18. Next.js Implementation Plan
1. `npx create-next-app@latest mehran-dental-erp --typescript --tailwind --app`
2. Install: `@supabase/supabase-js @supabase/ssr recharts jspdf xlsx date-fns`
3. Add PWA support via `next-pwa` (free) or a hand-rolled `manifest.ts` + service worker.
4. Build `lib/supabase/client.ts` and `server.ts` for browser and server components respectively.
5. Scaffold pages per the folder structure in §11, starting with Phase 1 features.
6. Connect GitHub repo to Cloudflare Pages → auto-deploy on push to `main`.

## 19. Dashboard Page Layouts (Wireframe Description)

**Main Dashboard:** Top row — 4 stat cards (Today's Revenue, Patients Today, Pending Appointments, Outstanding Dues). Middle — Revenue trend chart (last 30 days) + Inventory Alerts list. Bottom — "Today's Actions" widget with tap-to-send WhatsApp buttons for reminders/follow-ups/review-requests.

**Patients List:** Search bar + filter chips (All/Active/Overdue Payment) → table/card list → tap opens Patient Profile (tabs: Overview, History, Medical, Invoices, Attachments).

**Accounting → Reports:** Month picker → P&L summary card → Income vs Expense bar chart → itemized tables below, each with an Export button (Excel/PDF).

---

## 20. Recommended Free Tools Summary

| Component | Free Tool | Notes |
|---|---|---|
| Frontend framework | Next.js | Free, open-source |
| Hosting | Cloudflare Pages | Unlimited bandwidth free tier |
| Database | Supabase (Postgres) | 500MB DB, 1GB storage free |
| Auth | Supabase Auth | Included free |
| File storage | Supabase Storage | Included free |
| Calendar UI | FullCalendar | Open-source |
| Charts | Recharts | Open-source |
| PDF export | jsPDF | Open-source, client-side |
| Excel export | SheetJS (xlsx) | Open-source, client-side |
| Automation/workflows | n8n (free tier/self-host) or Make.com free tier | For Phase 3 auto-WhatsApp |
| Email | Resend (3,000/mo free) | For daily summaries |
| Messaging | WhatsApp Business + wa.me deep links → Cloud API later | $0 through Phase 1–2 |
| Domain | `*.pages.dev` free subdomain | Optional paid `.com` later (~$10/yr) |

---

### Bottom line
This architecture keeps every recurring cost at **$0**, avoids the data-loss risk of a pure client-side app, gives your brother's clinic real multi-user/multi-device access, and has a clear, low-effort upgrade path (Phase 3) to fully automated WhatsApp messaging once the manual click-to-chat approach starts feeling limiting — likely not for a while at a small clinic's volume.
