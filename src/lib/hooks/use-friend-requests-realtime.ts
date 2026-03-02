import { useEffect, useState } from "react";
import { useSupabase } from "@/lib/supabase/client";

export interface FriendRequest {
  id: string;
  from_user: string;
  to_user: string;
  status: string;
  created_at: string;
}

export function useFriendRequestsRealtime(userId: string | null) {
  const { supabase } = useSupabase();
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const fetchRequests = async () => {
      const { data, error } = await supabase
        .from("friend_requests")
        .select("*")
        .eq("to_user", userId)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setPendingRequests(data as unknown as FriendRequest[]);
      }
      setIsLoading(false);
    };

    fetchRequests();

    // Subscribe to new friend requests
    const subscription = supabase
      .channel(`friend-requests:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "friend_requests",
          filter: `to_user=eq.${userId}`,
        },
        (payload: { new: Record<string, unknown> }) => {
          if (payload.new.status === "pending") {
            setPendingRequests((prev) => [
              payload.new as unknown as FriendRequest,
              ...prev,
            ]);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "friend_requests",
          filter: `to_user=eq.${userId}`,
        },
        (payload: { new: Record<string, unknown> }) => {
          if (payload.new.status !== "pending") {
            setPendingRequests((prev) =>
              prev.filter((req) => req.id !== payload.new.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [userId, supabase]);

  return { pendingRequests, isLoading };
}
