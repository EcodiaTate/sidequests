import { useEffect, useState } from "react";
import { useSupabase } from "@/lib/supabase/client";

export interface Notification {
  id: string;
  type: string; // 'friend_request', 'submission_approved', 'message', 'badge', 'order', etc
  actor_id?: string;
  object_id?: string;
  read: boolean;
  created_at: string;
  data?: Record<string, any>;
}

export function useNotificationsRealtime(userId: string | null) {
  const { supabase } = useSupabase();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const buildNotifications = async () => {
      try {
        const notifs: Notification[] = [];

        // Fetch friend requests
        const { data: friendRequests } = await supabase
          .from("friend_requests")
          .select("id, from_user, to_user, created_at, status")
          .eq("to_user", userId)
          .eq("status", "pending")
          .order("created_at", { ascending: false })
          .limit(10);

        friendRequests?.forEach((req: any) => {
          notifs.push({
            id: req.id,
            type: "friend_request",
            actor_id: req.from_user,
            object_id: req.id,
            read: false,
            created_at: req.created_at,
          });
        });

        // Fetch recent submissions for user
        const { data: submissions } = await supabase
          .from("submissions")
          .select("id, user_id, state, final_xp, final_eco, reviewed_at")
          .eq("user_id", userId)
          .eq("state", "approved")
          .order("reviewed_at", { ascending: false })
          .limit(5);

        submissions?.forEach((sub: any) => {
          notifs.push({
            id: `submission-${sub.id}`,
            type: "submission_approved",
            object_id: sub.id,
            read: false,
            created_at: sub.reviewed_at,
            data: {
              xp: sub.final_xp,
              eco: sub.final_eco,
            },
          });
        });

        // Fetch studio messages (as buyer/seller)
        const { data: myOrders } = await supabase
          .from("studio_orders")
          .select("id")
          .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
          .limit(20);

        if (myOrders && myOrders.length > 0) {
          const orderIds = myOrders.map((o: any) => o.id);
          const { data: messages } = await supabase
            .from("studio_messages")
            .select("id, order_id, sender_id, created_at")
            .in("order_id", orderIds)
            .neq("sender_id", userId)
            .order("created_at", { ascending: false })
            .limit(5);

          messages?.forEach((msg: any) => {
            notifs.push({
              id: `message-${msg.id}`,
              type: "message",
              actor_id: msg.sender_id,
              object_id: msg.order_id,
              read: false,
              created_at: msg.created_at,
            });
          });
        }

        // Sort by recency
        notifs.sort(
          (a, b) =>
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime()
        );

        setNotifications(notifs);
        setUnreadCount(notifs.filter((n) => !n.read).length);
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to build notifications:", error);
        setIsLoading(false);
      }
    };

    buildNotifications();

    // Subscribe to multiple tables
    const friendReqSub = supabase
      .channel(`notifications:friend-requests:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "friend_requests",
          filter: `to_user=eq.${userId}`,
        },
        (payload: { new: Record<string, unknown> }) => {
          const newNotif: Notification = {
            id: payload.new.id as string,
            type: "friend_request",
            actor_id: payload.new.from_user as string,
            object_id: payload.new.id as string,
            read: false,
            created_at: payload.new.created_at as string,
          };
          setNotifications((prev) => [newNotif, ...prev]);
          setUnreadCount((prev) => prev + 1);
        }
      )
      .subscribe();

    const messageSub = supabase
      .channel(`notifications:messages:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "studio_messages",
          filter: `sender_id=neq.${userId}`,
        },
        (payload: { new: Record<string, unknown> }) => {
          const newNotif: Notification = {
            id: `message-${payload.new.id as string}`,
            type: "message",
            actor_id: payload.new.sender_id as string,
            object_id: payload.new.order_id as string,
            read: false,
            created_at: payload.new.created_at as string,
          };
          setNotifications((prev) => [newNotif, ...prev]);
          setUnreadCount((prev) => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(friendReqSub);
      supabase.removeChannel(messageSub);
    };
  }, [userId, supabase]);

  return { notifications, unreadCount, isLoading };
}
