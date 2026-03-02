"use client";

import { useState, useTransition } from "react";
import { Send } from "lucide-react";
import { useHaptic } from "@/lib/hooks/use-haptics";
import { addComment } from "@/lib/actions/feed";

type Props = {
  feedItemId: string;
  onAdded?: () => void;
};

export function CommentInput({ feedItemId, onAdded }: Props) {
  const haptic = useHaptic();
  const [body, setBody] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    if (!body.trim() || isPending) return;

    startTransition(async () => {
      const result = await addComment({ feedItemId, body: body.trim() });
      if ("success" in result) {
        setBody("");
        haptic.impact("light");
        onAdded?.();
      } else {
        haptic.notify("error");
      }
    });
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        placeholder="Add a comment..."
        maxLength={500}
        className="input flex-1"
        disabled={isPending}
      />
      <button
        type="button"
        onClick={handleSubmit}
        disabled={!body.trim() || isPending}
        className="active-push touch-target p-2 rounded-full"
        style={{ color: body.trim() ? "var(--ec-mint-600)" : "var(--text-muted)" }}
      >
        <Send className="w-5 h-5" />
      </button>
    </div>
  );
}
