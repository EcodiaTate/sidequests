"use client";

import { useState } from "react";
import { Zap } from "lucide-react";
import { CauseCard } from "./cause-card";
import { ContributeModal } from "./contribute-modal";
import { EmptyState } from "@/components/ui/empty-state";
import { Chip } from "@/components/ui/chip";
import { useHaptic } from "@/lib/hooks/use-haptics";
import type { CauseWithProgress } from "@/lib/actions/causes";

type Category = "all" | "reforestation" | "ocean" | "clean_energy" | "wildlife" | "general";

const FILTERS: { id: Category; label: string }[] = [
  { id: "all", label: "All" },
  { id: "reforestation", label: "Reforestation" },
  { id: "ocean", label: "Ocean" },
  { id: "clean_energy", label: "Energy" },
  { id: "wildlife", label: "Wildlife" },
  { id: "general", label: "General" },
];

type Props = {
  initialCauses: CauseWithProgress[];
  ecoBalance: number;
};

export function CausesClient({ initialCauses, ecoBalance }: Props) {
  const haptic = useHaptic();
  const [causes, setCauses] = useState(initialCauses);
  const [filter, setFilter] = useState<Category>("all");
  const [activeCause, setActiveCause] = useState<CauseWithProgress | null>(null);

  const totalContributed = causes.reduce((s, c) => s + c.userContributed, 0);

  const filtered = filter === "all"
    ? causes
    : causes.filter((c) => c.category === filter);

  function handleSuccess() {
    setActiveCause(null);
    // Refresh page to get updated balances
    window.location.reload();
  }

  return (
    <div className="space-y-4">
      {/* My contributions summary */}
      {totalContributed > 0 && (
        <div
          className="card pad-3 border border-border flex items-center gap-3"
          style={{ boxShadow: "var(--neo-shadow-sm)", background: "var(--ec-mint-50)" }}
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
            style={{ background: "var(--ec-mint-500)" }}
          >
            <Zap className="w-5 h-5" style={{ color: "var(--ec-forest-900)" }} />
          </div>
          <div>
            <p className="text-fluid-sm font-bold" style={{ color: "var(--ec-forest-800)" }}>
              You have contributed {totalContributed.toLocaleString()} ECO
            </p>
            <p className="text-fluid-xs" style={{ color: "var(--ec-forest-600)" }}>
              to environmental causes
            </p>
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto scroll-native pb-1">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => {
              haptic.impact("light");
              setFilter(f.id);
            }}
          >
            <Chip variant={filter === f.id ? "primary" : "secondary"}>
              {f.label}
            </Chip>
          </button>
        ))}
      </div>

      {/* Cause grid */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<Zap className="w-12 h-12" />}
          title="No causes in this category"
          description="Check back soon for new causes to support"
        />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map((cause) => (
            <CauseCard
              key={cause.id}
              cause={cause}
              onContribute={setActiveCause}
            />
          ))}
        </div>
      )}

      {/* Contribute modal */}
      <ContributeModal
        cause={activeCause}
        ecoBalance={ecoBalance}
        onClose={() => setActiveCause(null)}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
