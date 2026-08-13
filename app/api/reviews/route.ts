import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "edge";

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const recentSubmitters = new Map<string, number>();

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

function getAnonClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) return null;

  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid request body." }, 400);
  }

  const { name, rating, comment } = (body ?? {}) as {
    name?: unknown;
    rating?: unknown;
    comment?: unknown;
  };

  if (typeof name !== "string" || name.trim().length < 2 || name.trim().length > 80) {
    return json({ error: "Please enter your name." }, 400);
  }
  if (typeof rating !== "number" || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    return json({ error: "Please choose a rating from 1 to 5." }, 400);
  }
  if (typeof comment !== "string" || comment.trim().length < 5) {
    return json({ error: "Please write a short review." }, 400);
  }
  if (comment.trim().length > 1000) {
    return json({ error: "Review is too long (max 1000 characters)." }, 400);
  }

  // Very light rate limiting per IP to deter spam bots.
  const ip = req.headers.get("cf-connecting-ip") ?? req.headers.get("x-forwarded-for") ?? "unknown";
  const now = Date.now();
  const last = recentSubmitters.get(ip);
  if (last && now - last < RATE_LIMIT_WINDOW_MS) {
    return json({ error: "You've already submitted a review recently. Thank you!" }, 429);
  }

  const supabase = getAnonClient();
  if (!supabase) {
    return json({ error: "Reviews aren't set up yet. Please try again later." }, 503);
  }

  const { error } = await supabase.from("public_reviews").insert({
    name: name.trim(),
    rating,
    comment: comment.trim(),
    status: "pending",
  });

  if (error) {
    return json({ error: "Couldn't save your review. Please try again." }, 500);
  }

  recentSubmitters.set(ip, now);

  return json({ ok: true });
}
