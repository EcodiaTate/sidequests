"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { useHaptic } from "@/lib/hooks/use-haptics";
import { deleteComment } from "@/lib/actions/feed";

type CommentItem = {
  id: string;
  body: string;
  created_at: string | null;
  user_id: string;
  profiles: { id: string; display_name: string | null; avatar_url: string | null } | null;
};

type Props = {
  comments: CommentItem[];
  currentUserId?: string;
  onDeleted?: () => void;
};

export function CommentList({ comments, currentUserId, onDeleted }: Props) {
  const haptic = useHaptic();
  const [isPending, startTransition] = useTransition();

  const handleDelete = (commentId: string) => {
    startTransition(async () => {
      await deleteComment({ commentId });
      haptic.impact("light");
      onDeleted?.();
    });
  };

  if (comments.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      {comments.map((c) => (
        <div key={c.id} className="flex gap-2">
          <Avatar
            src={c.profiles?.avatar_url}
            alt={c.profiles?.display_name ?? "User"}
            size="xs"
            fallback={c.profiles?.display_name ?? "?"}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-1.5">
              <span className="text-fluid-xs font-semibold t-strong truncate">
                {c.profiles?.display_name ?? "User"}
              </span>
              <span className="text-fluid-xs t-subtle shrink-0">
                {c.created_at
                  ? new Date(c.created_at).toLocaleDateString()
                  : ""}
              </span>
            </div>
            <p className="text-fluid-xs t-base">{c.body}</p>
          </div>
          {currentUserId === c.user_id && (
            <button
              type="button"
              onClick={() => handleDelete(c.id)}
              disabled={isPending}
              className="active-push touch-target p-1 t-subtle shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
