"use client";

import { useState, useTransition } from "react";
import { Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHaptic } from "@/lib/hooks/use-haptics";
import { deleteReview } from "@/lib/actions/eco-local";
import type { ReviewWithProfile } from "@/lib/actions/eco-local";

type Props = {
  review: ReviewWithProfile;
  isOwn: boolean;
  onDeleted: () => void;
};

export function BusinessReviewCard({ review, isOwn, onDeleted }: Props) {
  const haptic = useHaptic();
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    haptic.impact("heavy");
    startTransition(async () => {
      const result = await deleteReview({ reviewId: review.id });
      if ("success" in result) {
        haptic.notify("success");
        onDeleted();
      } else {
        haptic.notify("error");
      }
    });
  }

  return (
    <div className="card pad-3 border border-border space-y-2" style={{ boxShadow: "var(--neo-shadow-sm)" }}>
      {/* Header: reviewer + date */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-fluid-xs font-bold shrink-0"
            style={{ background: "var(--ec-forest-800)", color: "var(--ec-mint-400)" }}
          >
            {(review.profile?.display_name ?? "U").charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-fluid-sm font-semibold truncate">{review.profile?.display_name ?? "Anonymous"}</p>
            <p className="text-fluid-xs t-muted">{new Date(review.created_at ?? "").toLocaleDateString("en-AU", { month: "short", year: "numeric" })}</p>
          </div>
        </div>

        {/* Stars */}
        <div className="flex items-center gap-0.5 shrink-0">
          {[1, 2, 3, 4, 5].map((n) => (
            <Star
              key={n}
              className="w-3.5 h-3.5"
              style={{ color: n <= review.rating ? "var(--ec-gold-500)" : "var(--border)" }}
              fill={n <= review.rating ? "var(--ec-gold-500)" : "none"}
            />
          ))}
        </div>
      </div>

      {/* Comment */}
      {review.comment && (
        <p className="text-fluid-sm" style={{ color: "var(--text-base)" }}>{review.comment}</p>
      )}

      {/* Delete (own review) */}
      {isOwn && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="touch-target active-push inline-flex items-center gap-1 text-fluid-xs"
            style={{ color: "var(--ec-danger)" }}
          >
            <Trash2 className="w-3 h-3" />
            {isPending ? "Deleting..." : "Delete"}
          </button>
        </div>
      )}
    </div>
  );
}
