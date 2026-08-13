"use client";

import { useState } from "react";
import { Star, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function ReviewForm() {
  const [name, setName] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (rating < 1) {
      setError("Please choose a star rating.");
      return;
    }
    if (comment.trim().length < 5) {
      setError("Please write a little about your visit.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, rating, comment }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setSubmitted(true);
    } catch {
      setError("Couldn't connect. Please check your internet and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-2xl bg-card border border-border p-8 text-center">
        <CheckCircle2 className="h-10 w-10 text-success mx-auto" />
        <h3 className="font-display font-bold text-lg text-foreground mt-3">
          Thanks for your review!
        </h3>
        <p className="text-sm text-muted-foreground mt-1.5 max-w-sm mx-auto">
          It&apos;ll appear on this page once our team takes a quick look.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl bg-card border border-border p-6 sm:p-8 space-y-5">
      <div>
        <p className="text-sm font-medium text-foreground mb-2">
          Your rating<span className="text-destructive ml-0.5">*</span>
        </p>
        <div className="flex gap-1" onMouseLeave={() => setHoverRating(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              aria-label={`${n} star${n > 1 ? "s" : ""}`}
              onMouseEnter={() => setHoverRating(n)}
              onClick={() => setRating(n)}
              className="p-0.5 focus-ring rounded"
            >
              <Star
                className={`h-7 w-7 transition-colors ${
                  n <= (hoverRating || rating)
                    ? "fill-marigold text-marigold"
                    : "fill-transparent text-muted-foreground"
                }`}
                strokeWidth={1.5}
              />
            </button>
          ))}
        </div>
      </div>

      <Input
        label="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. Ayesha Khan"
        maxLength={80}
        required
      />

      <div className="space-y-1.5">
        <label htmlFor="review-comment" className="block text-sm font-medium text-foreground">
          Your review<span className="text-destructive ml-0.5">*</span>
        </label>
        <textarea
          id="review-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Tell us about your visit — what treatment you had, how it went, anything that stood out."
          rows={4}
          maxLength={1000}
          required
          className="w-full rounded-xl border bg-card px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground border-border transition-colors focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary resize-y"
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" loading={submitting} size="lg" className="w-full sm:w-auto">
        Submit review
      </Button>
    </form>
  );
}
