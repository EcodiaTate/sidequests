"use client";

import { MapPin, Star, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PledgeBadge } from "./pledge-badge";
import { BUSINESS_TYPE_CONFIG } from "@/lib/constants/eco-local";
import type { BusinessWithMetrics } from "@/lib/actions/eco-local";

type Props = {
  business: BusinessWithMetrics;
  onClick?: () => void;
};

export function BusinessCard({ business, onClick }: Props) {
  const typeConfig = BUSINESS_TYPE_CONFIG[business.business_type ?? "in_store"];

  return (
    <Card
      interactive
      padding="none"
      className="overflow-hidden cursor-pointer"
      onClick={onClick}
      style={{ border: "var(--neo-border-thin) solid var(--border)", boxShadow: "var(--neo-shadow-sm)" }}
    >
      {/* Hero image */}
      {business.hero_url ? (
        <div className="h-32 overflow-hidden">
          <img
            src={business.hero_url}
            alt={business.name}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div
          className="h-32 flex items-center justify-center"
          style={{ background: "var(--surface-subtle)" }}
        >
          <MapPin className="w-8 h-8" style={{ color: "var(--text-subtle)" }} />
        </div>
      )}

      <div className="pad-3 space-y-2">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="text-fluid-md font-semibold uppercase truncate">{business.name}</h3>
            {business.tagline && (
              <p className="text-fluid-xs t-muted truncate">{business.tagline}</p>
            )}
          </div>
          {business.avatar_url && (
            <img
              src={business.avatar_url}
              alt=""
              className="w-10 h-10 rounded-full border border-border object-cover shrink-0"
            />
          )}
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-2 flex-wrap">
          <PledgeBadge tier={business.pledge_tier ?? "starter"} />
          <span
            className="text-fluid-xs px-2 py-0.5 rounded-full"
            style={{
              background: "var(--surface-subtle)",
              color: typeConfig.color,
            }}
          >
            {typeConfig.label}
          </span>
        </div>

        {/* Location */}
        {business.area && (
          <div className="flex items-center gap-1 text-fluid-xs t-muted">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{business.area}</span>
          </div>
        )}

        {/* Stats row */}
        {business.metrics && (
          <div className="flex items-center gap-3 pt-1 border-t border-border">
            <div className="flex items-center gap-1 text-fluid-xs">
              <Zap className="w-3.5 h-3.5" style={{ color: "var(--ec-mint-500)" }} />
              <span className="font-medium tabular-nums">{business.metrics.eco_triggered_30d ?? 0}</span>
              <span className="t-muted">ECO/30d</span>
            </div>
            <div className="flex items-center gap-1 text-fluid-xs">
              <Star className="w-3.5 h-3.5" style={{ color: "var(--ec-gold-500)" }} />
              <span className="font-medium tabular-nums">{business.metrics.claims_30d ?? 0}</span>
              <span className="t-muted">claims</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
