"use client";

import { useState, useTransition } from "react";
import { Trophy } from "lucide-react";
import { LeaderboardTable } from "./leaderboard-table";
import { Chip } from "@/components/ui/chip";
import { EmptyState } from "@/components/ui/empty-state";
import { useHaptic } from "@/lib/hooks/use-haptics";
import { getLeaderboard } from "@/lib/actions/gamification";
import { LEADERBOARD_PERIODS } from "@/lib/constants/gamification";

type LeaderboardData = Awaited<ReturnType<typeof getLeaderboard>>;
type Period = "weekly" | "monthly" | "total";

type Props = {
  initialData: LeaderboardData;
  currentUserId?: string;
};

export function LeaderboardClient({ initialData, currentUserId }: Props) {
  const haptic = useHaptic();
  const [period, setPeriod] = useState<Period>("weekly");
  const [data, setData] = useState(initialData);
  const [isPending, startTransition] = useTransition();

  const handlePeriodChange = (newPeriod: Period) => {
    setPeriod(newPeriod);
    haptic.impact("light");
    startTransition(async () => {
      const result = await getLeaderboard(newPeriod);
      setData(result);
    });
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Period tabs */}
      <div className="flex gap-2">
        {LEADERBOARD_PERIODS.map((p) => (
          <button
            key={p.key}
            type="button"
            onClick={() => handlePeriodChange(p.key)}
          >
            <Chip variant={period === p.key ? "primary" : "secondary"}>
              {p.label}
            </Chip>
          </button>
        ))}
      </div>

      {/* User's rank callout */}
      {data.userRank && data.userEntry && (
        <div
          className="card pad-3 flex items-center justify-between"
          style={{ background: "var(--ec-mint-50)", border: "var(--neo-border-mid) solid var(--border)", boxShadow: "var(--neo-shadow-md)" }}
        >
          <div>
            <p className="stamp">Your rank</p>
            <p className="text-fluid-xl font-bold t-strong">#{data.userRank}</p>
          </div>
          <div className="text-right">
            <p className="stamp">ECO earned</p>
            <p
              className="text-fluid-xl font-bold"
              style={{ color: "var(--ec-mint-600)" }}
            >
              {data.userEntry.eco ?? 0}
            </p>
          </div>
        </div>
      )}

      {/* Leaderboard */}
      {data.entries.length === 0 && !isPending ? (
        <EmptyState
          icon={<Trophy className="w-12 h-12" />}
          title="No rankings yet"
          description="Complete sidequests to earn ECO and climb the leaderboard!"
        />
      ) : (
        <LeaderboardTable
          entries={data.entries}
          currentUserId={currentUserId}
        />
      )}
    </div>
  );
}
