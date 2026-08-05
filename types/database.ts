// Minimal hand-written types to get the app compiling.
// Once your Supabase project exists, regenerate the real ones with:
//   npx supabase gen types typescript --project-id <your-project-id> > types/database.ts

export type Patient = {
  id: string;
  branch_id: string | null;
  full_name: string;
  phone: string;
  dob: string | null;
  gender: string | null;
  address: string | null;
  medical_history: Record<string, unknown>;
  created_at: string;
};

export type Appointment = {
  id: string;
  branch_id: string | null;
  patient_id: string;
  doctor_id: string | null;
  scheduled_at: string;
  status: "booked" | "confirmed" | "completed" | "cancelled" | "no_show";
  notes: string | null;
  created_at: string;
};

export type Invoice = {
  id: string;
  branch_id: string | null;
  patient_id: string;
  appointment_id: string | null;
  invoice_no: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  status: "unpaid" | "partial" | "paid";
  issued_at: string;
};

export type Payment = {
  id: string;
  invoice_id: string;
  amount: number;
  method: "cash" | "card" | "easypaisa" | "jazzcash" | "bank";
  paid_at: string;
  received_by: string | null;
};

export type Expense = {
  id: string;
  branch_id: string | null;
  category_id: string | null;
  description: string | null;
  amount: number;
  paid_at: string;
  paid_by: string | null;
  receipt_url: string | null;
};

// Placeholder — supabase-js just needs *a* Database type; refine after `supabase gen types`.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Database = any;
