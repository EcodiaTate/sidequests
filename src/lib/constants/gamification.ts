import type { ReactionKind, FriendshipTier, QuestCadence } from "@/types/domain";

export const REACTION_CONFIG: Record<
  ReactionKind,
  { emoji: string; label: string; color: string }
> = {
  eco: { emoji: "\u{1F331}", label: "Eco", color: "var(--reaction-eco)" },
  wow: { emoji: "\u{1F929}", label: "Wow", color: "var(--reaction-wow)" },
  cheer: { emoji: "\u{1F389}", label: "Cheer", color: "var(--reaction-cheer)" },
  fire: { emoji: "\u{1F525}", label: "Fire", color: "var(--reaction-fire)" },
  leaf: { emoji: "\u{1F343}", label: "Leaf", color: "var(--reaction-leaf)" },
};

export const FRIENDSHIP_TIER_CONFIG: Record<
  FriendshipTier,
  { label: string; color: string; description: string }
> = {
  seedling: { label: "Seedling", color: "var(--tier-seedling)", description: "Just met" },
  sapling: { label: "Sapling", color: "var(--tier-sapling)", description: "Growing friendship" },
  canopy: { label: "Canopy", color: "var(--tier-canopy)", description: "Strong bond" },
  elder: { label: "Elder", color: "var(--tier-elder)", description: "Lifelong ally" },
};

export const QUEST_CADENCE_CONFIG: Record<
  QuestCadence,
  { label: string; description: string }
> = {
  once: { label: "One-time", description: "Complete once" },
  daily: { label: "Daily", description: "Resets every day" },
  weekly: { label: "Weekly", description: "Resets every week" },
  monthly: { label: "Monthly", description: "Resets every month" },
  seasonal: { label: "Seasonal", description: "Resets every season" },
};

export const LEADERBOARD_PERIODS = [
  { key: "weekly" as const, label: "This Week" },
  { key: "monthly" as const, label: "This Month" },
  { key: "total" as const, label: "All Time" },
];
