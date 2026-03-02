"use client";

import { useRef, useEffect, useState } from "react";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import type { WeeklyImpactPoint } from "@/lib/actions/impact";

dayjs.extend(isoWeek);

type Props = {
  data: WeeklyImpactPoint[];
};

const PAD_LEFT = 40;
const PAD_RIGHT = 16;
const PAD_TOP = 20;
const PAD_BOTTOM = 36;
const CHART_HEIGHT = 100;

function formatWeekLabel(isoDate: string): string {
  const d = dayjs(isoDate);
  return `${d.format("MMM")} W${Math.ceil(d.date() / 7)}`;
}

export function ImpactTimelineChart({ data }: Props) {
  const [animated, setAnimated] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setAnimated(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const maxVal = Math.max(1, ...data.map((d) => d.actions));
  const weeksActive = data.filter((d) => d.actions > 0).length;
  const peakWeek = data.reduce(
    (best, w) => (w.actions > best.actions ? w : best),
    data[0] ?? { week: "", actions: 0 }
  );

  const pointCount = data.length;

  if (pointCount === 0) {
    return (
      <div
        className="card"
        style={{ padding: "var(--ec-space-4)", textAlign: "center" }}
      >
        <p style={{ color: "var(--text-muted)" }}>No activity data yet.</p>
      </div>
    );
  }

  // Minimum SVG width to ensure readability
  const totalWidth = Math.max(300, PAD_LEFT + pointCount * 28 + PAD_RIGHT);
  const svgHeight = CHART_HEIGHT + PAD_TOP + PAD_BOTTOM;

  function xPos(i: number) {
    const usable = totalWidth - PAD_LEFT - PAD_RIGHT;
    return PAD_LEFT + (i / (pointCount - 1)) * usable;
  }
  function yPos(v: number) {
    return PAD_TOP + CHART_HEIGHT - (v / maxVal) * CHART_HEIGHT;
  }

  // Build SVG path
  const linePath = data
    .map((p, i) => `${i === 0 ? "M" : "L"} ${xPos(i).toFixed(1)} ${yPos(p.actions).toFixed(1)}`)
    .join(" ");

  // Area path: close below the chart
  const areaPath =
    linePath +
    ` L ${xPos(pointCount - 1).toFixed(1)} ${(PAD_TOP + CHART_HEIGHT).toFixed(1)}` +
    ` L ${xPos(0).toFixed(1)} ${(PAD_TOP + CHART_HEIGHT).toFixed(1)} Z`;

  // Y-axis ticks
  const yTicks = [0, Math.round(maxVal / 2), maxVal].filter(
    (v, i, a) => a.indexOf(v) === i
  );

  return (
    <div className="card" style={{ padding: "var(--ec-space-4)" }}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
        <h3 className="text-fluid-sm font-semibold uppercase tracking-wide">
          Weekly Activity
        </h3>
        <div className="flex gap-4">
          <div className="flex flex-col items-end">
            <span
              className="text-fluid-lg font-bold tabular-nums"
              style={{ color: "var(--ec-mint-600)" }}
            >
              {weeksActive}
            </span>
            <span
              className="text-fluid-xs mono-all-caps"
              style={{ color: "var(--text-muted)" }}
            >
              weeks active
            </span>
          </div>
          {peakWeek.actions > 0 && (
            <div className="flex flex-col items-end">
              <span
                className="text-fluid-lg font-bold tabular-nums"
                style={{ color: "var(--ec-mint-600)" }}
              >
                {peakWeek.actions}
              </span>
              <span
                className="text-fluid-xs mono-all-caps"
                style={{ color: "var(--text-muted)" }}
              >
                peak week
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Scrollable SVG */}
      <div
        className="scroll-native overflow-x-auto"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${totalWidth} ${svgHeight}`}
          preserveAspectRatio="xMinYMid meet"
          style={{ width: "100%", minWidth: `${totalWidth}px`, height: `${svgHeight}px` }}
          aria-label="Weekly impact activity area chart"
          role="img"
        >
          <defs>
            <linearGradient id="mintAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--ec-mint-600)" stopOpacity="0.35" />
              <stop offset="100%" stopColor="var(--ec-mint-600)" stopOpacity="0.03" />
            </linearGradient>
            <clipPath id="chartClip">
              <rect
                x={PAD_LEFT}
                y={PAD_TOP}
                width={totalWidth - PAD_LEFT - PAD_RIGHT}
                height={CHART_HEIGHT}
              />
            </clipPath>
          </defs>

          {/* Y-axis ticks */}
          {yTicks.map((tick) => {
            const y = yPos(tick);
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
                  x={PAD_LEFT - 7}
                  y={y + 4}
                  textAnchor="end"
                  fontSize={9}
                  fill="var(--text-muted)"
                  fontFamily="var(--font-mono, monospace)"
                >
                  {tick}
                </text>
              </g>
            );
          })}

          {/* Area fill */}
          <path
            d={areaPath}
            fill="url(#mintAreaGrad)"
            clipPath="url(#chartClip)"
            style={{
              opacity: animated ? 1 : 0,
              transition: "opacity 0.6s ease",
            }}
          />

          {/* Line */}
          <path
            d={linePath}
            fill="none"
            stroke="var(--ec-mint-600)"
            strokeWidth={2.5}
            strokeLinejoin="round"
            strokeLinecap="round"
            clipPath="url(#chartClip)"
            style={{
              strokeDasharray: 2000,
              strokeDashoffset: animated ? 0 : 2000,
              transition: "stroke-dashoffset 1s ease",
            }}
          />

          {/* Data points */}
          {data.map((p, i) =>
            p.actions > 0 ? (
              <circle
                key={p.week}
                cx={xPos(i)}
                cy={yPos(p.actions)}
                r={3}
                fill="var(--ec-mint-600)"
                style={{
                  opacity: animated ? 1 : 0,
                  transition: `opacity 0.3s ease ${0.8 + i * 0.03}s`,
                }}
              />
            ) : null
          )}

          {/* X-axis labels — show first, middle, last */}
          {[0, Math.floor((pointCount - 1) / 2), pointCount - 1].map((i) => {
            const p = data[i];
            if (!p) return null;
            return (
              <text
                key={p.week}
                x={xPos(i)}
                y={PAD_TOP + CHART_HEIGHT + 18}
                textAnchor="middle"
                fontSize={8}
                fill="var(--text-muted)"
                fontFamily="var(--font-mono, monospace)"
              >
                {formatWeekLabel(p.week)}
              </text>
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
      </div>
    </div>
  );
}
