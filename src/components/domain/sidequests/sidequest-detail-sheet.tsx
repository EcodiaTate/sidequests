"use client";

import { Zap, Clock, MapPin, CheckCircle2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Chip } from "@/components/ui/chip";
import { Button } from "@/components/ui/button";
import { SIDEQUEST_KINDS, DIFFICULTY_CONFIG, IMPACT_CONFIG } from "@/lib/constants/sidequests";
import type { Sidequest } from "@/types/domain";

type Props = {
  sidequest: Sidequest | null;
  open: boolean;
  onClose: () => void;
  onSubmit?: () => void;
  userCompletions?: number;
};

export function SidequestDetailSheet({
  sidequest,
  open,
  onClose,
  onSubmit,
  userCompletions = 0,
}: Props) {
  if (!sidequest) return null;

  const kindConfig = SIDEQUEST_KINDS[sidequest.kind];
  const diffConfig = sidequest.difficulty ? DIFFICULTY_CONFIG[sidequest.difficulty] : null;
  const impactConfig = sidequest.impact ? IMPACT_CONFIG[sidequest.impact] : null;
  const canSubmit = userCompletions < (sidequest.max_completions_per_user ?? 1);

  return (
    <Modal open={open} onClose={onClose} size="lg" title={sidequest.title}>
      <div className="flex flex-col gap-4">
        {sidequest.hero_image && (
          <div className="h-48 w-full overflow-hidden rounded-lg -mt-2">
            <img
              src={sidequest.hero_image}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        )}

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
            <div className="flex items-center gap-1.5 text-fluid-sm font-semibold"
              style={{ color: "var(--ec-mint-600)" }}>
              <Zap className="w-4 h-4" />
              {sidequest.reward_eco} ECO
            </div>
          )}
          {(sidequest.xp_reward ?? 0) > 0 && (
            <div className="text-fluid-sm font-semibold"
              style={{ color: "var(--ec-gold-500)" }}>
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
            <h4 className="text-fluid-xs font-semibold t-strong mb-2">Materials</h4>
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
            <h4 className="text-fluid-xs font-semibold t-strong mb-2">Did you know?</h4>
            <ul className="list-disc pl-4 space-y-1">
              {sidequest.facts.map((f, i) => (
                <li key={i} className="text-fluid-xs t-muted">{f}</li>
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

        {/* Completion status */}
        {userCompletions > 0 && (
          <div className="flex items-center gap-2 text-fluid-xs"
            style={{ color: "var(--submission-approved)" }}>
            <CheckCircle2 className="w-4 h-4" />
            Completed {userCompletions} time{userCompletions !== 1 ? "s" : ""}
          </div>
        )}

        {/* Submit CTA */}
        {canSubmit && onSubmit && (
          <Button variant="alive" fullWidth onClick={onSubmit}>
            Start this sidequest
          </Button>
        )}

        {!canSubmit && (
          <p className="text-fluid-xs t-muted text-center">
            You&apos;ve reached the maximum completions for this sidequest.
          </p>
        )}
      </div>
    </Modal>
  );
}
