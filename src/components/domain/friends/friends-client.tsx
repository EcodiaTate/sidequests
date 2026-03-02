"use client";

import { useState, useTransition, useCallback } from "react";
import { Users, UserPlus, Ban as BanIcon } from "lucide-react";
import { FriendCard } from "./friend-card";
import { RequestCard } from "./request-card";
import { Chip } from "@/components/ui/chip";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Avatar } from "@/components/ui/avatar";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { useHaptic } from "@/lib/hooks/use-haptics";
import { useToast } from "@/components/ui/toast";
import {
  getFriends,
  getFriendRequests,
  getBlocked,
  sendFriendRequest,
  unblockUser,
  type FriendData,
  type RequestItem,
  type BlockData,
} from "@/lib/actions/social";

type Tab = "friends" | "requests" | "blocked";
type RequestData = { incoming: RequestItem[]; outgoing: RequestItem[] };

type Props = {
  initialFriends: FriendData[];
  initialRequests: RequestData;
  initialBlocked: BlockData[];
};

export function FriendsClient({
  initialFriends,
  initialRequests,
  initialBlocked,
}: Props) {
  const haptic = useHaptic();
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>("friends");
  const [friends, setFriends] = useState(initialFriends);
  const [requests, setRequests] = useState(initialRequests);
  const [blocked, setBlocked] = useState(initialBlocked);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addUserId, setAddUserId] = useState("");
  const [isPending, startTransition] = useTransition();

  const refresh = useCallback(() => {
    startTransition(async () => {
      const [f, r, b] = await Promise.all([
        getFriends(),
        getFriendRequests(),
        getBlocked(),
      ]);
      setFriends(f);
      setRequests(r);
      setBlocked(b);
    });
  }, []);

  const handleSendRequest = () => {
    if (!addUserId.trim()) return;
    startTransition(async () => {
      const result = await sendFriendRequest({ toUserId: addUserId.trim() });
      if ("success" in result) {
        toast("Friend request sent!", "success");
        haptic.notify("success");
        setShowAddModal(false);
        setAddUserId("");
        refresh();
      } else {
        toast(result.error, "error");
        haptic.notify("error");
      }
    });
  };

  const handleUnblock = (userId: string) => {
    startTransition(async () => {
      await unblockUser({ userId });
      haptic.impact("light");
      refresh();
    });
  };

  const incomingCount = requests.incoming.length;

  return (
    <div className="flex flex-col gap-4">
      {/* Tab bar */}
      <div className="flex items-center gap-2">
        {(["friends", "requests", "blocked"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => {
              setTab(t);
              haptic.impact("light");
            }}
          >
            <Chip variant={tab === t ? "primary" : "secondary"}>
              {t === "friends" && "Friends"}
              {t === "requests" && `Requests${incomingCount > 0 ? ` (${incomingCount})` : ""}`}
              {t === "blocked" && "Blocked"}
            </Chip>
          </button>
        ))}
        <div className="flex-1" />
        <Button
          variant="primary"
          onClick={() => setShowAddModal(true)}
          icon={<UserPlus className="w-4 h-4" />}
        >
          Add
        </Button>
      </div>

      {/* Friends tab */}
      {tab === "friends" && (
        friends.length === 0 ? (
          <EmptyState
            icon={<Users className="w-12 h-12" />}
            title="No friends yet"
            description="Send a friend request to start connecting!"
          />
        ) : (
          <div className="flex flex-col gap-2">
            {friends.map((f) => (
              <FriendCard
                key={f.friendshipId}
                friendshipId={f.friendshipId}
                friend={f.friend as any}
                tier={f.tier as any}
                onUpdate={refresh}
              />
            ))}
          </div>
        )
      )}

      {/* Requests tab */}
      {tab === "requests" && (
        <div className="flex flex-col gap-4">
          {requests.incoming.length > 0 && (
            <div>
              <h3 className="stamp mb-2">Incoming</h3>
              <div className="flex flex-col gap-2">
                {requests.incoming.map((r) => (
                  <RequestCard
                    key={r.id}
                    request={r as any}
                    direction="incoming"
                    onUpdate={refresh}
                  />
                ))}
              </div>
            </div>
          )}
          {requests.outgoing.length > 0 && (
            <div>
              <h3 className="stamp mb-2">Outgoing</h3>
              <div className="flex flex-col gap-2">
                {requests.outgoing.map((r) => (
                  <RequestCard
                    key={r.id}
                    request={r as any}
                    direction="outgoing"
                    onUpdate={refresh}
                  />
                ))}
              </div>
            </div>
          )}
          {requests.incoming.length === 0 && requests.outgoing.length === 0 && (
            <EmptyState
              icon={<UserPlus className="w-12 h-12" />}
              title="No pending requests"
              description="Friend requests will appear here."
            />
          )}
        </div>
      )}

      {/* Blocked tab */}
      {tab === "blocked" && (
        blocked.length === 0 ? (
          <EmptyState
            icon={<BanIcon className="w-12 h-12" />}
            title="No blocked users"
            description="Blocked users will appear here."
          />
        ) : (
          <div className="flex flex-col gap-2">
            {blocked.map((b) => {
              const profile = b.profiles;
              return (
                <div key={`${b.blocker_id}:${b.blocked_id}`} className="card pad-3 flex items-center gap-3" style={{ border: "var(--neo-border-thin) solid var(--border)", boxShadow: "var(--neo-shadow-sm)" }}>
                  <Avatar
                    src={profile?.avatar_url}
                    alt={profile?.display_name ?? "User"}
                    size="sm"
                    fallback={profile?.display_name ?? "?"}
                  />
                  <p className="flex-1 text-fluid-sm t-base truncate">
                    {profile?.display_name ?? "User"}
                  </p>
                  <Button
                    variant="tertiary"
                    onClick={() => handleUnblock(b.blocked_id)}
                    loading={isPending}
                  >
                    Unblock
                  </Button>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* Add friend modal */}
      <Modal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add friend"
        size="sm"
      >
        <div className="flex flex-col gap-4">
          <Input
            label="User ID"
            placeholder="Paste your friend's user ID"
            value={addUserId}
            onChange={(e) => setAddUserId(e.target.value)}
          />
          <Button
            variant="alive"
            fullWidth
            onClick={handleSendRequest}
            loading={isPending}
            disabled={!addUserId.trim()}
          >
            Send request
          </Button>
        </div>
      </Modal>
    </div>
  );
}
