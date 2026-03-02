"use client";

import { Zap, Users, TrendingUp, ArrowUpRight, BarChart3 } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { BusinessMetrics } from "@/types/domain";

type Props = {
  metrics: BusinessMetrics;
};

function StatCard({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}) {
  return (
    <div className="flex items-start gap-3 pad-3">
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: `color-mix(in srgb, ${color} 15%, transparent)`, color }}
      >
        {icon}
      </div>
      <div>
        <p className="text-fluid-xs t-muted">{label}</p>
        <p className="text-fluid-lg font-bold tabular-nums">{value}</p>
        {sub && <p className="text-fluid-xs t-muted">{sub}</p>}
      </div>
    </div>
  );
}

export function MetricsPanel({ metrics }: Props) {
  return (
    <div className="space-y-3">
      <h3 className="text-fluid-md uppercase flex items-center gap-2">
        <BarChart3 className="w-5 h-5" style={{ color: "var(--ec-mint-500)" }} />
        Performance
      </h3>

      <div className="grid grid-cols-2 gap-3">
        <Card style={{ border: "var(--neo-border-thin) solid var(--border)", boxShadow: "var(--neo-shadow-sm)" }}>
          <StatCard
            icon={<Zap className="w-4 h-4" />}
            label="ECO Triggered"
            value={metrics.eco_triggered_30d ?? 0}
            sub="Last 30 days"
            color="var(--ec-mint-500)"
          />
        </Card>

        <Card style={{ border: "var(--neo-border-thin) solid var(--border)", boxShadow: "var(--neo-shadow-sm)" }}>
          <StatCard
            icon={<Users className="w-4 h-4" />}
            label="Unique Visitors"
            value={metrics.unique_claimants_30d ?? 0}
            sub="Last 30 days"
            color="var(--ec-forest-600)"
          />
        </Card>

        <Card style={{ border: "var(--neo-border-thin) solid var(--border)", boxShadow: "var(--neo-shadow-sm)" }}>
          <StatCard
            icon={<ArrowUpRight className="w-4 h-4" />}
            label="Total Claims"
            value={metrics.claims_30d ?? 0}
            sub="Last 30 days"
            color="var(--ec-gold-500)"
          />
        </Card>

        <Card style={{ border: "var(--neo-border-thin) solid var(--border)", boxShadow: "var(--neo-shadow-sm)" }}>
          <StatCard
            icon={<TrendingUp className="w-4 h-4" />}
            label="Redemptions"
            value={metrics.redemptions_30d ?? 0}
            sub="Last 30 days"
            color="var(--ec-purple-500, #9b59b6)"
          />
        </Card>
      </div>

      <Card padding="md" style={{ border: "var(--neo-border-mid) solid var(--border)", boxShadow: "var(--neo-shadow-md)" }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="stamp">ECO Velocity</p>
            <p className="text-fluid-lg font-bold tabular-nums">
              {(metrics.eco_velocity_30d ?? 0).toFixed(1)}
            </p>
            <p className="text-fluid-xs t-muted">ECO / day average</p>
          </div>
          <div>
            <p className="stamp">All-Time ECO</p>
            <p className="text-fluid-lg font-bold tabular-nums" style={{ color: "var(--ec-mint-600)" }}>
              {(metrics.eco_triggered_total ?? 0).toLocaleString()}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
