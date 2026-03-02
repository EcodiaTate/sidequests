"use client";

import { useEffect, useRef, useState } from "react";
import type { TopTheme } from "@/lib/actions/impact";

type Props = {
  themes: TopTheme[];
};

// Map sidequest_kind to a display label and CSS var color
const KIND_CONFIG: Record<string, { label: string; color: string }> = {
  core: { label: "Core Actions", color: "var(--ec-mint-600)" },
  eco_action: { label: "Eco Actions", color: "var(--ec-forest-600)" },
  daily: { label: "Daily Quests", color: "var(--ec-gold-500)" },
  weekly: { label: "Weekly Quests", color: "var(--ec-gold-600)" },
  tournament: { label: "Tournaments", color: "var(--ec-gold-700)" },
  team: { label: "Team Quests", color: "var(--ec-forest-500)" },
  chain: { label: "Chain Quests", color: "var(--ec-mint-700)" },
};

export function TopThemesBreakdown({ themes }: Props) {
  const [animated, setAnimated] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setAnimated(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const total = themes.reduce((sum, t) => sum + t.count, 0);

  if (themes.length === 0) {
    return (
      <div
        className="card"
        style={{ padding: "var(--ec-space-4)", textAlign: "center" }}
      >
        <p style={{ color: "var(--text-muted)" }}>No theme data yet.</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="card" style={{ padding: "var(--ec-space-4)" }}>
      <h3 className="text-fluid-sm font-semibold uppercase tracking-wide mb-4">
        Top Quest Themes
      </h3>
      <div className="flex flex-col gap-3">
        {themes.map((theme) => {
          const pct = total > 0 ? (theme.count / total) * 100 : 0;
          const cfg = KIND_CONFIG[theme.theme] ?? {
            label: theme.theme.replace(/_/g, " "),
            color: "var(--ec-mint-600)",
          };
          return (
            <div key={theme.theme} className="flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <span
                  className="text-fluid-sm"
                  style={{ color: "var(--text-base)", textTransform: "capitalize" }}
                >
                  {cfg.label}
                </span>
                <span
                  className="text-fluid-xs tabular-nums mono-all-caps"
                  style={{ color: "var(--text-muted)" }}
                >
                  {theme.count} &middot; {pct.toFixed(0)}%
                </span>
              </div>
              {/* Bar track */}
              <div
                style={{
                  height: 8,
                  borderRadius: 4,
                  background: "var(--surface-subtle)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: animated ? `${pct}%` : "0%",
                    background: cfg.color,
                    borderRadius: 4,
                    transition: "width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
