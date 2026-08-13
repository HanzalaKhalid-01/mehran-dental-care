import { Star } from "lucide-react";
import { PublicNav } from "@/components/public/PublicNav";
import { PublicFooter } from "@/components/public/PublicFooter";
import { Reveal, Stagger, StaggerItem } from "@/components/public/motion";
import { ReviewForm } from "@/components/public/ReviewForm";
import { createClient } from "@/lib/supabase/server";
import { googleRating, googleReviewCount, googleReviewsUrl, reviewHighlights } from "@/lib/reviews";
import type { PublicReview } from "@/types/database";

async function getApprovedReviews(): Promise<PublicReview[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("public_reviews")
      .select("id, name, rating, comment, status, created_at")
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(24);
    return (data as PublicReview[] | null) ?? [];
  } catch {
    return [];
  }
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`h-4 w-4 ${n <= rating ? "fill-marigold text-marigold" : "fill-transparent text-border"}`}
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
}

export default async function ReviewsPage() {
  const patientReviews = await getApprovedReviews();

  return (
    <>
      <PublicNav />

      <section className="bg-mint py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <Reveal>
            <p className="text-xs font-semibold tracking-wide uppercase text-teal-dark">Reviews</p>
            <h1 className="font-display font-extrabold text-4xl md:text-6xl text-ink mt-2 tracking-tight">
              What patients say
            </h1>
            <div className="flex items-center gap-2 mt-4 text-sm text-ink/60">
              <span className="text-marigold font-semibold">★ {googleRating.toFixed(1)}</span>
              <span>· {googleReviewCount} reviews on Google</span>
              <a
                href={googleReviewsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-teal hover:text-teal-dark ml-2"
              >
                View on Google →
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 md:px-8 py-16 md:py-20 grid grid-cols-1 lg:grid-cols-5 gap-12">
        <div className="lg:col-span-3 space-y-10">
          {patientReviews.length > 0 && (
            <div>
              <h2 className="font-display font-bold text-xl text-foreground mb-5">
                Reviews from our website
              </h2>
              <Stagger className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {patientReviews.map((r) => (
                  <StaggerItem key={r.id} className="rounded-2xl bg-card border border-border p-5">
                    <Stars rating={r.rating} />
                    <p className="text-sm text-muted-foreground leading-relaxed mt-3">{r.comment}</p>
                    <p className="text-xs font-semibold text-foreground mt-3">{r.name}</p>
                  </StaggerItem>
                ))}
              </Stagger>
            </div>
          )}

          <div>
            <h2 className="font-display font-bold text-xl text-foreground mb-5">From Google</h2>
            <Stagger className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {reviewHighlights.map((r) => (
                <StaggerItem key={r.text} className="rounded-2xl bg-card border border-border p-5">
                  <p className="text-sm text-muted-foreground leading-relaxed">{r.text}</p>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="lg:sticky lg:top-24">
            <h2 className="font-display font-bold text-xl text-foreground mb-1">Leave a review</h2>
            <p className="text-sm text-muted-foreground mb-5">
              Had a visit recently? Let other patients know how it went.
            </p>
            <ReviewForm />
          </div>
        </div>
      </section>

      <PublicFooter />
    </>
  );
}
