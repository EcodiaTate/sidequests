"use client";

import { useProfile } from "@/lib/hooks/use-profile";
import { Leaf } from "lucide-react";

export function EcoCounter() {
  const { profile } = useProfile();
  const balance = profile.eco_balance ?? 0;

  return (
    <div className="flex items-center gap-2">
      <Leaf
        className="w-4 h-4 shrink-0"
        fill="var(--ec-gold-400)"
        style={{ color: "var(--ec-gold-400)" }}
      />
      <span
        className="text-fluid-xl font-heading leading-none tabular-nums"
        style={{
          color: "var(--ec-gold-400)",
          textShadow: "2px 2px 0 var(--ec-forest-900)",
        }}
      >
        {balance.toLocaleString()}
      </span>
      <span className="text-fluid-xs" style={{ color: "var(--ec-forest-500)" }}>
        ECO
      </span>
    </div>
  );
}
