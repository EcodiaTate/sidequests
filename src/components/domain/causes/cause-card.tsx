"use client";

import { Heart, Users, Trees, Waves, Zap, Leaf } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useHaptic } from "@/lib/hooks/use-haptics";
import type { CauseWithProgress } from "@/lib/actions/causes";

type Props = {
  cause: CauseWithProgress;
  onContribute: (cause: CauseWithProgress) => void;
};

const CATEGORY_CONFIG: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  reforestation: {
    icon: <Trees className="w-4 h-4" />,
    color: "var(--ec-forest-700)",
    bg: "var(--ec-forest-100)",
  },
  ocean: {
    icon: <Waves className="w-4 h-4" />,
    color: "var(--ec-mint-700)",
    bg: "var(--ec-mint-100)",
  },
  clean_energy: {
    icon: <Zap className="w-4 h-4" />,
    color: "var(--ec-gold-700)",
    bg: "var(--ec-gold-100)",
  },
  wildlife: {
    icon: <Leaf className="w-4 h-4" />,
    color: "var(--ec-forest-600)",
    bg: "var(--ec-forest-50)",
  },
  general: {
    icon: <Heart className="w-4 h-4" />,
    color: "var(--ec-mint-600)",
    bg: "var(--ec-mint-50)",
  },
};

export function CauseCard({ cause, onContribute }: Props) {
  const haptic = useHaptic();
  const cat = CATEGORY_CONFIG[cause.category] ?? CATEGORY_CONFIG.general;
  const pct = cause.pct;

  return (
    <div className="card border border-border space-y-3" style={{ boxShadow: "var(--neo-shadow-sm)" }}>
      {/* Image or placeholder */}
      {cause.image_url ? (
        <div className="h-36 rounded-t-xl overflow-hidden -mx-0 -mt-0">
          <img src={cause.image_url} alt={cause.title} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div
          className="h-24 rounded-xl flex items-center justify-center"
          style={{ background: cat.bg }}
        >
          <span style={{ color: cat.color, transform: "scale(2)" }}>{cat.icon}</span>
        </div>
      )}

      <div className="pad-3 space-y-3">
        {/* Category badge + featured */}
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="inline-flex items-center gap-1 text-fluid-xs px-2.5 py-0.5 rounded-full font-medium"
            style={{ background: cat.bg, color: cat.color }}
          >
            {cat.icon}
            {cause.category.replace("_", " ")}
          </span>
          {cause.featured && (
            <span
              className="text-fluid-xs px-2 py-0.5 rounded-full font-bold uppercase"
              style={{ background: "var(--ec-gold-100)", color: "var(--ec-gold-700)" }}
            >
              Featured
            </span>
          )}
          {cause.userContributed > 0 && (
            <span
              className="text-fluid-xs px-2 py-0.5 rounded-full font-medium"
              style={{ background: "var(--ec-mint-100)", color: "var(--ec-mint-700)" }}
            >
              You contributed {cause.userContributed.toLocaleString()} ECO
            </span>
          )}
        </div>

        {/* Title + desc */}
        <div>
          <h3 className="text-fluid-md font-bold">{cause.title}</h3>
          {cause.description && (
            <p className="text-fluid-sm t-muted mt-1 line-clamp-2">{cause.description}</p>
          )}
        </div>

        {/* Progress bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-fluid-xs">
            <span style={{ color: "var(--ec-mint-600)" }} className="font-bold">
              {cause.raised_eco.toLocaleString()} ECO raised
            </span>
            <span className="t-muted">{cause.goal_eco.toLocaleString()} goal</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--surface-subtle)" }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: pct + "%",
                background: "linear-gradient(90deg, var(--ec-mint-500), var(--ec-forest-600))",
              }}
            />
          </div>
          <div className="flex items-center justify-between text-fluid-xs t-muted">
            <span>{pct}% funded</span>
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              <span>{cause.supporter_count.toLocaleString()} supporters</span>
            </div>
          </div>
        </div>

        {/* CTA */}
        {cause.status === "active" && (
          <button
            type="button"
            onClick={() => {
              haptic.impact("medium");
              onContribute(cause);
            }}
            className="btn btn-alive w-full touch-target active-push"
          >
            Contribute ECO
          </button>
        )}
        {cause.status === "completed" && (
          <div
            className="text-center text-fluid-sm font-bold py-2 rounded-lg"
            style={{ background: "var(--ec-mint-100)", color: "var(--ec-mint-700)" }}
          >
            Goal reached
          </div>
        )}
      </div>
    </div>
  );
}
