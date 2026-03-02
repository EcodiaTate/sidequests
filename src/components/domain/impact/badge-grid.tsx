"use client";

import { useState } from "react";
import { Lock, Award } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { useHaptic } from "@/lib/hooks/use-haptics";

type Badge = {
  id: string;
  name: string;
  description: string | null;
  icon_url: string | null;
  earned: boolean;
  tier: number;
  earnedAt: string | null;
};

type Props = {
  badges: Badge[];
};

export function BadgeGrid({ badges }: Props) {
  const haptic = useHaptic();
  const [selected, setSelected] = useState<Badge | null>(null);

  return (
    <>
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
        {badges.map((badge) => (
          <button
            key={badge.id}
            type="button"
            onClick={() => {
              setSelected(badge);
              haptic.impact("light");
            }}
            className="active-push touch-target flex flex-col items-center gap-1 p-2 rounded-lg"
            style={{
              opacity: badge.earned ? 1 : 0.4,
            }}
          >
            {badge.icon_url ? (
              <img
                src={badge.icon_url}
                alt={badge.name}
                className="w-10 h-10"
              />
            ) : (
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{
                  background: badge.earned ? "var(--ec-gold-100)" : "var(--surface-2)",
                }}
              >
                {badge.earned ? (
                  <Award className="w-5 h-5" style={{ color: "var(--ec-gold-500)" }} />
                ) : (
                  <Lock className="w-5 h-5 t-subtle" />
                )}
              </div>
            )}
            <span className="text-fluid-xs t-base text-center line-clamp-1">
              {badge.name}
            </span>
          </button>
        ))}
      </div>

      {/* Detail modal */}
      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.name ?? ""}
        size="sm"
      >
        {selected && (
          <div className="flex flex-col items-center gap-3 text-center">
            {selected.icon_url ? (
              <img src={selected.icon_url} alt="" className="w-16 h-16" />
            ) : (
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{
                  background: selected.earned ? "var(--ec-gold-100)" : "var(--surface-2)",
                }}
              >
                {selected.earned ? (
                  <Award className="w-8 h-8" style={{ color: "var(--ec-gold-500)" }} />
                ) : (
                  <Lock className="w-8 h-8 t-subtle" />
                )}
              </div>
            )}
            <p className="text-fluid-sm t-muted">{selected.description ?? "Keep going!"}</p>
            {selected.earned && selected.earnedAt && (
              <p className="text-fluid-xs t-subtle">
                Earned {new Date(selected.earnedAt).toLocaleDateString()}
              </p>
            )}
            {!selected.earned && (
              <p className="text-fluid-xs t-subtle">Not yet earned</p>
            )}
          </div>
        )}
      </Modal>
    </>
  );
}
