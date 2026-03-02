"use client";

import { useState, useTransition } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useHaptic } from "@/lib/hooks/use-haptics";
import { createReview } from "@/lib/actions/eco-local";

type Props = {
  businessId: string;
  onSubmitted: () => void;
  onCancel: () => void;
};

export function BusinessReviewForm({ businessId, onSubmitted, onCancel }: Props) {
  const haptic = useHaptic();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleStar(n: number) {
    haptic.selection();
    setRating(n);
  }

  function handleSubmit() {
    if (rating === 0) {
      setError("Please select a star rating.");
      return;
    }
    setError(null);
    haptic.impact("medium");

    startTransition(async () => {
      const result = await createReview({ businessId, rating, comment });
      if ("success" in result) {
        haptic.notify("success");
        onSubmitted();
      } else {
        setError(result.error);
        haptic.notify("error");
      }
    });
  }

  return (
    <div className="card pad-4 border border-border space-y-4" style={{ boxShadow: "var(--neo-shadow-sm)" }}>
      <h4 className="text-fluid-sm uppercase font-bold">Write a Review</h4>

      {/* Star rating input */}
      <div className="space-y-1">
        <p className="text-fluid-xs stamp">Your rating</p>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => handleStar(n)}
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(0)}
              className="touch-target active-push p-1"
              aria-label={n + " stars"}
            >
              <Star
                className="w-6 h-6 transition-colors"
                style={{ color: n <= (hover || rating) ? "var(--ec-gold-500)" : "var(--border)" }}
                fill={n <= (hover || rating) ? "var(--ec-gold-500)" : "none"}
              />
            </button>
          ))}
        </div>
      </div>

      <Textarea
        label="Comment (optional)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="What did you think?"
        rows={3}
      />

      {error && (
        <p className="text-fluid-xs" style={{ color: "var(--ec-danger)" }}>{error}</p>
      )}

      <div className="flex gap-2">
        <Button variant="secondary" fullWidth onClick={onCancel} disabled={isPending}>Cancel</Button>
        <Button variant="alive" fullWidth onClick={handleSubmit} loading={isPending}>Submit Review</Button>
      </div>
    </div>
  );
}
