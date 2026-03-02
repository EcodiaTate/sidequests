"use client";

import { Search } from "lucide-react";
import { Chip } from "@/components/ui/chip";
import { SIDEQUEST_KINDS } from "@/lib/constants/sidequests";
import { useHaptic } from "@/lib/hooks/use-haptics";
import type { SidequestKind } from "@/types/domain";

type Props = {
  selectedKind: SidequestKind | null;
  onKindChange: (kind: SidequestKind | null) => void;
  search: string;
  onSearchChange: (search: string) => void;
};

const kinds = Object.entries(SIDEQUEST_KINDS) as [SidequestKind, { label: string }][];

export function SidequestFilters({
  selectedKind,
  onKindChange,
  search,
  onSearchChange,
}: Props) {
  const haptic = useHaptic();

  return (
    <div className="flex flex-col gap-3">
      {/* Search */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 t-muted">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search sidequests..."
          className="input pl-10"
        />
      </div>

      {/* Kind filter chips */}
      <div className="flex items-center gap-2 overflow-x-auto scroll-native pb-1">
        <button
          type="button"
          onClick={() => {
            onKindChange(null);
            haptic.impact("light");
          }}
          className="shrink-0"
        >
          <Chip variant={selectedKind === null ? "primary" : "secondary"}>
            All
          </Chip>
        </button>
        {kinds.map(([key, config]) => (
          <button
            key={key}
            type="button"
            onClick={() => {
              onKindChange(selectedKind === key ? null : key);
              haptic.impact("light");
            }}
            className="shrink-0"
          >
            <Chip variant={selectedKind === key ? "primary" : "secondary"}>
              {config.label}
            </Chip>
          </button>
        ))}
      </div>
    </div>
  );
}
