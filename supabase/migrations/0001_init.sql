-- Mehran Dental Care — initial schema
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

-- ── MVP simplification ──────────────────────────────────────────
-- Since only your brother (a single admin user) is using this to start,
-- Row Level Security is left OPEN for authenticated users on all tables below.
-- This is safe because only he will have a login. Before adding a
-- receptionist or second doctor, tighten these policies per role
-- (see ARCHITECTURE.md §9 for the target role-based policies).

alter table patients enable row level security;
alter table appointments enable row level security;
alter table invoices enable row level security;
alter table invoice_items enable row level security;
alter table payments enable row level security;
alter table expenses enable row level security;
alter table expense_categories enable row level security;
alter table treatments enable row level security;
alter table treatment_plans enable row level security;
alter table doctors enable row level security;
alter table staff enable row level security;
alter table inventory enable row level security;
alter table suppliers enable row level security;
alter table reviews enable row level security;
alter table branches enable row level security;

create policy "authenticated_full_access_patients" on patients for all using (auth.role() = 'authenticated');
create policy "authenticated_full_access_appointments" on appointments for all using (auth.role() = 'authenticated');
create policy "authenticated_full_access_invoices" on invoices for all using (auth.role() = 'authenticated');
create policy "authenticated_full_access_invoice_items" on invoice_items for all using (auth.role() = 'authenticated');
create policy "authenticated_full_access_payments" on payments for all using (auth.role() = 'authenticated');
create policy "authenticated_full_access_expenses" on expenses for all using (auth.role() = 'authenticated');
create policy "authenticated_full_access_expense_categories" on expense_categories for all using (auth.role() = 'authenticated');
create policy "authenticated_full_access_treatments" on treatments for all using (auth.role() = 'authenticated');
create policy "authenticated_full_access_treatment_plans" on treatment_plans for all using (auth.role() = 'authenticated');
create policy "authenticated_full_access_doctors" on doctors for all using (auth.role() = 'authenticated');
create policy "authenticated_full_access_staff" on staff for all using (auth.role() = 'authenticated');
create policy "authenticated_full_access_inventory" on inventory for all using (auth.role() = 'authenticated');
create policy "authenticated_full_access_suppliers" on suppliers for all using (auth.role() = 'authenticated');
create policy "authenticated_full_access_reviews" on reviews for all using (auth.role() = 'authenticated');
create policy "authenticated_full_access_branches" on branches for all using (auth.role() = 'authenticated');

-- Seed one branch so branch_id has something to reference later
insert into branches (name, address) values ('Mehran Dental Care — Main', 'Unit No.10, Market Road, near Afzal Ground, Latifabad Unit 10, Hyderabad');

-- Seed default expense categories used by the Expenses page dropdown
insert into expense_categories (name) values
  ('Rent'), ('Salaries'), ('Dental Supplies'), ('Lab Fees'), ('Utilities'), ('Marketing'), ('Misc');
