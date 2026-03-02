import type { SidequestKind } from "@/types/domain";

export const SIDEQUEST_KINDS: Record<
  SidequestKind,
  { label: string; description: string }
> = {
  core: { label: "Core", description: "Essential eco-actions" },
  eco_action: { label: "Eco Action", description: "Environmental impact" },
  daily: { label: "Daily", description: "Quick daily quests" },
  weekly: { label: "Weekly", description: "Weekly challenges" },
  tournament: { label: "Tournament", description: "Competitive events" },
  team: { label: "Team", description: "Group challenges" },
  chain: { label: "Chain", description: "Multi-step journeys" },
};

export const DIFFICULTY_CONFIG: Record<
  string,
  { label: string; color: string }
> = {
  easy: { label: "Easy", color: "var(--quest-easy)" },
  medium: { label: "Medium", color: "var(--quest-medium)" },
  hard: { label: "Hard", color: "var(--quest-hard)" },
};

export const IMPACT_CONFIG: Record<
  string,
  { label: string; color: string }
> = {
  low: { label: "Low Impact", color: "var(--text-muted)" },
  medium: { label: "Medium Impact", color: "var(--ec-gold-500)" },
  high: { label: "High Impact", color: "var(--ec-mint-600)" },
};

export const VERIFICATION_METHODS = {
  photo_upload: { label: "Photo Upload", description: "Take or upload a photo as proof" },
  instagram_link: { label: "Instagram Link", description: "Share your Instagram post link" },
} as const;

export const SUBMISSION_STATES = {
  pending: { label: "Pending", color: "var(--submission-pending)", colorFg: "var(--submission-pending-fg)" },
  approved: { label: "Approved", color: "var(--submission-approved)", colorFg: "var(--submission-approved-fg)" },
  rejected: { label: "Rejected", color: "var(--submission-rejected)", colorFg: "var(--submission-rejected-fg)" },
} as const;

export const PAGE_SIZE = 20;
