"use client";

import { useState } from "react";
import { ArrowLeft, Users, Zap, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";
import { ContributeModal } from "./contribute-modal";
import { Button } from "@/components/ui/button";
import { useHaptic } from "@/lib/hooks/use-haptics";
import type { CauseWithProgress, MyContribution } from "@/lib/actions/causes";

type Props = {
  cause: CauseWithProgress;
  ecoBalance: number;
  myContributions: MyContribution[];
};

export function CauseDetailClient({ cause, ecoBalance, myContributions }: Props) {
  const haptic = useHaptic();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="space-y-4">
      <button
        onClick={() => { haptic.impact("light"); router.back(); }}
        className="flex items-center gap-1 text-fluid-sm t-muted active-push touch-target"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Causes
      </button>

      {cause.image_url && (
        <div className="rounded-xl overflow-hidden h-48">
          <img src={cause.image_url} alt={cause.title} className="w-full h-full object-cover" />
        </div>
      )}

      <div>
        <h1 className="text-fluid-xl uppercase">{cause.title}</h1>
        <p className="t-muted text-fluid-sm mt-2">{cause.description}</p>
      </div>

      {/* Progress */}
      <div className="card pad-4 border border-border space-y-3" style={{ boxShadow: "var(--neo-shadow-sm)" }}>
        <div className="flex items-center justify-between text-fluid-sm">
          <span className="font-bold" style={{ color: "var(--ec-mint-600)" }}>
            {cause.raised_eco.toLocaleString()} ECO
          </span>
          <span className="t-muted">of {cause.goal_eco.toLocaleString()} goal</span>
        </div>
        <div className="h-3 rounded-full overflow-hidden" style={{ background: "var(--surface-subtle)" }}>
          <div
            className="h-full rounded-full"
            style={{
              width: cause.pct + "%",
              background: "linear-gradient(90deg, var(--ec-mint-500), var(--ec-forest-600))",
            }}
          />
        </div>
        <div className="flex items-center justify-between text-fluid-xs t-muted">
          <span>{cause.pct}% funded</span>
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {cause.supporter_count.toLocaleString()} supporters
          </div>
        </div>
      </div>

      {/* My contributions */}
      {myContributions.length > 0 && (
        <div className="card pad-3 border border-border" style={{ background: "var(--ec-mint-50)" }}>
          <p className="text-fluid-xs stamp mb-2">Your contributions</p>
          <div className="space-y-1">
            {myContributions.map((c) => (
              <div key={c.created_at} className="flex items-center justify-between text-fluid-xs">
                <span className="t-muted">{new Date(c.created_at).toLocaleDateString("en-AU")}</span>
                <span className="font-bold" style={{ color: "var(--ec-mint-700)" }}>
                  +{c.amount.toLocaleString()} ECO
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      {cause.status === "active" && (
        <Button variant="alive" fullWidth icon={<Zap className="w-4 h-4" />} onClick={() => setShowModal(true)}>
          Contribute ECO
        </Button>
      )}

      {cause.ends_at && (
        <p className="text-fluid-xs t-muted text-center flex items-center justify-center gap-1">
          <Calendar className="w-3 h-3" />
          Campaign ends {new Date(cause.ends_at).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })}
        </p>
      )}

      <ContributeModal
        cause={showModal ? cause : null}
        ecoBalance={ecoBalance}
        onClose={() => setShowModal(false)}
        onSuccess={() => window.location.reload()}
      />
    </div>
  );
}
