import { CheckCircle2, Circle, Lock } from "lucide-react";
import type { Sidequest, Submission } from "@/types/domain";

type Props = {
  chain: Sidequest[];
  completedIds: Set<string>;
  currentId?: string;
};

export function ChainRail({ chain, completedIds, currentId }: Props) {
  if (chain.length <= 1) return null;

  return (
    <div className="flex flex-col gap-0">
      {chain.map((quest, idx) => {
        const isCompleted = completedIds.has(quest.id);
        const isCurrent = quest.id === currentId;
        const isLocked = idx > 0 && quest.chain_requires_prev && !completedIds.has(chain[idx - 1].id);

        return (
          <div key={quest.id} className="flex items-start gap-3">
            {/* Connector line + icon */}
            <div className="flex flex-col items-center">
              {isCompleted ? (
                <div style={{ color: "var(--ec-mint-500)" }}>
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              ) : isLocked ? (
                <div className="t-subtle">
                  <Lock className="w-5 h-5" />
                </div>
              ) : (
                <div style={{ color: isCurrent ? "var(--ec-mint-500)" : "var(--text-muted)" }}>
                  <Circle className="w-5 h-5" />
                </div>
              )}
              {idx < chain.length - 1 && (
                <div
                  className="w-0.5 h-6"
                  style={{
                    background: isCompleted
                      ? "var(--ec-mint-400)"
                      : "var(--border)",
                  }}
                />
              )}
            </div>

            {/* Label */}
            <div className="pb-4">
              <p className={`text-fluid-xs font-medium ${
                isCurrent ? "t-strong" : isLocked ? "t-subtle" : "t-base"
              }`}>
                {quest.title}
              </p>
              {isLocked && (
                <p className="text-fluid-xs t-subtle">Complete previous step first</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
