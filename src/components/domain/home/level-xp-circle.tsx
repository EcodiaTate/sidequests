"use client";

import { getXpProgress } from "@/lib/constants/levels";

type LevelXPCircleProps = {
  level: number;
  xpTotal: number;
};

const RADIUS = 38;
const STROKE = 5;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function LevelXPCircle({ level, xpTotal }: LevelXPCircleProps) {
  const progress = getXpProgress(level, xpTotal);
  const offset = CIRCUMFERENCE * (1 - progress);

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width={96}
        height={96}
        viewBox="0 0 96 96"
        className="-rotate-90"
      >
        {/* Track */}
        <circle
          cx={48}
          cy={48}
          r={RADIUS}
          fill="none"
          strokeWidth={STROKE}
          style={{ stroke: "var(--ec-forest-800)" }}
        />
        {/* Progress */}
        <circle
          cx={48}
          cy={48}
          r={RADIUS}
          fill="none"
          strokeWidth={STROKE}
          strokeLinecap="square"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          style={{
            stroke: "var(--ec-mint-400)",
            filter: "drop-shadow(0 0 4px rgba(127,208,105,0.5))",
            transition: "stroke-dashoffset 0.6s ease",
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="text-fluid-2xl font-heading leading-none"
          style={{
            color: "var(--ec-mint-400)",
            textShadow: "2px 2px 0 var(--ec-forest-900)",
          }}
        >
          {level}
        </span>
        <span
          className="stamp"
          style={{ color: "var(--ec-forest-500)", letterSpacing: "0.2em" }}
        >
          LVL
        </span>
      </div>
    </div>
  );
}
