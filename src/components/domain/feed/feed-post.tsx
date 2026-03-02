"use client";

import { useState, useCallback, useTransition } from "react";
import { MessageCircle, MoreHorizontal, Trash2 } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { ReactionDock } from "./reaction-dock";
import { CommentList } from "./comment-list";
import { CommentInput } from "./comment-input";
import { getReactions, getComments, deleteFeedItem } from "@/lib/actions/feed";
import { useHaptic } from "@/lib/hooks/use-haptics";

type AuthorProfile = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  role: string | null;
};

type Props = {
  item: {
    id: string;
    author_id: string;
    caption: string | null;
    media: Record<string, unknown> | null;
    created_at: string | null;
    profiles: AuthorProfile | AuthorProfile[] | null;
  };
  currentUserId?: string;
  onDeleted?: () => void;
};

export function FeedPost({ item, currentUserId, onDeleted }: Props) {
  const haptic = useHaptic();
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<{
    id: string;
    body: string;
    created_at: string | null;
    user_id: string;
    profiles: { id: string; display_name: string | null; avatar_url: string | null } | null;
  }[]>([]);
  const [reactions, setReactions] = useState<{
    counts: Record<string, number>;
    userReaction: string | null;
    total: number;
  }>({ counts: {}, userReaction: null, total: 0 });
  const [reactionsLoaded, setReactionsLoaded] = useState(false);
  const [isDeleting, startDeleteTransition] = useTransition();

  // Handle Supabase join returning array or object
  const profile: AuthorProfile | null = Array.isArray(item.profiles)
    ? item.profiles[0] ?? null
    : item.profiles;

  const loadReactions = useCallback(async () => {
    const r = await getReactions(item.id);
    setReactions(r);
    setReactionsLoaded(true);
  }, [item.id]);

  const loadComments = useCallback(async () => {
    const c = await getComments(item.id);
    // Cast needed because FK join types aren't generated for profiles
    setComments(c as typeof comments);
  }, [item.id]);

  const handleToggleComments = async () => {
    if (!showComments) {
      await loadComments();
    }
    setShowComments((v) => !v);
    haptic.impact("light");
  };

  const handleDelete = () => {
    startDeleteTransition(async () => {
      await deleteFeedItem(item.id);
      haptic.impact("medium");
      onDeleted?.();
    });
  };

  // Load reactions on first render
  if (!reactionsLoaded) {
    loadReactions();
  }

  const isOwner = currentUserId === item.author_id;

  // Extract URL from media JSON if available
  const mediaUrl =
    item.media && typeof item.media === "object"
      ? (item.media as Record<string, unknown>).url as string | undefined ?? null
      : null;

  return (
    <div className="card pad-3 flex flex-col gap-3" style={{ border: "var(--neo-border-thin) solid var(--border)" }}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <Avatar
          src={profile?.avatar_url}
          alt={profile?.display_name ?? "User"}
          size="sm"
          fallback={profile?.display_name ?? "?"}
        />
        <div className="flex-1 min-w-0">
          <p className="text-fluid-sm font-semibold t-strong truncate">
            {profile?.display_name ?? "User"}
          </p>
          <p className="text-fluid-xs t-subtle">
            {item.created_at
              ? new Date(item.created_at).toLocaleDateString()
              : ""}
          </p>
        </div>
        {isOwner && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="active-push touch-target p-1 t-subtle"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Media */}
      {mediaUrl && (
        <div className="w-full overflow-hidden rounded-lg -mx-0.5">
          <img
            src={mediaUrl}
            alt=""
            className="w-full max-h-80 object-cover"
          />
        </div>
      )}

      {/* Caption */}
      {item.caption && (
        <p className="text-fluid-sm t-base whitespace-pre-wrap">{item.caption}</p>
      )}

      {/* Reactions + comment toggle */}
      <div className="flex items-center justify-between">
        <ReactionDock
          feedItemId={item.id}
          counts={reactions.counts}
          userReaction={reactions.userReaction}
          onUpdate={loadReactions}
        />
        <button
          type="button"
          onClick={handleToggleComments}
          className="flex items-center gap-1 text-fluid-xs t-muted active-push touch-target"
        >
          <MessageCircle className="w-4 h-4" />
          Comments
        </button>
      </div>

      {/* Comments section */}
      {showComments && (
        <div className="flex flex-col gap-3 pt-2 border-t border-border">
          <CommentList
            comments={comments}
            currentUserId={currentUserId}
            onDeleted={loadComments}
          />
          <CommentInput feedItemId={item.id} onAdded={loadComments} />
        </div>
      )}
    </div>
  );
}
