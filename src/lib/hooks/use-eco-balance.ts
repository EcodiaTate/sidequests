import { useEffect, useState } from "react";
import { useSupabase } from "@/lib/supabase/client";

export function useEcoBalance(userId: string | null) {
  const { supabase } = useSupabase();
  const [ecoBalance, setEcoBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    // Fetch initial balance
    const fetchBalance = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("eco_balance")
        .eq("id", userId)
        .single();

      if (!error && data) {
        setEcoBalance(data.eco_balance ?? 0);
      }
      setIsLoading(false);
    };

    fetchBalance();

    // Subscribe to eco_transactions changes
    const subscription = supabase
      .channel(`eco-balance:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "eco_transactions",
          filter: `user_id=eq.${userId}`,
        },
        (payload: { new: Record<string, unknown> }) => {
          const direction = payload.new.direction as string;
          const amount = payload.new.amount as number;
          const change = direction === "earned" ? amount : -amount;
          setEcoBalance((prev) => prev + change);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [userId, supabase]);

  return { ecoBalance, isLoading };
}
