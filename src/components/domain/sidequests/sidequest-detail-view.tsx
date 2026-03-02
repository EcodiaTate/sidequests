"use client";

import { useState } from "react";
import { ArrowLeft, Zap, Clock, MapPin, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Chip } from "@/components/ui/chip";
import { Button } from "@/components/ui/button";
import { ChainRail } from "./chain-rail";
import { SubmissionForm } from "./submission-form";
import { SubmissionCard } from "./submission-card";
import { RewardHatchModal } from "./reward-hatch-modal";
import { SIDEQUEST_KINDS, DIFFICULTY_CONFIG, IMPACT_CONFIG } from "@/lib/constants/sidequests";
import type { Sidequest, Submission } from "@/types/domain";

type Props = {
  sidequest: Sidequest;
  chain: Sidequest[];
  completedIds: Set<string>;
  submissions: Submission[];
};

export function SidequestDetailView({
  sidequest,
  chain,
  completedIds,
  submissions,
}: Props) {
  const [showForm, setShowForm] = useState(false);
  const [hatchSubmissionId, setHatchSubmissionId] = useState<string | null>(null);

  const kindConfig = SIDEQUEST_KINDS[sidequest.kind];
  const diffConfig = sidequest.difficulty ? DIFFICULTY_CONFIG[sidequest.difficulty] : null;
  const impactConfig = sidequest.impact ? IMPACT_CONFIG[sidequest.impact] : null;
  const userCompletions = submissions.filter((s) => s.state === "approved").length;
  const canSubmit = userCompletions < (sidequest.max_completions_per_user ?? 1);

  const unhatchedSubmission = submissions.find(
    (s) => s.state === "approved" && !s.reward_hatched
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Back link */}
      <Link
        href="/quests"
        className="flex items-center gap-1.5 text-fluid-sm t-muted active-push w-fit"
      >
        <ArrowLeft className="w-4 h-4" />
        All sidequests
      </Link>

      {/* Hero */}
      {sidequest.hero_image && (
        <div
          className="h-52 w-full overflow-hidden rounded-2xl"
          style={{
            border: "var(--neo-border-thin) solid var(--border)",
            boxShadow: "var(--neo-shadow-sm)",
          }}
        >
          <img
            src={sidequest.hero_image}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Title */}
      <h1 className="text-fluid-xl uppercase">{sidequest.title}</h1>

      {/* Pills */}
      <div className="flex items-center gap-2 flex-wrap">
        <Chip variant="primary">{kindConfig.label}</Chip>
        {diffConfig && (
          <Chip variant="secondary">
            <span style={{ color: diffConfig.color }}>{diffConfig.label}</span>
          </Chip>
        )}
        {impactConfig && (
          <Chip variant="secondary">
            <span style={{ color: impactConfig.color }}>{impactConfig.label}</span>
          </Chip>
        )}
      </div>

      {/* Rewards */}
      <div className="flex items-center gap-4">
        {(sidequest.reward_eco ?? 0) > 0 && (
          <div
            className="flex items-center gap-1.5 text-fluid-sm font-semibold"
            style={{ color: "var(--ec-mint-600)" }}
          >
            <Zap className="w-4 h-4" />
            {sidequest.reward_eco} ECO
          </div>
        )}
        {(sidequest.xp_reward ?? 0) > 0 && (
          <div
            className="text-fluid-sm font-semibold"
            style={{ color: "var(--ec-gold-500)" }}
          >
            +{sidequest.xp_reward} XP
          </div>
        )}
        {sidequest.time_estimate_min && (
          <div className="flex items-center gap-1 text-fluid-sm t-muted">
            <Clock className="w-4 h-4" />
            ~{sidequest.time_estimate_min} min
          </div>
        )}
      </div>

      {/* Description */}
      {sidequest.description_md && (
        <div className="text-fluid-sm t-base leading-relaxed whitespace-pre-wrap">
          {sidequest.description_md}
        </div>
      )}

      {/* Materials */}
      {sidequest.materials && sidequest.materials.length > 0 && (
        <div>
          <h2 className="stamp mb-2">Materials</h2>
          <div className="flex flex-wrap gap-1.5">
            {sidequest.materials.map((m) => (
              <Chip key={m} variant="secondary">{m}</Chip>
            ))}
          </div>
        </div>
      )}

      {/* Facts */}
      {sidequest.facts && sidequest.facts.length > 0 && (
        <div>
          <h2 className="stamp mb-2">Did you know?</h2>
          <ul className="list-disc pl-4 space-y-1">
            {sidequest.facts.map((f, i) => (
              <li key={i} className="text-fluid-sm t-muted">{f}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Location */}
      {sidequest.geo_locality && (
        <div className="flex items-center gap-1.5 text-fluid-xs t-muted">
          <MapPin className="w-3.5 h-3.5" />
          {sidequest.geo_locality}
        </div>
      )}

      {/* Chain progress */}
      {chain.length > 1 && (
        <div>
          <h2 className="stamp mb-2">Quest chain</h2>
          <ChainRail
            chain={chain}
            completedIds={completedIds}
            currentId={sidequest.id}
          />
        </div>
      )}

      {/* Completion status */}
      {userCompletions > 0 && (
        <div
          className="flex items-center gap-2 text-fluid-sm"
          style={{ color: "var(--submission-approved)" }}
        >
          <CheckCircle2 className="w-4 h-4" />
          Completed {userCompletions} time{userCompletions !== 1 ? "s" : ""}
        </div>
      )}

      {/* Unhatched reward */}
      {unhatchedSubmission && (
        <Button
          variant="alive"
          fullWidth
          onClick={() => setHatchSubmissionId(unhatchedSubmission.id)}
        >
          Hatch your reward!
        </Button>
      )}

      {/* Submit CTA or form */}
      {canSubmit && !showForm && !unhatchedSubmission && (
        <Button variant="alive" fullWidth onClick={() => setShowForm(true)}>
          Submit proof
        </Button>
      )}

      {showForm && (
        <div
          className="card pad-4"
          style={{
            border: "var(--neo-border-thin) solid var(--ec-mint-200)",
            boxShadow: "var(--neo-shadow-sm)",
          }}
        >
          <SubmissionForm
            sidequest={sidequest}
            onSuccess={() => setShowForm(false)}
          />
        </div>
      )}

      {!canSubmit && !unhatchedSubmission && (
        <p className="text-fluid-xs t-muted text-center">
          You&apos;ve reached the maximum completions for this sidequest.
        </p>
      )}

      {/* Past submissions */}
      {submissions.length > 0 && (
        <div>
          <h2 className="stamp mb-2">
            Your submissions
          </h2>
          <div className="flex flex-col gap-2">
            {submissions.map((s) => (
              <SubmissionCard key={s.id} submission={s} />
            ))}
          </div>
        </div>
      )}

      {/* Reward hatch modal */}
      {hatchSubmissionId && (
        <RewardHatchModal
          submissionId={hatchSubmissionId}
          open={!!hatchSubmissionId}
          onClose={() => setHatchSubmissionId(null)}
        />
      )}
    </div>
  );
}
