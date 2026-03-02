"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useProfile } from "@/lib/hooks/use-profile";

export function useFriendRequests() {
  const { profile } = useProfile();
  const [pendingCount, setPendingCount] = useState(0);
  const supabaseRef = useRef(createClient());

  useEffect(() => {
    const supabase = supabaseRef.current;

    // Initial count
    supabase
      .from("friend_requests")
      .select("*", { count: "exact", head: true })
      .eq("to_user", profile.id)
      .eq("status", "pending")
      .then(({ count }) => {
        setPendingCount(count ?? 0);
      });

    // Subscribe to new incoming requests
    const channel = supabase
      .channel(`friend-requests:${profile.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "friend_requests",
          filter: `to_user=eq.${profile.id}`,
        },
        () => {
          setPendingCount((prev) => prev + 1);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "friend_requests",
          filter: `to_user=eq.${profile.id}`,
        },
        () => {
          // Refresh count when requests are accepted/declined
          supabase
            .from("friend_requests")
            .select("*", { count: "exact", head: true })
            .eq("to_user", profile.id)
            .eq("status", "pending")
            .then(({ count }) => {
              setPendingCount(count ?? 0);
            });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile.id]);

  return { pendingCount };
}
