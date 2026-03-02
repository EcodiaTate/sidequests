"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Users, CalendarDays, ArrowLeft, Medal } from "lucide-react";
import dayjs from "dayjs";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useHaptic } from "@/lib/hooks/use-haptics";
import { getTournament, joinTournament, leaveTournament } from "@/lib/actions/tournaments";
import type { TournamentDetail } from "@/lib/actions/tournaments";
import type { TournamentStatus } from "@/types/domain";

const STATUS_COLOR: Record<TournamentStatus, string> = {
  upcoming: "var(--ec-gold-500)",
  active: "var(--ec-mint-600)",
  ended: "var(--text-muted)",
  cancelled: "var(--ec-danger)",
};
const STATUS_LABEL: Record<TournamentStatus, string> = {
  upcoming: "Upcoming",
  active: "Live Now",
  ended: "Ended",
  cancelled: "Cancelled",
};
const RANK_COLORS = [
  "var(--rank-gold, #F5C842)",
  "var(--rank-silver, #B0B7C3)",
  "var(--rank-bronze, #CD7F32)",
];

function colorMix(color: string, pct: number, base?: string): string {
  const b = base ?? "var(--surface)";
  return "color-mix(in srgb, " + color + " " + String(pct) + "%, " + b + ")";
}

type Props = { tournament: TournamentDetail };

export function TournamentDetailClient({ tournament: initial }: Props) {
  const router = useRouter();
  const haptics = useHaptic();
  const [data, setData] = useState<TournamentDetail>(initial);
  const [isPending, startTransition] = useTransition();
  const [joinError, setJoinError] = useState<string | null>(null);
  const refreshIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const status = (data.status ?? "upcoming") as TournamentStatus;
  const isJoinable = status === "upcoming" || status === "active";
  const statusColor = STATUS_COLOR[status];

  const refresh = useCallback(() => {
    startTransition(async () => {
      const fresh = await getTournament(data.id);
      if (fresh) setData(fresh);
    });
  }, [data.id]);

  useEffect(() => {
    refreshIntervalRef.current = setInterval(refresh, 30_000);
    return () => { if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current); };
  }, [refresh]);

  async function handleJoin() {
    haptics.impact("medium");
    setJoinError(null);
    startTransition(async () => {
      const result = await joinTournament(data.id);
      if ("error" in result) { setJoinError(result.error); }
      else { haptics.notify("success"); refresh(); }
    });
  }

  async function handleLeave() {
    haptics.impact("medium");
    setJoinError(null);
    startTransition(async () => {
      const result = await leaveTournament(data.id);
      if ("error" in result) { setJoinError(result.error); }
      else { refresh(); }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <button
        className="flex items-center gap-2 text-sm touch-target active-push w-fit"
        style={{ color: "var(--text-muted)" }}
        onClick={() => { haptics.impact("light"); router.back(); }}
      >
        <ArrowLeft className="w-4 h-4" /> Tournaments
      </button>

      <Card padding="md" className="border border-border flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-fluid-xl font-bold t-strong leading-tight flex-1">{data.title}</h1>
          <span
            className="text-xs font-bold px-3 py-1 rounded-full flex-shrink-0 stamp"
            style={{ color: statusColor, background: colorMix(statusColor, 12, "transparent") }}
          >
            {STATUS_LABEL[status]}
          </span>
        </div>
        {data.description && (
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{data.description}</p>
        )}
        <div className="flex flex-wrap gap-4 text-sm" style={{ color: "var(--text-muted)" }}>
          <span className="flex items-center gap-1.5">
            <Users className="w-4 h-4" />
            {data.participants.length} participant{data.participants.length !== 1 ? "s" : ""}
          </span>
          {data.start_at && (
            <span className="flex items-center gap-1.5">
              <CalendarDays className="w-4 h-4" />
              {dayjs(data.start_at).format("D MMM YYYY")}
              {data.end_at && <>&nbsp;&mdash;&nbsp;{dayjs(data.end_at).format("D MMM YYYY")}</>}
            </span>
          )}
        </div>
        {status === "upcoming" && (
          <p className="text-sm font-medium" style={{ color: "var(--ec-gold-500)" }}>
            Tournament has not started yet. Join now to reserve your spot!
          </p>
        )}
        {status === "ended" && (
          <p className="text-sm stamp" style={{ color: "var(--text-muted)" }}>This tournament has ended.</p>
        )}
        {status === "cancelled" && (
          <p className="text-sm" style={{ color: "var(--ec-danger)" }}>This tournament was cancelled.</p>
        )}
        {isJoinable && (
          <div className="flex gap-2 mt-1">
            {data.isJoined ? (
              <Button variant="danger" size="sm" loading={isPending} onClick={handleLeave} className="active-push touch-target">
                Leave Tournament
              </Button>
            ) : (
              <Button variant="primary" size="sm" loading={isPending} onClick={handleJoin} className="active-push touch-target">
                Join Tournament
              </Button>
            )}
          </div>
        )}
        {joinError && (
          <p className="text-xs" style={{ color: "var(--ec-danger)" }}>{joinError}</p>
        )}
      </Card>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold t-strong flex items-center gap-2">
            <Medal className="w-4 h-4" style={{ color: "var(--ec-gold-500)" }} />
            Leaderboard
          </h2>
          {isPending && (
            <span className="text-xs stamp" style={{ color: "var(--text-muted)" }}>Refreshing...</span>
          )}
        </div>
        {data.participants.length === 0 ? (
          <Card padding="md" className="border border-border text-center">
            <p className="stamp text-sm" style={{ color: "var(--text-muted)" }}>
              No participants yet. Be the first to join!
            </p>
          </Card>
        ) : (
          <div className="flex flex-col gap-2">
            {data.participants.map((p, idx) => {
              const rankColor = idx < 3 ? RANK_COLORS[idx] : "var(--text-muted)";
              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: idx * 0.04 }}
                >
                  <Card
                    padding="sm"
                    className="border border-border flex items-center gap-3"
                    style={{ background: idx < 3 ? colorMix(rankColor, 6) : undefined }}
                  >
                    <span
                      className="w-7 text-center font-bold text-sm flex-shrink-0"
                      style={{ color: rankColor }}
                    >
                      {idx + 1}
                    </span>
                    <Avatar
                      src={p.profile?.avatar_url}
                      alt={p.profile?.display_name ?? "Player"}
                      size="sm"
                    />
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="font-semibold text-sm t-strong truncate">
                        {p.profile?.display_name ?? "Anonymous"}
                      </span>
                      {p.profile?.level != null && (
                        <span className="text-xs stamp" style={{ color: "var(--text-muted)" }}>
                          Level {p.profile.level}
                        </span>
                      )}
                    </div>
                    <span
                      className="font-bold text-sm flex-shrink-0"
                      style={{ color: idx < 3 ? rankColor : "var(--text-secondary)" }}
                    >
                      {(p.score ?? 0).toLocaleString()} pts
                    </span>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}