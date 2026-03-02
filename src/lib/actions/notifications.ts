"use server";

import { createClient } from "@/lib/supabase/server";
import type { Notification } from "@/lib/hooks/use-notifications-realtime";

const THIRTY_DAYS_AGO = () => {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d.toISOString();
};

/**
 * Fetches all recent notifications for the current user from three sources:
 * pending friend requests, approved submissions, and studio messages.
 * Returns them sorted newest-first, capped at 50 total.
 */
export async function getNotifications(): Promise<Notification[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const cutoff = THIRTY_DAYS_AGO();
  const notifs: Notification[] = [];

  // 1. Pending friend requests directed at this user
  const { data: friendRequests } = await supabase
    .from("friend_requests")
    .select("id, from_user, to_user, created_at, status")
    .eq("to_user", user.id)
    .eq("status", "pending")
    .gte("created_at", cutoff)
    .order("created_at", { ascending: false })
    .limit(10);

  (friendRequests ?? []).forEach((req: any) => {
    notifs.push({
      id: req.id,
      type: "friend_request",
      actor_id: req.from_user,
      object_id: req.id,
      read: false,
      created_at: req.created_at,
    });
  });

  // 2. Approved quest submissions for this user
  const { data: submissions } = await supabase
    .from("submissions")
    .select("id, user_id, state, final_xp, final_eco, reviewed_at")
    .eq("user_id", user.id)
    .eq("state", "approved")
    .gte("reviewed_at", cutoff)
    .order("reviewed_at", { ascending: false })
    .limit(10);

  (submissions ?? []).forEach((sub: any) => {
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

  // 3. Studio messages on orders where user is buyer or seller, sent by others
  const { data: myOrders } = await supabase
    .from("studio_orders")
    .select("id")
    .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
    .limit(20);

  if (myOrders && myOrders.length > 0) {
    const orderIds = myOrders.map((o: any) => o.id);
    const { data: messages } = await supabase
      .from("studio_messages")
      .select("id, order_id, sender_id, created_at")
      .in("order_id", orderIds)
      .neq("sender_id", user.id)
      .gte("created_at", cutoff)
      .order("created_at", { ascending: false })
      .limit(10);

    (messages ?? []).forEach((msg: any) => {
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

  // Sort newest first, cap at 50
  notifs.sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return notifs.slice(0, 50);
}

/**
 * Returns the count of all recent unread-eligible notifications.
 * Useful for badge display without fetching full notification objects.
 */
export async function getUnreadCount(): Promise<number> {
  const notifications = await getNotifications();
  return notifications.length;
}
