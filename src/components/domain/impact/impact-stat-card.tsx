import type { ReactNode } from "react";

type Props = {
  icon: ReactNode;
  label: string;
  value: string | number;
  color?: string;
};

export function ImpactStatCard({ icon, label, value, color }: Props) {
  return (
    <div
      className="card pad-3 flex items-center gap-3"
      style={{
        border: "var(--neo-border-thin) solid var(--border)",
        boxShadow: "var(--neo-shadow-sm)",
      }}
    >
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
        style={{
          background: color ? color + "20" : "var(--ec-mint-100)",
          border: "var(--neo-border-thin) solid currentColor",
        }}
      >
        <div style={{ color: color ?? "var(--ec-mint-600)" }}>{icon}</div>
      </div>
      <div>
        <p className="text-fluid-lg font-bold t-strong tabular-nums">{value}</p>
        <p className="stamp">{label}</p>
      </div>
    </div>
  );
}
