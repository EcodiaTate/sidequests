"use client";

import { useRouter } from "next/navigation";
import { Users, Clock, CalendarDays } from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import duration from "dayjs/plugin/duration";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useHaptic } from "@/lib/hooks/use-haptics";
import type { TournamentWithStats } from "@/lib/actions/tournaments";
import type { TournamentStatus } from "@/types/domain";

dayjs.extend(relativeTime);
dayjs.extend(duration);

type StatusConfig = {
  label: string;
  color: string;
  bg: string;
};

const STATUS_CONFIG: Record<TournamentStatus, StatusConfig> = {
  upcoming: {
    label: "Upcoming",
    color: "var(--ec-gold-500)",
    bg: "color-mix(in srgb, var(--ec-gold-500) 12%, transparent)",
  },
  active: {
    label: "Active",
    color: "var(--ec-mint-600)",
    bg: "color-mix(in srgb, var(--ec-mint-600) 12%, transparent)",
  },
  ended: {
    label: "Ended",
    color: "var(--text-muted)",
    bg: "color-mix(in srgb, var(--text-muted) 10%, transparent)",
  },
  cancelled: {
    label: "Cancelled",
    color: "var(--ec-danger)",
    bg: "color-mix(in srgb, var(--ec-danger) 12%, transparent)",
  },
};

function StatusBadge({ status }: { status: TournamentStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className="text-xs font-semibold px-2 py-0.5 rounded-full stamp"
      style={{ color: cfg.color, background: cfg.bg }}
    >
      {cfg.label}
    </span>
  );
}

function Countdown({ targetDate }: { targetDate: string }) {
  const diff = dayjs(targetDate).diff(dayjs());
  if (diff <= 0) return null;

  const d = dayjs.duration(diff);
  const days = Math.floor(d.asDays());
  const hours = d.hours();
  const mins = d.minutes();

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (days === 0) parts.push(`${mins}m`);

  return (
    <span className="flex items-center gap-1 text-xs" style={{ color: "var(--ec-gold-500)" }}>
      <Clock className="w-3 h-3" />
      Starts in {parts.join(" ")}
    </span>
  );
}

type Props = {
  tournament: TournamentWithStats;
};

export function TournamentCard({ tournament }: Props) {
  const router = useRouter();
  const haptics = useHaptic();
  const status = (tournament.status ?? "upcoming") as TournamentStatus;
  const isJoinable = status === "upcoming" || status === "active";

  function handleClick() {
    haptics.impact("light");
    router.push(`/tournaments/${tournament.id}`);
  }

  return (
    <Card
      interactive
      padding="md"
      className="card-interactive border border-border flex flex-col gap-3 touch-target active-push cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <h3 className="font-semibold t-strong leading-snug">{tournament.title}</h3>
          {tournament.description && (
            <p
              className="text-sm line-clamp-2"
              style={{ color: "var(--text-secondary)" }}
            >
              {tournament.description}
            </p>
          )}
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="flex flex-wrap gap-3 text-xs" style={{ color: "var(--text-muted)" }}>
        <span className="flex items-center gap-1">
          <Users className="w-3 h-3" />
          {tournament.participantCount} participants
        </span>

        {tournament.start_at && (
          <span className="flex items-center gap-1">
            <CalendarDays className="w-3 h-3" />
            {dayjs(tournament.start_at).format("D MMM YYYY")}
            {tournament.end_at && (
              <> - {dayjs(tournament.end_at).format("D MMM YYYY")}</>
            )}
          </span>
        )}
      </div>

      {status === "upcoming" && tournament.start_at && (
        <Countdown targetDate={tournament.start_at} />
      )}

      <div className="flex items-center justify-between gap-2 mt-1">
        <Button
          variant="tertiary"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
        >
          View Details
        </Button>

        {isJoinable && (
          <span
            className="text-xs font-semibold stamp"
            style={{
              color: tournament.isJoined ? "var(--ec-mint-600)" : "var(--text-muted)",
            }}
          >
            {tournament.isJoined ? "Joined" : "Open"}
          </span>
        )}
      </div>
    </Card>
  );
}
