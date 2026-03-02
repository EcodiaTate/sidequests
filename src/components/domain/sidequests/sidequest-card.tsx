"use client";

import { Zap, Clock, ArrowRight } from "lucide-react";
import { SIDEQUEST_KINDS, DIFFICULTY_CONFIG } from "@/lib/constants/sidequests";
import type { Sidequest } from "@/types/domain";

type Props = {
  sidequest: Sidequest;
  onClick?: () => void;
};

export function SidequestCard({ sidequest, onClick }: Props) {
  const kindConfig = SIDEQUEST_KINDS[sidequest.kind];
  const diffConfig = sidequest.difficulty
    ? DIFFICULTY_CONFIG[sidequest.difficulty]
    : null;

  return (
    <button
      type="button"
      onClick={onClick}
      className="card card-interactive active-push touch-target text-left w-full overflow-hidden"
      style={{
        borderColor: diffConfig?.color
          ? diffConfig.color
          : "var(--ec-forest-800)",
        boxShadow: `4px 4px 0 ${diffConfig?.color ?? "var(--ec-forest-900)"}`,
      }}
    >
      {sidequest.hero_image && (
        <div className="h-36 w-full overflow-hidden relative">
          <img
            src={sidequest.hero_image}
            alt=""
            className="w-full h-full object-cover"
          />
          {/* Dark overlay at bottom for text legibility */}
          <div
            className="absolute bottom-0 inset-x-0 h-1/2"
            style={{
              background:
                "linear-gradient(to top, rgba(14,21,17,0.85), transparent)",
            }}
          />
        </div>
      )}

      <div className="pad-3 flex flex-col gap-2">
        {/* Kind + difficulty row */}
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="stamp"
            style={{
              background: `var(--quest-${sidequest.kind.replace("_", "-")}, var(--ec-mint-500))`,
              color: `var(--quest-${sidequest.kind.replace("_", "-")}-fg, var(--ec-forest-950))`,
              padding: "2px 8px",
              borderRadius: "2px",
              letterSpacing: "0.15em",
            }}
          >
            {kindConfig?.label ?? sidequest.kind}
          </span>
          {diffConfig && (
            <span
              className="stamp"
              style={{
                color: diffConfig.color,
                letterSpacing: "0.15em",
              }}
            >
              {diffConfig.label}
            </span>
          )}
        </div>

        {/* Title */}
        <h3
          className="text-fluid-sm font-heading uppercase leading-tight line-clamp-2"
          style={{ color: "var(--text-strong)", letterSpacing: "0.04em" }}
        >
          {sidequest.title}
        </h3>

        {sidequest.subtitle && (
          <p className="text-fluid-xs t-muted line-clamp-1">
            {sidequest.subtitle}
          </p>
        )}

        {/* Footer row */}
        <div className="flex items-center gap-3 mt-1">
          {(sidequest.reward_eco ?? 0) > 0 && (
            <span
              className="flex items-center gap-1 text-fluid-xs font-bold"
              style={{ color: "var(--ec-mint-600)" }}
            >
              <Zap className="w-3.5 h-3.5" fill="currentColor" />
              {sidequest.reward_eco} ECO
            </span>
          )}
          {(sidequest.xp_reward ?? 0) > 0 && (
            <span
              className="flex items-center gap-1 text-fluid-xs font-bold"
              style={{ color: "var(--ec-gold-600)" }}
            >
              +{sidequest.xp_reward} XP
            </span>
          )}
          {sidequest.time_estimate_min && (
            <span className="flex items-center gap-1 text-fluid-xs t-muted ml-auto">
              <Clock className="w-3 h-3" />
              {sidequest.time_estimate_min}m
            </span>
          )}
          {!sidequest.time_estimate_min && (
            <ArrowRight
              className="w-4 h-4 ml-auto t-muted"
            />
          )}
        </div>
      </div>
    </button>
  );
}
