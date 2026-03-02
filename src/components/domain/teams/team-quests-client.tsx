"use client";

import { useState, useTransition } from "react";
import { Zap, CheckCircle, Users, Trophy, ChevronRight, Upload } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/ui/empty-state";
import { Chip } from "@/components/ui/chip";
import { useHaptic } from "@/lib/hooks/use-haptics";
import { useToast } from "@/components/ui/toast";
import { submitTeamQuest } from "@/lib/actions/social";
import type { TeamQuestProgress } from "@/lib/actions/social";

type Props = {
  teamId: string;
  quests: TeamQuestProgress[];
};

function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div
      className="h-2 rounded-full overflow-hidden"
      style={{ background: "var(--surface-raised)" }}
    >
      <motion.div
        className="h-full rounded-full"
        style={{ background: "var(--ec-mint-500)" }}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      />
    </div>
  );
}

type SubmitModalProps = {
  quest: TeamQuestProgress["sidequest"];
  teamId: string;
  onClose: () => void;
  onSuccess: () => void;
};

function SubmitModal({ quest, teamId, onClose, onSuccess }: SubmitModalProps) {
  const haptics = useHaptic();
  const { toast } = useToast();
  const [caption, setCaption] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function handleSubmit() {
    if (!mediaUrl.trim()) {
      setError("Please provide a photo URL or Instagram link");
      return;
    }
    haptics.impact("medium");
    startTransition(async () => {
      const result = await submitTeamQuest(teamId, quest.id, mediaUrl.trim(), caption.trim());
      if ("error" in result) {
        setError(result.error);
        haptics.notify("error");
      } else {
        haptics.notify("success");
        toast("Submitted! Your team quest is under review.", "success");
        onSuccess();
      }
    });
  }

  return (
    <Modal open={true} onClose={onClose}>
      <div className="flex flex-col gap-4 p-1">
        <h2 className="text-fluid-lg font-bold uppercase">{quest.title}</h2>
        <p className="t-muted text-fluid-sm">
          Submit this quest on behalf of your team. Each member needs to submit individually.
        </p>

        <div className="flex flex-col gap-1">
          <label className="stamp">Photo URL or Instagram Link</label>
          <input
            className="input"
            placeholder="https://..."
            value={mediaUrl}
            onChange={(e) => setMediaUrl(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="stamp">Caption (optional)</label>
          <Textarea
            placeholder="What did you do?"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={3}
          />
        </div>

        {error && (
          <p className="text-fluid-sm" style={{ color: "var(--ec-danger)" }}>
            {error}
          </p>
        )}

        <div className="flex gap-2">
          <Button variant="tertiary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={isPending}
            className="flex-1 touch-target"
          >
            Submit Quest
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export function TeamQuestsClient({ teamId, quests }: Props) {
  const haptics = useHaptic();
  const [submittingQuest, setSubmittingQuest] = useState<TeamQuestProgress | null>(null);
  const [localQuests, setLocalQuests] = useState(quests);

  if (localQuests.length === 0) {
    return (
      <EmptyState
        icon={<Zap className="w-12 h-12" />}
        title="No team quests yet"
        description="Team quests will appear here when your admin creates them."
      />
    );
  }

  const completedCount = localQuests.filter((q) => q.isCompleted).length;

  return (
    <div className="flex flex-col gap-4">
      {/* Summary banner */}
      <div
        className="flex items-center gap-3 p-3 rounded-[var(--ec-r-lg)]"
        style={{
          background: "var(--surface-raised)",
          border: "var(--neo-border-thin) solid var(--border)",
        }}
      >
        <Trophy className="w-5 h-5 flex-shrink-0" style={{ color: "var(--ec-gold-500)" }} />
        <span className="text-fluid-sm t-strong">
          {completedCount} of {localQuests.length} team quests completed
        </span>
      </div>

      {/* Quest list */}
      <div className="flex flex-col gap-3">
        <AnimatePresence initial={false}>
          {localQuests.map((item, i) => (
            <motion.div
              key={item.sidequest.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Card
                padding="md"
                className="flex flex-col gap-3"
                style={{
                  border: `var(--neo-border-thin) solid ${item.isCompleted ? "var(--ec-mint-400)" : "var(--border)"}`,
                  opacity: item.isCompleted ? 0.75 : 1,
                }}
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div
                    className="w-10 h-10 rounded-[var(--ec-r-md)] flex items-center justify-center flex-shrink-0"
                    style={{
                      background: item.isCompleted
                        ? "var(--ec-mint-100)"
                        : "var(--surface-raised)",
                    }}
                  >
                    {item.isCompleted ? (
                      <CheckCircle className="w-5 h-5" style={{ color: "var(--ec-mint-600)" }} />
                    ) : (
                      <Zap className="w-5 h-5" style={{ color: "var(--ec-gold-500)" }} />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-fluid-sm t-strong truncate">
                        {item.sidequest.title}
                      </span>
                      {item.isCompleted && (
                        <Chip className="text-fluid-xs" style={{ background: "var(--ec-mint-100)", color: "var(--ec-mint-700)" }}>
                          Complete!
                        </Chip>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="mono-all-caps" style={{ color: "var(--ec-mint-600)", fontSize: "var(--text-xs)" }}>
                        +{item.sidequest.reward_eco} ECO
                      </span>
                      {item.sidequest.team_bonus_eco > 0 && (
                        <span className="mono-all-caps" style={{ color: "var(--ec-gold-500)", fontSize: "var(--text-xs)" }}>
                          +{item.sidequest.team_bonus_eco} team bonus
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Submit button */}
                  {!item.isCompleted && (
                    <Button
                      variant="secondary"
                      className="touch-target active-push flex-shrink-0"
                      onClick={() => {
                        haptics.impact("light");
                        setSubmittingQuest(item);
                      }}
                    >
                      <Upload className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                {/* Progress bar */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" style={{ color: "var(--text-muted)" }} />
                      <span className="text-fluid-xs t-muted">
                        {item.completions} / {item.sidequest.team_min_size ?? item.memberCount} members done
                      </span>
                    </div>
                    {item.totalEco > 0 && (
                      <span className="mono-all-caps" style={{ color: "var(--ec-mint-600)", fontSize: "var(--text-xs)" }}>
                        {item.totalEco} ECO earned
                      </span>
                    )}
                  </div>
                  <ProgressBar
                    value={item.completions}
                    max={item.sidequest.team_min_size ?? item.memberCount}
                  />
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Submit modal */}
      {submittingQuest && (
        <SubmitModal
          quest={submittingQuest.sidequest}
          teamId={teamId}
          onClose={() => setSubmittingQuest(null)}
          onSuccess={() => {
            setSubmittingQuest(null);
            // Optimistically increment completion count
            setLocalQuests((prev) =>
              prev.map((q) =>
                q.sidequest.id === submittingQuest.sidequest.id
                  ? { ...q, completions: q.completions + 1 }
                  : q
              )
            );
          }}
        />
      )}
    </div>
  );
}
