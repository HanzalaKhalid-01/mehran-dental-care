# Mehran Dental Care — Website + Clinic Portal

Two things live in this one project, both free to host:

1. **Public website** (`/`, `/services`, `/about`, `/contact`) — anyone can see this.
   No login required. Built for patients: services, hours, address, and one-tap
   WhatsApp booking/inquiry buttons.
2. **Private staff portal** (`/portal/*`) — login-protected. This is the clinic
   management + accounting system your brother uses day-to-day.

No traditional backend server — Supabase (free tier) provides the database, auth,
and storage for the portal; Cloudflare Pages hosts the whole site (public + portal)
for free.

Full architecture, database design, and roadmap: see [`ARCHITECTURE.md`](./ARCHITECTURE.md).

## Public website
- **Homepage** — hero with WhatsApp booking CTA, services preview, hours card
- **Services** (`/services`) — full treatment list, each with a "ask on WhatsApp" link
- **About** (`/about`) — clinic description. **This copy is a placeholder** — I
  deliberately kept it generic since I don't have verified specifics (doctor
  names, credentials, founding year). Edit `app/about/page.tsx` with real details.
- **Contact** (`/contact`) — address, phone, embedded Google Map, WhatsApp buttons
- Design: custom navy/teal/mint/marigold palette, self-hosted Manrope + Karla
  fonts (no Google Fonts dependency), a recurring "smile arc" motif

## Private portal (`/portal`)
- **Login** — email/password auth via Supabase Auth; every `/portal/*` route
  redirects to `/portal/login` if not signed in. The public site is untouched by
  this — no login needed to browse it.
- **Dashboard** — today's revenue, patients today, pending appointments, outstanding dues
- **Patients** — add, edit, delete, and a full detail page per patient showing visit history, invoices, total billed, and outstanding balance
- **Appointments** — book, delete, and update status inline (booked → confirmed → completed/cancelled/no-show), with one-tap WhatsApp reminder buttons
- **Accounting**
  - **Income** — auto-rolled up from recorded payments
  - **Expenses** — add, delete, properly categorized (linked to a real `expense_categories` table, seeded with defaults)
  - **Invoices** — create, mark paid (cash), delete (only while unpaid — paid invoices are kept immutable for accounting integrity), one-tap WhatsApp payment reminder
  - **Reports** — monthly Profit & Loss, exportable to Excel and PDF (fully client-side, no backend)
- **WhatsApp** — Phase 1 click-to-chat deep links (`lib/whatsapp/deepLink.ts`), shared by both the public site and the portal
- **PWA** — installable with icons, manifest configured

## 1. Set up Supabase (5–10 minutes)
1. Go to [supabase.com](https://supabase.com) → **New Project** (free tier).
2. Once created, open the **SQL Editor** and run the contents of
   `supabase/migrations/0001_init.sql`. This creates every table, seeds default
   expense categories, and sets up a starter "open to any logged-in user"
   security policy — appropriate since only your brother will log in for now.
3. Go to **Authentication → Users** → **Add user** → create a login for your
   brother (email + password). This is the account he'll use to sign in at `/portal/login`.
4. Go to **Project Settings → API** → copy the **Project URL** and **anon public key**.

## 2. Configure the app
```bash
cp .env.local.example .env.local
# paste your Supabase URL + anon key into .env.local
```

## 3. Run locally
```bash
npm install
npm run dev
```
Open http://localhost:3000 — the public homepage loads immediately (no login).
Go to http://localhost:3000/portal to reach the staff dashboard — you'll be
redirected to `/portal/login`, then `/portal/dashboard` once signed in.

## 4. Deploy for free (Cloudflare Pages)
1. Push this project to a GitHub repo.
2. In Cloudflare Pages, **Create a project** → connect the repo.
3. Framework preset: **Next.js**. Add your two environment variables
   (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) in the Pages
   project settings.
4. Deploy — you get a free `*.pages.dev` URL. Every `git push` auto-redeploys.

## 5. PWA icons
`public/icon-192.png` and `public/icon-512.png` are included as simple placeholders
(teal circle, "M" mark) so installs don't look broken — swap them for your real
clinic logo at the same filenames/sizes whenever you have one.

## What's next
See `ARCHITECTURE.md` §15 for the full roadmap. Reasonable next steps once this
feels solid in daily use:
1. Tighten Row Level Security once you add a receptionist or second doctor
   (policies for that are documented in `ARCHITECTURE.md` §9).
2. Add treatment/prescription detail fields to the patient record.
3. Add inventory and supplier tracking (schema already exists, no UI yet).
4. Move WhatsApp from manual tap-to-send (Phase 1) to fully automatic via the
   Cloud API + n8n (Phase 3), once you're ready.
