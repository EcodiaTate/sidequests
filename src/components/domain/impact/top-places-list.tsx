"use client";

import type { TopPlace } from "@/lib/actions/impact";
import { MapPin } from "lucide-react";

type Props = {
  places: TopPlace[];
};

const RANK_COLORS: string[] = [
  "var(--ec-gold-500)",
  "var(--ec-gold-400)",
  "var(--ec-gold-300)",
];

export function TopPlacesList({ places }: Props) {
  if (places.length === 0) {
    return (
      <div
        className="card"
        style={{ padding: "var(--ec-space-4)", textAlign: "center" }}
      >
        <p style={{ color: "var(--text-muted)" }}>No places visited yet.</p>
      </div>
    );
  }

  const maxCount = Math.max(1, ...places.map((p) => p.count));

  return (
    <div className="card" style={{ padding: "var(--ec-space-4)" }}>
      <h3 className="text-fluid-sm font-semibold uppercase tracking-wide mb-4">
        Top Eco Places
      </h3>
      <div className="flex flex-col gap-2">
        {places.map((place, idx) => {
          const pct = (place.count / maxCount) * 100;
          const rankColor = RANK_COLORS[idx] ?? "var(--ec-mint-400)";
          const isTop3 = idx < 3;

          return (
            <div
              key={place.place}
              className="flex items-center gap-3"
              style={{
                padding: "var(--ec-space-2) var(--ec-space-3)",
                borderRadius: "var(--ec-r-md)",
                background: isTop3 ? "var(--surface-subtle)" : "transparent",
              }}
            >
              {/* Rank number */}
              <span
                className="tabular-nums font-bold text-fluid-sm"
                style={{
                  minWidth: 20,
                  color: isTop3 ? rankColor : "var(--text-muted)",
                }}
              >
                {idx + 1}
              </span>

              {/* Icon */}
              <MapPin
                className="w-4 h-4 shrink-0"
                style={{ color: isTop3 ? rankColor : "var(--text-muted)" }}
              />

              {/* Place name + bar */}
              <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                <span
                  className="text-fluid-sm truncate"
                  style={{ color: "var(--text-base)" }}
                >
                  {place.place}
                </span>
                <div
                  style={{
                    height: 3,
                    borderRadius: 2,
                    background: "var(--surface-raised)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${pct}%`,
                      background: isTop3 ? rankColor : "var(--ec-mint-400)",
                      borderRadius: 2,
                    }}
                  />
                </div>
              </div>

              {/* Count */}
              <span
                className="tabular-nums text-fluid-xs mono-all-caps shrink-0"
                style={{ color: "var(--text-muted)" }}
              >
                {place.count}x
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
