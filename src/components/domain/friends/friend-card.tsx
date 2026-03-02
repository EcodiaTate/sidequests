"use client";

import { useTransition } from "react";
import { UserMinus, Ban } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Chip } from "@/components/ui/chip";
import { useHaptic } from "@/lib/hooks/use-haptics";
import { removeFriend, blockUser } from "@/lib/actions/social";
import { FRIENDSHIP_TIER_CONFIG } from "@/lib/constants/gamification";
import type { FriendshipTier } from "@/types/domain";

type FriendProfile = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  role: string | null;
};

type Props = {
  friendshipId: string;
  friend: FriendProfile | FriendProfile[] | null;
  tier: FriendshipTier | null;
  onUpdate?: () => void;
};

export function FriendCard({ friendshipId, friend: rawFriend, tier, onUpdate }: Props) {
  const haptic = useHaptic();
  const [isPending, startTransition] = useTransition();

  const friend: FriendProfile | null = Array.isArray(rawFriend)
    ? rawFriend[0] ?? null
    : rawFriend;

  const tierConfig = tier ? FRIENDSHIP_TIER_CONFIG[tier] : null;

  const handleRemove = () => {
    startTransition(async () => {
      await removeFriend({ friendshipId });
      haptic.impact("medium");
      onUpdate?.();
    });
  };

  const handleBlock = () => {
    if (!friend) return;
    startTransition(async () => {
      await blockUser({ userId: friend.id });
      haptic.impact("heavy");
      onUpdate?.();
    });
  };

  if (!friend) return null;

  return (
    <div className="card pad-3 flex items-center gap-3" style={{ border: "var(--neo-border-thin) solid var(--border)", boxShadow: "var(--neo-shadow-sm)" }}>
      <Avatar
        src={friend.avatar_url}
        alt={friend.display_name ?? "User"}
        size="md"
        fallback={friend.display_name ?? "?"}
      />
      <div className="flex-1 min-w-0">
        <p className="text-fluid-sm font-semibold t-strong truncate">
          {friend.display_name ?? "User"}
        </p>
        {tierConfig && (
          <Chip variant="secondary">
            <span style={{ color: tierConfig.color }}>{tierConfig.label}</span>
          </Chip>
        )}
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          onClick={handleRemove}
          disabled={isPending}
          className="active-push touch-target p-2 t-muted"
          aria-label="Remove friend"
        >
          <UserMinus className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleBlock}
          disabled={isPending}
          className="active-push touch-target p-2 t-subtle"
          aria-label="Block user"
        >
          <Ban className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
