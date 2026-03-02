"use client";

import { useTransition } from "react";
import { Check, X } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useHaptic } from "@/lib/hooks/use-haptics";
import {
  acceptFriendRequest,
  declineFriendRequest,
  cancelFriendRequest,
} from "@/lib/actions/social";

type RequestProfile = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
};

type Props = {
  request: {
    id: string;
    from_user: string;
    to_user: string;
    profiles: RequestProfile | RequestProfile[] | null;
  };
  direction: "incoming" | "outgoing";
  onUpdate?: () => void;
};

export function RequestCard({ request, direction, onUpdate }: Props) {
  const haptic = useHaptic();
  const [isPending, startTransition] = useTransition();

  const profile: RequestProfile | null = Array.isArray(request.profiles)
    ? request.profiles[0] ?? null
    : request.profiles;

  const handleAccept = () => {
    startTransition(async () => {
      await acceptFriendRequest({ requestId: request.id });
      haptic.notify("success");
      onUpdate?.();
    });
  };

  const handleDecline = () => {
    startTransition(async () => {
      await declineFriendRequest({ requestId: request.id });
      haptic.impact("light");
      onUpdate?.();
    });
  };

  const handleCancel = () => {
    startTransition(async () => {
      await cancelFriendRequest({ requestId: request.id });
      haptic.impact("light");
      onUpdate?.();
    });
  };

  return (
    <div className="card pad-3 flex items-center gap-3" style={{ border: "var(--neo-border-thin) solid var(--border)", boxShadow: "var(--neo-shadow-sm)" }}>
      <Avatar
        src={profile?.avatar_url}
        alt={profile?.display_name ?? "User"}
        size="sm"
        fallback={profile?.display_name ?? "?"}
      />
      <div className="flex-1 min-w-0">
        <p className="text-fluid-sm font-medium t-strong truncate">
          {profile?.display_name ?? "User"}
        </p>
        <p className="text-fluid-xs t-muted">
          {direction === "incoming" ? "Wants to be your friend" : "Request sent"}
        </p>
      </div>
      {direction === "incoming" ? (
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={handleAccept}
            disabled={isPending}
            className="active-push touch-target p-2 rounded-full"
            style={{ color: "var(--ec-mint-600)" }}
            aria-label="Accept"
          >
            <Check className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={handleDecline}
            disabled={isPending}
            className="active-push touch-target p-2 t-muted"
            aria-label="Decline"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <Button
          variant="tertiary"
          onClick={handleCancel}
          loading={isPending}
        >
          Cancel
        </Button>
      )}
    </div>
  );
}
