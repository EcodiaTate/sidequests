import type { EcoTxKind, EcoTxDirection } from "@/types/domain";

export const ECO_TX_KIND_CONFIG: Record<
  EcoTxKind,
  { label: string; description: string }
> = {
  mint_action: { label: "Sidequest Reward", description: "Earned from completing a sidequest" },
  burn_reward: { label: "Offer Redemption", description: "Spent on an eco-local offer" },
  contribute: { label: "Contribution", description: "Contributed to a cause" },
  sponsor_deposit: { label: "Sponsor Deposit", description: "Business sponsor deposit" },
  sponsor_payout: { label: "Sponsor Payout", description: "Business sponsor payout" },
};

export const ECO_TX_DIRECTION_CONFIG: Record<
  EcoTxDirection,
  { label: string; sign: string; color: string }
> = {
  earned: { label: "Earned", sign: "+", color: "var(--tx-earned)" },
  spent: { label: "Spent", sign: "-", color: "var(--tx-spent)" },
};
