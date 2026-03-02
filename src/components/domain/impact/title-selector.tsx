"use client";

import { useTransition } from "react";
import { Check, Crown } from "lucide-react";
import { useHaptic } from "@/lib/hooks/use-haptics";
import { selectTitle, clearTitle } from "@/lib/actions/gamification";
import { Button } from "@/components/ui/button";

type TitleType = {
  id: string;
  name: string;
  description: string | null;
  xp_boost_pct: number | null;
};

type Props = {
  titles: TitleType[];
  selectedId: string | null;
  onUpdate?: () => void;
};

export function TitleSelector({ titles, selectedId, onUpdate }: Props) {
  const haptic = useHaptic();
  const [isPending, startTransition] = useTransition();

  const handleSelect = (titleId: string) => {
    startTransition(async () => {
      if (selectedId === titleId) {
        await clearTitle();
      } else {
        await selectTitle({ titleId });
      }
      haptic.impact("medium");
      onUpdate?.();
    });
  };

  if (titles.length === 0) {
    return (
      <p className="text-fluid-xs t-muted text-center py-4">
        No titles available yet. Keep completing quests!
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {titles.map((title) => {
        const isSelected = title.id === selectedId;
        return (
          <button
            key={title.id}
            type="button"
            onClick={() => handleSelect(title.id)}
            disabled={isPending}
            className="card pad-3 flex items-center gap-3 active-push text-left w-full"
            style={{
              border: isSelected
                ? "var(--neo-border-thin) solid var(--ec-gold-500)"
                : "var(--neo-border-thin) solid var(--border)",
              boxShadow: isSelected ? "var(--neo-shadow-gold)" : "none",
            }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
              style={{
                background: isSelected ? "var(--ec-gold-100)" : "var(--surface-2)",
              }}
            >
              {isSelected ? (
                <Check className="w-4 h-4" style={{ color: "var(--ec-gold-600)" }} />
              ) : (
                <Crown className="w-4 h-4 t-muted" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-fluid-sm font-semibold t-strong">{title.name}</p>
              {title.description && (
                <p className="text-fluid-xs t-muted truncate">{title.description}</p>
              )}
            </div>
            {title.xp_boost_pct != null && title.xp_boost_pct > 0 && (
              <span
                className="text-fluid-xs font-semibold shrink-0"
                style={{ color: "var(--ec-gold-500)" }}
              >
                +{title.xp_boost_pct}% XP
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
