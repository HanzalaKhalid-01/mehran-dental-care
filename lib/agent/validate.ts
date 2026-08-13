/**
 * Validation helpers for the public booking agent.
 * Keeps bad data out of the database.
 */

export function normalizePakistaniPhone(input: string): string | null {
  const digits = input.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("03")) {
    return "+92" + digits.slice(1);
  }
  if (digits.length === 12 && digits.startsWith("923")) {
    return "+" + digits;
  }
  if (digits.length === 13 && digits.startsWith("923")) {
    return "+" + digits;
  }
  if (digits.length === 12 && digits.startsWith("92")) {
    return "+" + digits;
  }
  return null;
}

export function isValidFullName(name: string): boolean {
  const t = name.trim();
  return t.length >= 2 && t.length <= 80;
}

export function isValidPreferred(text: string): boolean {
  const t = text.trim();
  return t.length >= 3 && t.length <= 100;
}

export function isValidTreatment(text: string): boolean {
  const t = text.trim();
  return t.length >= 2 && t.length <= 120;
}

export type BookingPayload = {
  full_name: string;
  phone: string;
  preferred: string;
  treatment: string;
};

export function validateBookingPayload(raw: unknown): {
  ok: true;
  data: BookingPayload;
} | {
  ok: false;
  error: string;
} {
  if (!raw || typeof raw !== "object") {
    return { ok: false, error: "Invalid request" };
  }

  const body = raw as Record<string, unknown>;
  const full_name = typeof body.full_name === "string" ? body.full_name.trim() : "";
  const phoneRaw = typeof body.phone === "string" ? body.phone : "";
  const preferred = typeof body.preferred === "string" ? body.preferred.trim() : "";
  const treatment = typeof body.treatment === "string" ? body.treatment.trim() : "";

  if (!isValidFullName(full_name)) {
    return { ok: false, error: "Please provide a valid full name (2–80 characters)." };
  }

  const phone = normalizePakistaniPhone(phoneRaw);
  if (!phone) {
    return {
      ok: false,
      error: "Please provide a valid Pakistani WhatsApp number (e.g. 03XX XXXXXXX).",
    };
  }

  if (!isValidPreferred(preferred)) {
    return { ok: false, error: "Please tell us your preferred day and shift." };
  }

  if (!isValidTreatment(treatment)) {
    return { ok: false, error: "Please tell us the treatment or say “checkup”." };
  }

  return {
    ok: true,
    data: { full_name, phone, preferred, treatment },
  };
}