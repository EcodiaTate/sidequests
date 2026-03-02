"use client";

import { useTransition } from "react";
import { useHaptic } from "@/lib/hooks/use-haptics";
import { addReaction, removeReaction } from "@/lib/actions/feed";
import { REACTION_CONFIG } from "@/lib/constants/gamification";
import type { ReactionKind } from "@/types/domain";

type Props = {
  feedItemId: string;
  counts: Record<string, number>;
  userReaction: string | null;
  onUpdate?: () => void;
};

const REACTION_KINDS: ReactionKind[] = ["eco", "wow", "cheer", "fire", "leaf"];

export function ReactionDock({ feedItemId, counts, userReaction, onUpdate }: Props) {
  const haptic = useHaptic();
  const [isPending, startTransition] = useTransition();

  const handleReaction = (kind: ReactionKind) => {
    startTransition(async () => {
      if (userReaction === kind) {
        await removeReaction({ feedItemId });
      } else {
        await addReaction({ feedItemId, kind });
      }
      haptic.impact("light");
      onUpdate?.();
    });
  };

  return (
    <div className="flex items-center gap-1">
      {REACTION_KINDS.map((kind) => {
        const config = REACTION_CONFIG[kind];
        const count = counts[kind] ?? 0;
        const isActive = userReaction === kind;

        return (
          <button
            key={kind}
            type="button"
            onClick={() => handleReaction(kind)}
            disabled={isPending}
            className="flex items-center gap-0.5 px-2 py-1 rounded-full text-fluid-xs active-push touch-target transition-colors"
            style={{
              background: isActive ? config.color + "20" : "transparent",
              opacity: isPending ? 0.5 : 1,
            }}
            aria-label={`${config.label} (${count})`}
          >
            <span>{config.emoji}</span>
            {count > 0 && (
              <span className={isActive ? "font-semibold" : "t-muted"}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
