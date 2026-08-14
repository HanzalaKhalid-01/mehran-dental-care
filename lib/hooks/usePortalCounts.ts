"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function usePortalCounts() {
  const [newAppointments, setNewAppointments] = useState(0);
  const [pendingReviews, setPendingReviews] = useState(0);

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    async function loadCounts() {
      const [{ count: apptCount }, { count: reviewCount }] = await Promise.all([
        supabase.from("appointments").select("*", { count: "exact", head: true }).eq("status", "booked"),
        supabase.from("public_reviews").select("*", { count: "exact", head: true }).eq("status", "pending"),
      ]);
      if (cancelled) return;
      setNewAppointments(apptCount ?? 0);
      setPendingReviews(reviewCount ?? 0);
    }

    loadCounts();

    const channel = supabase
      .channel(`portal-nav-counts-${Date.now()}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "appointments" }, loadCounts)
      .on("postgres_changes", { event: "*", schema: "public", table: "public_reviews" }, loadCounts)
      .subscribe();

    return () => {
      cancelled = true;
      channel.unsubscribe().then(() => supabase.removeChannel(channel));
    };
  }, []);

  return { newAppointments, pendingReviews };
}
