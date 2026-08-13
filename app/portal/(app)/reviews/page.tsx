import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ReviewActions } from "@/components/portal/ReviewActions";
import type { PublicReview } from "@/types/database";

async function getReviews(): Promise<PublicReview[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("public_reviews")
      .select("id, name, rating, comment, status, created_at")
      .order("created_at", { ascending: false });
    return (data as PublicReview[] | null) ?? [];
  } catch {
    return [];
  }
}

const statusVariant = {
  pending: "warning",
  approved: "success",
  rejected: "danger",
} as const;

export default async function PortalReviewsPage() {
  const reviews = await getReviews();
  const pendingCount = reviews.filter((r) => r.status === "pending").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reviews"
        description="Website review submissions — approve the ones you'd like shown publicly"
      />

      {reviews.length === 0 ? (
        <Card>
          <EmptyState
            title="No reviews yet"
            description="Patient reviews submitted from the website's Reviews page will appear here for approval."
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {pendingCount > 0 && (
            <p className="text-sm text-muted-foreground">
              <Badge variant="warning">{pendingCount} pending</Badge>{" "}
              <span className="ml-1">awaiting your review</span>
            </p>
          )}
          {reviews.map((r) => (
            <Card key={r.id} className="space-y-3">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground">{r.name}</p>
                    <Badge variant={statusVariant[r.status]}>{r.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {"★".repeat(r.rating)}
                    {"☆".repeat(5 - r.rating)} · {new Date(r.created_at).toLocaleDateString()}
                  </p>
                </div>
                <ReviewActions id={r.id} status={r.status} />
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed">{r.comment}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
