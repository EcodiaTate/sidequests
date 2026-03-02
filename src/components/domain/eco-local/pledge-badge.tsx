import { PLEDGE_TIER_CONFIG } from "@/lib/constants/eco-local";
import type { PledgeTier } from "@/types/domain";

type Props = {
  tier: PledgeTier;
  size?: "sm" | "md";
};

export function PledgeBadge({ tier, size = "sm" }: Props) {
  const config = PLEDGE_TIER_CONFIG[tier];

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full ${
        size === "sm" ? "text-fluid-xs px-2 py-0.5" : "text-fluid-sm px-3 py-1"
      }`}
      style={{
        background: config.colorBg,
        color: config.color,
      }}
    >
      {config.label}
    </span>
  );
}
