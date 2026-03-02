"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { FeedItem } from "@/types/domain";

export function useFeedRealtime() {
  const [newItems, setNewItems] = useState<FeedItem[]>([]);
  const supabaseRef = useRef(createClient());

  useEffect(() => {
    const supabase = supabaseRef.current;

    const channel = supabase
      .channel("feed:new")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "feed_items",
          filter: "visibility=eq.public",
        },
        (payload) => {
          setNewItems((prev) => [payload.new as FeedItem, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const clearNew = useCallback(() => setNewItems([]), []);

  return { newItems, newCount: newItems.length, clearNew };
}
