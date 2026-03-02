"use client";

import { useState, useCallback, useTransition } from "react";
import { SidequestCard } from "./sidequest-card";
import { SidequestFilters } from "./sidequest-filters";
import { SidequestDetailSheet } from "./sidequest-detail-sheet";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Compass } from "lucide-react";
import { getSidequests } from "@/lib/actions/sidequests";
import type { Sidequest, SidequestKind } from "@/types/domain";

type Props = {
  initialQuests: Sidequest[];
  initialCount: number;
};

export function QuestListClient({ initialQuests, initialCount }: Props) {
  const [quests, setQuests] = useState(initialQuests);
  const [totalCount, setTotalCount] = useState(initialCount);
  const [selectedKind, setSelectedKind] = useState<SidequestKind | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedQuest, setSelectedQuest] = useState<Sidequest | null>(null);
  const [isPending, startTransition] = useTransition();

  const fetchQuests = useCallback(
    (newPage: number, kind: SidequestKind | null, searchTerm: string) => {
      startTransition(async () => {
        const result = await getSidequests({
          kind: kind || undefined,
          search: searchTerm || undefined,
          page: newPage,
        });
        setQuests(result.data);
        setTotalCount(result.count);
        setPage(newPage);
      });
    },
    []
  );

  const handleKindChange = (kind: SidequestKind | null) => {
    setSelectedKind(kind);
    fetchQuests(1, kind, search);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    // Debounce by not auto-fetching — user presses enter or waits
    if (value === "") {
      fetchQuests(1, selectedKind, "");
    }
  };

  const handleSearchSubmit = () => {
    fetchQuests(1, selectedKind, search);
  };

  const hasMore = quests.length < totalCount;

  return (
    <div className="flex flex-col gap-4">
      <div onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit()}>
        <SidequestFilters
          selectedKind={selectedKind}
          onKindChange={handleKindChange}
          search={search}
          onSearchChange={handleSearchChange}
        />
      </div>

      {quests.length === 0 && !isPending ? (
        <EmptyState
          icon={<Compass className="w-12 h-12" />}
          title="No sidequests found"
          description={
            search || selectedKind
              ? "Try changing your filters."
              : "Check back soon for new sidequests!"
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {quests.map((q) => (
            <SidequestCard
              key={q.id}
              sidequest={q}
              onClick={() => setSelectedQuest(q)}
            />
          ))}
        </div>
      )}

      {hasMore && (
        <div className="flex justify-center">
          <Button
            variant="tertiary"
            onClick={() => fetchQuests(page + 1, selectedKind, search)}
            loading={isPending}
          >
            Load more
          </Button>
        </div>
      )}

      <SidequestDetailSheet
        sidequest={selectedQuest}
        open={!!selectedQuest}
        onClose={() => setSelectedQuest(null)}
      />
    </div>
  );
}
