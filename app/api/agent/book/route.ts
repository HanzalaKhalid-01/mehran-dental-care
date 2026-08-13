import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { validateBookingPayload } from "@/lib/agent/validate";

export const runtime = "edge";

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const recentPhones = new Map<string, number>();

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    return null;
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function getApproxTimestamp(preferred: string): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  if (/evening|7\s*[:.]?\s*15|8|9|10|11|night/i.test(preferred)) {
    d.setHours(20, 0, 0, 0);
  } else {
    d.setHours(13, 0, 0, 0);
  }
  return d.toISOString();
}

export async function POST(request: NextRequest) {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  const validated = validateBookingPayload(body);
  if (!validated.ok) {
    return json({ error: validated.error }, 400);
  }

  const { full_name, phone, preferred, treatment } = validated.data;

  const now = Date.now();
  const last = recentPhones.get(phone) ?? 0;
  if (now - last < RATE_LIMIT_WINDOW_MS) {
    return json(
      { error: "Please wait a few minutes before sending another request." },
      429
    );
  }
  recentPhones.set(phone, now);

  if (recentPhones.size > 200) {
    for (const [p, t] of recentPhones) {
      if (now - t > RATE_LIMIT_WINDOW_MS) recentPhones.delete(p);
    }
  }

  const supabase = getServiceClient();
  if (!supabase) {
    console.error("SUPABASE_SERVICE_ROLE_KEY is not set");
    return json(
      {
        error:
          "Booking service is temporarily unavailable. Please message us on WhatsApp +92 335 2411106.",
      },
      503
    );
  }

  try {
    const { data: branch, error: branchError } = await supabase
      .from("branches")
      .select("id")
      .limit(1)
      .maybeSingle();

    if (branchError || !branch) {
      console.error("No branch found", branchError);
      return json({ error: "Clinic configuration error. Please contact us on WhatsApp." }, 500);
    }

    let { data: patient } = await supabase
      .from("patients")
      .select("id")
      .eq("phone", phone)
      .maybeSingle();

    if (!patient) {
      const { data: newPatient, error: createError } = await supabase
        .from("patients")
        .insert({
          full_name,
          phone,
          branch_id: branch.id,
        })
        .select("id")
        .single();

      if (createError || !newPatient) {
        console.error("Patient create failed", createError);
        return json({ error: "Could not save your details. Please try WhatsApp." }, 500);
      }
      patient = newPatient;
    }

    const note = `ONLINE REQUEST via website AI agent.\nPreferred: ${preferred}\nTreatment: ${treatment}\nAwaiting staff confirmation on WhatsApp.`;

    const { error: apptError } = await supabase.from("appointments").insert({
      patient_id: patient.id,
      branch_id: branch.id,
      scheduled_at: getApproxTimestamp(preferred),
      status: "booked",
      notes: note,
    });

    if (apptError) {
      console.error("Appointment create failed", apptError);
      return json({ error: "Could not create the request. Please message us on WhatsApp." }, 500);
    }

    return json({ success: true });
  } catch (err) {
    console.error("Unexpected booking error", err);
    return json({ error: "Something went wrong. Please message us on WhatsApp +92 335 2411106." }, 500);
  }
}