"use client";

import { useState, useRef, useEffect } from "react";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import type { EcoTimelineWeek } from "@/lib/actions/wallet";

dayjs.extend(isoWeek);

type Props = {
  data: EcoTimelineWeek[];
};

const BAR_WIDTH = 12;
const BAR_GAP = 4;
const GROUP_GAP = 16;
const PAD_LEFT = 44;
const PAD_RIGHT = 16;
const PAD_TOP = 16;
const PAD_BOTTOM = 40;
const CHART_HEIGHT = 120;

function formatWeekLabel(isoDate: string): string {
  const d = dayjs(isoDate);
  const month = d.format("MMM");
  const weekOfMonth = Math.ceil(d.date() / 7);
  return `${month} W${weekOfMonth}`;
}

function ChartBars({
  data,
  maxValue,
  animated,
}: {
  data: EcoTimelineWeek[];
  maxValue: number;
  animated: boolean;
}) {
  const groupWidth = BAR_WIDTH * 2 + BAR_GAP;
  const totalWidth =
    PAD_LEFT +
    data.length * groupWidth +
    (data.length - 1) * GROUP_GAP +
    PAD_RIGHT;
  const svgHeight = CHART_HEIGHT + PAD_TOP + PAD_BOTTOM;

  function barH(value: number) {
    if (maxValue === 0) return 0;
    return (value / maxValue) * CHART_HEIGHT;
  }

  // Y-axis tick values
  const yTicks = [0, Math.round(maxValue / 2), maxValue].filter(
    (v, i, a) => a.indexOf(v) === i
  );

  return (
    <svg
      viewBox={`0 0 ${totalWidth} ${svgHeight}`}
      preserveAspectRatio="xMinYMid meet"
      style={{ width: "100%", minWidth: `${totalWidth}px`, height: `${svgHeight}px` }}
      aria-label="ECO earnings and spending over time"
      role="img"
    >
      {/* Y-axis ticks */}
      {yTicks.map((tick) => {
        const y = PAD_TOP + CHART_HEIGHT - barH(tick);
        return (
          <g key={tick}>
            <line
              x1={PAD_LEFT - 4}
              x2={totalWidth - PAD_RIGHT}
              y1={y}
              y2={y}
              stroke="var(--border)"
              strokeWidth={1}
              strokeDasharray="3 3"
            />
            <text
              x={PAD_LEFT - 8}
              y={y + 4}
              textAnchor="end"
              fontSize={9}
              fill="var(--text-muted)"
              fontFamily="var(--font-mono, monospace)"
            >
              {tick >= 1000 ? `${(tick / 1000).toFixed(1)}k` : tick}
            </text>
          </g>
        );
      })}

      {/* Bars + labels */}
      {data.map((week, i) => {
        const groupX = PAD_LEFT + i * (groupWidth + GROUP_GAP);
        const earnedH = barH(week.earned);
        const spentH = barH(week.spent);
        const label = formatWeekLabel(week.week);

        return (
          <g key={week.week}>
            {/* Earned bar */}
            <rect
              x={groupX}
              y={PAD_TOP + CHART_HEIGHT - earnedH}
              width={BAR_WIDTH}
              height={earnedH}
              rx={3}
              fill="var(--ec-mint-600)"
              style={{
                transformOrigin: `${groupX + BAR_WIDTH / 2}px ${PAD_TOP + CHART_HEIGHT}px`,
                transform: animated ? "scaleY(1)" : "scaleY(0)",
                transition: animated
                  ? `transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 0.05}s`
                  : "none",
              }}
            />

            {/* Spent bar */}
            <rect
              x={groupX + BAR_WIDTH + BAR_GAP}
              y={PAD_TOP + CHART_HEIGHT - spentH}
              width={BAR_WIDTH}
              height={spentH}
              rx={3}
              fill="var(--ec-gold-500)"
              style={{
                transformOrigin: `${groupX + BAR_WIDTH + BAR_GAP + BAR_WIDTH / 2}px ${PAD_TOP + CHART_HEIGHT}px`,
                transform: animated ? "scaleY(1)" : "scaleY(0)",
                transition: animated
                  ? `transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 0.05 + 0.05}s`
                  : "none",
              }}
            />

            {/* X-axis label */}
            <text
              x={groupX + groupWidth / 2}
              y={PAD_TOP + CHART_HEIGHT + 16}
              textAnchor="middle"
              fontSize={8}
              fill="var(--text-muted)"
              fontFamily="var(--font-mono, monospace)"
            >
              {label}
            </text>
          </g>
        );
      })}

      {/* Baseline */}
      <line
        x1={PAD_LEFT}
        x2={totalWidth - PAD_RIGHT}
        y1={PAD_TOP + CHART_HEIGHT}
        y2={PAD_TOP + CHART_HEIGHT}
        stroke="var(--border)"
        strokeWidth={1}
      />
    </svg>
  );
}

export function EcoTimelineChart({ data }: Props) {
  const [weeksShown, setWeeksShown] = useState<8 | 16>(8);
  const [animated, setAnimated] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Slice to the last N weeks
  const displayData = data.slice(-weeksShown);
  const maxValue = Math.max(
    1,
    ...displayData.map((w) => Math.max(w.earned, w.spent))
  );

  // Trigger animation once on mount
  useEffect(() => {
    const frame = requestAnimationFrame(() => setAnimated(true));
    return () => cancelAnimationFrame(frame);
  }, [weeksShown]);

  const handleToggle = (w: 8 | 16) => {
    setAnimated(false);
    setWeeksShown(w);
    requestAnimationFrame(() => setAnimated(true));
  };

  return (
    <div
      className="card"
      style={{ padding: "var(--ec-space-4)" }}
      aria-label="ECO timeline chart"
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <h3 className="text-fluid-sm font-semibold uppercase tracking-wide">
          ECO Timeline
        </h3>
        <div className="flex gap-1">
          {([8, 16] as const).map((w) => (
            <button
              key={w}
              type="button"
              onClick={() => handleToggle(w)}
              style={{
                padding: "2px 10px",
                borderRadius: "var(--ec-r-sm)",
                fontSize: "11px",
                fontFamily: "var(--font-mono, monospace)",
                border: "1px solid var(--border)",
                background:
                  weeksShown === w ? "var(--ec-mint-600)" : "var(--surface-base)",
                color:
                  weeksShown === w ? "var(--ec-white)" : "var(--text-muted)",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {w}w
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 mb-3">
        <span className="flex items-center gap-1.5 text-fluid-xs" style={{ color: "var(--text-muted)" }}>
          <span
            style={{
              display: "inline-block",
              width: 10,
              height: 10,
              borderRadius: 2,
              background: "var(--ec-mint-600)",
            }}
          />
          Earned
        </span>
        <span className="flex items-center gap-1.5 text-fluid-xs" style={{ color: "var(--text-muted)" }}>
          <span
            style={{
              display: "inline-block",
              width: 10,
              height: 10,
              borderRadius: 2,
              background: "var(--ec-gold-500)",
            }}
          />
          Spent
        </span>
      </div>

      {/* Scrollable chart area */}
      <div
        ref={containerRef}
        className="scroll-native overflow-x-auto"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <ChartBars data={displayData} maxValue={maxValue} animated={animated} />
      </div>
    </div>
  );
}
