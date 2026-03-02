import { Flame } from "lucide-react";

type StreakPillProps = {
  streakDays: number;
};

export function StreakPill({ streakDays }: StreakPillProps) {
  if (streakDays <= 0) {
    return (
      <div className="flex items-center gap-1.5 text-fluid-sm" style={{ color: "var(--ec-forest-500)" }}>
        <Flame className="w-4 h-4" />
        <span>Start one!</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <Flame
        className="w-5 h-5"
        fill="var(--ec-gold-400)"
        style={{ color: "var(--ec-gold-400)" }}
      />
      <span
        className="text-fluid-xl font-heading leading-none tabular-nums"
        style={{
          color: "var(--ec-gold-400)",
          textShadow: "2px 2px 0 var(--ec-forest-900)",
        }}
      >
        {streakDays}
      </span>
      <span className="text-fluid-xs" style={{ color: "var(--ec-forest-500)" }}>
        day{streakDays !== 1 ? "s" : ""}
      </span>
    </div>
  );
}
