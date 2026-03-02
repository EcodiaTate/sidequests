"use server";

import { createClient } from "@/lib/supabase/server";
import { walletFilterSchema } from "@/lib/validations/wallet";

export async function getWalletSummary() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("eco_balance")
    .eq("id", user.id)
    .single();

  // Aggregate earned/spent
  const { data: earned } = await supabase
    .from("eco_transactions")
    .select("amount")
    .eq("user_id", user.id)
    .eq("direction", "earned");

  const { data: spent } = await supabase
    .from("eco_transactions")
    .select("amount")
    .eq("user_id", user.id)
    .eq("direction", "spent");

  const totalEarned = (earned ?? []).reduce((sum, tx) => sum + tx.amount, 0);
  const totalSpent = (spent ?? []).reduce((sum, tx) => sum + tx.amount, 0);

  return {
    balance: profile?.eco_balance ?? 0,
    totalEarned,
    totalSpent,
  };
}

export async function getTransactions(filters: Record<string, unknown> = {}) {
  const parsed = walletFilterSchema.safeParse(filters);
  const f = parsed.success ? parsed.data : { direction: "all" as const, limit: 20 };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: [], nextCursor: null };

  let query = supabase
    .from("eco_transactions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(f.limit ?? 20);

  if (f.direction && f.direction !== "all") {
    query = query.eq("direction", f.direction);
  }

  if (f.kind) {
    query = query.eq("kind", f.kind);
  }

  if (f.cursor) {
    query = query.lt("created_at", f.cursor);
  }

  const { data, error } = await query;
  if (error) return { data: [], nextCursor: null };

  const items = data ?? [];
  const nextCursor = items.length === (f.limit ?? 20)
    ? items[items.length - 1]?.created_at ?? null
    : null;

  return { data: items, nextCursor };
}

export type EcoTimelineWeek = {
  week: string; // ISO date of week start (Monday)
  earned: number;
  spent: number;
};

export async function getEcoTimeline(weeks: number = 8): Promise<EcoTimelineWeek[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  // Fetch all transactions within the date range
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - weeks * 7);

  const { data, error } = await supabase
    .from("eco_transactions")
    .select("amount, direction, created_at")
    .eq("user_id", user.id)
    .gte("created_at", startDate.toISOString())
    .order("created_at", { ascending: true });

  if (error || !data) return [];

  // Build a map of week-start ISO strings → { earned, spent }
  const weekMap = new Map<string, { earned: number; spent: number }>();

  // Pre-populate all week slots so empty weeks show as 0
  for (let i = 0; i < weeks; i++) {
    const d = new Date();
    // walk back (weeks - 1 - i) weeks from the start of the current week
    const day = d.getDay(); // 0=Sun
    const daysToMonday = (day + 6) % 7;
    d.setDate(d.getDate() - daysToMonday - (weeks - 1 - i) * 7);
    d.setHours(0, 0, 0, 0);
    const key = d.toISOString().slice(0, 10);
    if (!weekMap.has(key)) weekMap.set(key, { earned: 0, spent: 0 });
  }

  for (const tx of data) {
    if (!tx.created_at) continue;
    const d = new Date(tx.created_at);
    const day = d.getDay(); // 0=Sun
    const daysToMonday = (day + 6) % 7;
    d.setDate(d.getDate() - daysToMonday);
    d.setHours(0, 0, 0, 0);
    const key = d.toISOString().slice(0, 10);
    const existing = weekMap.get(key) ?? { earned: 0, spent: 0 };
    if (tx.direction === "earned") {
      existing.earned += tx.amount;
    } else {
      existing.spent += tx.amount;
    }
    weekMap.set(key, existing);
  }

  return Array.from(weekMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([week, counts]) => ({ week, ...counts }));
}
