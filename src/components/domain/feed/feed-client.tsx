"use client";

import { useState, useTransition, useCallback } from "react";
import { MessageSquare } from "lucide-react";
import { FeedPost } from "./feed-post";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { EmptyState } from "@/components/ui/empty-state";
import { useHaptic } from "@/lib/hooks/use-haptics";
import { useFeedRealtime } from "@/lib/hooks/use-feed-realtime";
import { getFeedItems } from "@/lib/actions/feed";

type FeedItemData = Awaited<ReturnType<typeof getFeedItems>>["data"][number];

const SCOPES = [
  { key: "global" as const, label: "Global" },
  { key: "friends" as const, label: "Friends" },
] as const;

type Props = {
  initialItems: FeedItemData[];
  initialCursor: string | null;
  currentUserId?: string;
};

export function FeedClient({ initialItems, initialCursor, currentUserId }: Props) {
  const haptic = useHaptic();
  const { newCount, clearNew } = useFeedRealtime();
  const [items, setItems] = useState(initialItems);
  const [cursor, setCursor] = useState(initialCursor);
  const [scope, setScope] = useState<"global" | "friends">("global");
  const [isPending, startTransition] = useTransition();

  const fetchItems = useCallback(
    (newScope: "global" | "friends", newCursor?: string | null) => {
      startTransition(async () => {
        const result = await getFeedItems({
          scope: newScope,
          cursor: newCursor || undefined,
        });
        if (newCursor) {
          setItems((prev) => [...prev, ...result.data]);
        } else {
          setItems(result.data);
        }
        setCursor(result.nextCursor);
      });
    },
    []
  );

  const handleScopeChange = (newScope: "global" | "friends") => {
    setScope(newScope);
    haptic.impact("light");
    fetchItems(newScope);
  };

  const handleLoadNew = () => {
    clearNew();
    fetchItems(scope);
    haptic.impact("light");
  };

  const handleLoadMore = () => {
    if (cursor) fetchItems(scope, cursor);
  };

  const handlePostDeleted = () => {
    fetchItems(scope);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Scope tabs */}
      <div className="flex gap-2">
        {SCOPES.map((s) => (
          <button key={s.key} type="button" onClick={() => handleScopeChange(s.key)}>
            <Chip variant={scope === s.key ? "primary" : "secondary"}>
              {s.label}
            </Chip>
          </button>
        ))}
      </div>

      {/* New posts banner */}
      {newCount > 0 && (
        <button
          type="button"
          onClick={handleLoadNew}
          className="w-full py-2 rounded-lg text-fluid-xs font-medium text-center active-push uppercase"
          style={{
            background: "var(--ec-mint-100)",
            color: "var(--ec-mint-700)",
            border: "var(--neo-border-thin) solid var(--ec-mint-300)",
            boxShadow: "var(--neo-shadow-sm)",
          }}
        >
          {newCount} new post{newCount !== 1 ? "s" : ""} - tap to refresh
        </button>
      )}

      {/* Feed items */}
      {items.length === 0 && !isPending ? (
        <EmptyState
          icon={<MessageSquare className="w-12 h-12" />}
          title="No posts yet"
          description={
            scope === "friends"
              ? "Add some friends to see their posts here."
              : "Be the first to share your eco journey!"
          }
        />
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <FeedPost
              key={item.id}
              item={item}
              currentUserId={currentUserId}
              onDeleted={handlePostDeleted}
            />
          ))}
        </div>
      )}

      {/* Load more */}
      {cursor && (
        <div className="flex justify-center">
          <Button
            variant="tertiary"
            onClick={handleLoadMore}
            loading={isPending}
          >
            Load more
          </Button>
        </div>
      )}
    </div>
  );
}
