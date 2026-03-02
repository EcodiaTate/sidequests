"use server";

import { createClient } from "@/lib/supabase/server";

export type PlatformStats = {
  totalUsers: number;
  completedActions: number;
  ecoDistributed: number;
  businesses: number;
};

export async function getPlatformStats(): Promise<PlatformStats> {
  const supabase = await createClient();

  const [profilesResult, submissionsResult, ecoResult, businessesResult] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase
      .from("submissions")
      .select("*", { count: "exact", head: true })
      .eq("state", "approved"),
    supabase
      .from("eco_transactions")
      .select("amount")
      .eq("direction", "earned"),
    supabase.from("businesses").select("*", { count: "exact", head: true }),
  ]);

  const ecoDistributed = (ecoResult.data ?? []).reduce(
    (sum, tx) => sum + tx.amount,
    0
  );

  return {
    totalUsers: profilesResult.count ?? 0,
    completedActions: submissionsResult.count ?? 0,
    ecoDistributed,
    businesses: businessesResult.count ?? 0,
  };
}
