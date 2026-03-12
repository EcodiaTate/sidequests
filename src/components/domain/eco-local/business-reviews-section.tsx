"use client";

import { useState } from "react";
import { Star, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { BusinessReviewCard } from "./business-review-card";
import { BusinessReviewForm } from "./business-review-form";
import { useHaptic } from "@/lib/hooks/use-haptics";
import type { ReviewWithProfile } from "@/lib/actions/eco-local";

type Props = {
  businessId: string;
  initialReviews: ReviewWithProfile[];
  currentUserId: string | null;
  canReview: boolean;
  userReviewId: string | null;
};

function AverageStars({ rating }: { rating: number }) {
  const rounded = Math.round(rating * 2) / 2;
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className="w-4 h-4"
          style={{ color: n <= rounded ? "var(--ec-gold-500)" : "var(--border)" }}
          fill={n <= rounded ? "var(--ec-gold-500)" : "none"}
        />
      ))}
      <span className="text-fluid-xs t-muted ml-1">{rating.toFixed(1)}</span>
    </div>
  );
}

export function BusinessReviewsSection({ businessId, initialReviews, currentUserId, canReview, userReviewId }: Props) {
  const haptic = useHaptic();
  const [reviews, setReviews] = useState(initialReviews);
  const [showForm, setShowForm] = useState(false);

  const avg = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  const hasReviewed = reviews.some((r) => r.user_id === currentUserId);
  const showWriteButton = canReview && !hasReviewed && !showForm;

  function handleSubmitted() {
    setShowForm(false);
    // Refresh by reloading the page - simple and correct
    window.location.reload();
  }

  function handleDeleted(reviewId: string) {
    setReviews((prev) => prev.filter((r) => r.id !== reviewId));
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" style={{ color: "var(--ec-forest-600)" }} />
          <h3 className="text-fluid-md uppercase">Reviews</h3>
          <span className="text-fluid-xs t-muted">({reviews.length})</span>
        </div>
        {reviews.length > 0 && <AverageStars rating={avg} />}
      </div>

      {/* Write review button */}
      {showWriteButton && (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            haptic.impact("light");
            setShowForm(true);
          }}
          icon={<Star className="w-4 h-4" />}
        >
          Write a Review
        </Button>
      )}

      {/* Review form */}
      {showForm && (
        <BusinessReviewForm
          businessId={businessId}
          onSubmitted={handleSubmitted}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Review list */}
      {reviews.length === 0 && !showForm ? (
        <EmptyState
          icon={<Star className="w-8 h-8" />}
          title="No reviews yet"
          description={canReview ? "Be the first to leave a review" : "Reviews from customers will appear here"}
        />
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <BusinessReviewCard
              key={review.id}
              review={review}
              isOwn={review.user_id === currentUserId}
              onDeleted={() => handleDeleted(review.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
