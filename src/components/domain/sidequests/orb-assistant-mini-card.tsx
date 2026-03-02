"use client";

import { Zap, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { SIDEQUEST_KINDS, DIFFICULTY_CONFIG } from "@/lib/constants/sidequests";
import { useHaptic } from "@/lib/hooks/use-haptics";
import type { Sidequest } from "@/types/domain";

type Props = {
  sidequest: Sidequest;
  onSelect?: () => void;
};

export function OrbAssistantMiniCard({ sidequest, onSelect }: Props) {
  const router = useRouter();
  const haptics = useHaptic();

  const kindConfig = SIDEQUEST_KINDS[sidequest.kind];
  const diffConfig = sidequest.difficulty
    ? DIFFICULTY_CONFIG[sidequest.difficulty]
    : null;

  function handleClick() {
    haptics.impact("light");
    onSelect?.();
    router.push(`/quests/${sidequest.id}`);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="active-push touch-target text-left w-full flex items-center gap-3 pad-3 rounded-2xl transition-all"
      style={{
        border: "1px solid var(--border)",
        background: "var(--surface-subtle)",
      }}
    >
      {/* Kind emoji / accent icon */}
      <div
        className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-lg"
        style={{ background: "var(--ec-mint-50)", border: "1px solid var(--ec-mint-200)" }}
      >
        {kindConfig.label.charAt(0)}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-fluid-sm font-semibold t-strong line-clamp-1 uppercase">
          {sidequest.title}
        </p>

        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span
            className="text-fluid-xs font-medium px-1.5 py-0.5 rounded-md"
            style={{
              background: "var(--ec-mint-50)",
              color: "var(--ec-forest-700)",
              border: "1px solid var(--ec-mint-200)",
            }}
          >
            {kindConfig.label}
          </span>

          {diffConfig && (
            <span
              className="text-fluid-xs font-medium"
              style={{ color: diffConfig.color }}
            >
              {diffConfig.label}
            </span>
          )}

          {sidequest.time_estimate_min && (
            <span className="flex items-center gap-1 text-fluid-xs t-muted">
              <Clock className="w-3 h-3" />
              {sidequest.time_estimate_min}m
            </span>
          )}
        </div>
      </div>

      {/* Reward preview */}
      {(sidequest.reward_eco ?? 0) > 0 && (
        <div className="shrink-0 flex flex-col items-end gap-0.5">
          <span
            className="flex items-center gap-1 text-fluid-xs font-semibold"
            style={{ color: "var(--ec-mint-600)" }}
          >
            <Zap className="w-3.5 h-3.5" />
            {sidequest.reward_eco}
          </span>
          <span className="text-fluid-xs t-muted">ECO</span>
        </div>
      )}
    </button>
  );
}
