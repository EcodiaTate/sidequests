"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getTournaments } from "@/lib/actions/tournaments";
import { TournamentCard } from "./tournament-card";
import { useHaptic } from "@/lib/hooks/use-haptics";
import type { TournamentWithStats } from "@/lib/actions/tournaments";
import type { TournamentStatus } from "@/types/domain";

type FilterTab = "all" | TournamentStatus;

const TABS: { key: FilterTab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "upcoming", label: "Upcoming" },
  { key: "active", label: "Active" },
  { key: "ended", label: "Ended" },
];

const EMPTY_STATE: Record<FilterTab, string> = {
  all: "No tournaments yet.",
  upcoming: "No upcoming tournaments.",
  active: "No active tournaments right now.",
  ended: "No ended tournaments.",
  cancelled: "No cancelled tournaments.",
};

type Props = {
  initialTournaments: TournamentWithStats[];
};

export function TournamentListClient({ initialTournaments }: Props) {
  const [tab, setTab] = useState<FilterTab>("all");
  const [tournaments, setTournaments] = useState<TournamentWithStats[]>(initialTournaments);
  const [isPending, startTransition] = useTransition();
  const haptics = useHaptic();

  function handleTab(next: FilterTab) {
    if (next === tab) return;
    haptics.impact("light");
    setTab(next);
    startTransition(async () => {
      const data = await getTournaments(next === "all" ? undefined : next);
      setTournaments(data);
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scroll-native">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => handleTab(t.key)}
            className="touch-target active-push flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-colors duration-150"
            style={{
              background: tab === t.key ? "var(--ec-mint-600)" : "var(--surface-2)",
              color: tab === t.key ? "white" : "var(--text-secondary)",
              border: "1px solid var(--border)",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tournament list */}
      <div
        className="flex flex-col gap-3"
        style={{ opacity: isPending ? 0.6 : 1, transition: "opacity 0.2s" }}
      >
        <AnimatePresence mode="popLayout">
          {tournaments.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="card border border-border pad-6 text-center"
            >
              <p className="stamp" style={{ color: "var(--text-muted)" }}>
                {EMPTY_STATE[tab]}
              </p>
            </motion.div>
          ) : (
            tournaments.map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, delay: i * 0.05 }}
              >
                <TournamentCard tournament={t} />
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
