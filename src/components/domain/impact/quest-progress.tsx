import { CheckCircle2, Circle } from "lucide-react";
import { QUEST_CADENCE_CONFIG } from "@/lib/constants/gamification";
import type { QuestCadence } from "@/types/domain";

type QuestItem = {
  id: string;
  name: string;
  description: string | null;
  cadence: string;
  limit_per_window: number;
  reward_eco: number;
  progress: number;
  target: number;
  completed: boolean;
};

type Props = {
  quests: QuestItem[];
};

export function QuestProgress({ quests }: Props) {
  if (quests.length === 0) {
    return (
      <p className="text-fluid-xs t-muted text-center py-4">
        No active quests right now.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {quests.map((quest) => {
        const cadenceConfig = QUEST_CADENCE_CONFIG[quest.cadence as QuestCadence];
        const pct = Math.min((quest.progress / quest.target) * 100, 100);

        return (
          <div key={quest.id} className="card pad-3 flex flex-col gap-2" style={{ border: "var(--neo-border-thin) solid var(--border)" }}>
            <div className="flex items-start gap-2">
              {quest.completed ? (
                <CheckCircle2
                  className="w-5 h-5 shrink-0 mt-0.5"
                  style={{ color: "var(--ec-mint-500)" }}
                />
              ) : (
                <Circle className="w-5 h-5 shrink-0 mt-0.5 t-muted" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-fluid-sm font-semibold t-strong">{quest.name}</p>
                {quest.description && (
                  <p className="text-fluid-xs t-muted">{quest.description}</p>
                )}
                <p className="text-fluid-xs t-subtle">
                  {cadenceConfig?.label ?? quest.cadence} · +{quest.reward_eco} ECO
                </p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="flex items-center gap-2">
              <div
                className="flex-1 h-2 rounded-full overflow-hidden"
                style={{ background: "var(--surface-2)" }}
              >
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${pct}%`,
                    background: quest.completed
                      ? "var(--ec-mint-500)"
                      : "var(--ec-mint-400)",
                  }}
                />
              </div>
              <span className="text-fluid-xs t-muted shrink-0">
                {quest.progress}/{quest.target}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
