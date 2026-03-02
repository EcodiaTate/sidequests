"use client";

import { Chip } from "@/components/ui/chip";
import { useHaptic } from "@/lib/hooks/use-haptics";

type Direction = "all" | "earned" | "spent";

type Props = {
  direction: Direction;
  onDirectionChange: (d: Direction) => void;
};

const DIRECTIONS: { key: Direction; label: string }[] = [
  { key: "all", label: "All" },
  { key: "earned", label: "Earned" },
  { key: "spent", label: "Spent" },
];

export function TransactionFilters({ direction, onDirectionChange }: Props) {
  const haptic = useHaptic();

  return (
    <div className="flex gap-2">
      {DIRECTIONS.map((d) => (
        <button
          key={d.key}
          type="button"
          onClick={() => {
            onDirectionChange(d.key);
            haptic.impact("light");
          }}
        >
          <Chip variant={direction === d.key ? "primary" : "secondary"}>
            {d.label}
          </Chip>
        </button>
      ))}
    </div>
  );
}
