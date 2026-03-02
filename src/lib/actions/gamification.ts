"use server";

import { createClient } from "@/lib/supabase/server";
import { selectTitleSchema, updateBadgeDisplaySchema } from "@/lib/validations/gamification";

export type ActionResult = { error: string } | { success: true; message?: string };

// ── Badges ───────────────────────────────────────────────────────────────

export async function getBadges() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: badgeTypes } = await supabase
    .from("badge_types")
    .select("*")
    .order("created_at", { ascending: true });

  let earnedMap: Record<string, { tier: number; earned_at: string | null }> = {};
  if (user) {
    const { data: userBadges } = await supabase
      .from("user_badges")
      .select("badge_id, tier, earned_at")
      .eq("user_id", user.id);

    for (const ub of userBadges ?? []) {
      earnedMap[ub.badge_id] = { tier: ub.tier ?? 0, earned_at: ub.earned_at };
    }
  }

  return (badgeTypes ?? []).map((bt) => ({
    ...bt,
    earned: !!earnedMap[bt.id],
    tier: earnedMap[bt.id]?.tier ?? 0,
    earnedAt: earnedMap[bt.id]?.earned_at ?? null,
  }));
}

export async function getUserBadges(userId?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const targetId = userId || user?.id;
  if (!targetId) return [];

  const { data } = await supabase
    .from("user_badges")
    .select("*, badge_types(*)")
    .eq("user_id", targetId)
    .order("earned_at", { ascending: false });

  return data ?? [];
}

// ── Titles ───────────────────────────────────────────────────────────────

export async function getTitles() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: titles } = await supabase
    .from("title_types")
    .select("*")
    .eq("is_active", true)
    .order("priority", { ascending: false });

  let selectedId: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("selected_title_id")
      .eq("id", user.id)
      .single();

    selectedId = profile?.selected_title_id ?? null;
  }

  return { titles: titles ?? [], selectedId };
}

export async function selectTitle(
  data: { titleId: string }
): Promise<ActionResult> {
  const parsed = selectTitleSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("profiles")
    .update({ selected_title_id: parsed.data.titleId })
    .eq("id", user.id);

  if (error) return { error: "Failed to select title" };
  return { success: true, message: "Title selected" };
}

export async function clearTitle(): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("profiles")
    .update({ selected_title_id: null })
    .eq("id", user.id);

  if (error) return { error: "Failed to clear title" };
  return { success: true };
}

// ── Badge Display ────────────────────────────────────────────────────────

export async function updateBadgeDisplay(
  data: { badgeIds: string[] }
): Promise<ActionResult> {
  const parsed = updateBadgeDisplaySchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("profiles")
    .update({ visible_badge_ids: parsed.data.badgeIds })
    .eq("id", user.id);

  if (error) return { error: "Failed to update badge display" };
  return { success: true };
}

// ── Quests (Meta-Goals) ──────────────────────────────────────────────────

export async function getQuests() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: questTypes } = await supabase
    .from("quest_types")
    .select("*")
    .order("created_at", { ascending: true });

  if (!user || !questTypes) return questTypes ?? [];

  // Count user's submissions in each time window for progress
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay())).toISOString();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const { count: dailyCount } = await supabase
    .from("submissions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("state", "approved")
    .gte("created_at", startOfDay);

  const { count: weeklyCount } = await supabase
    .from("submissions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("state", "approved")
    .gte("created_at", startOfWeek);

  const { count: monthlyCount } = await supabase
    .from("submissions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("state", "approved")
    .gte("created_at", startOfMonth);

  const { count: totalCount } = await supabase
    .from("submissions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("state", "approved");

  const counts: Record<string, number> = {
    daily: dailyCount ?? 0,
    weekly: weeklyCount ?? 0,
    monthly: monthlyCount ?? 0,
    once: totalCount ?? 0,
    seasonal: totalCount ?? 0,
  };

  return (questTypes ?? []).map((qt) => ({
    ...qt,
    progress: Math.min(counts[qt.cadence] ?? 0, qt.limit_per_window ?? 1),
    target: qt.limit_per_window ?? 1,
    completed: (counts[qt.cadence] ?? 0) >= (qt.limit_per_window ?? 1),
  }));
}

// ── Leaderboard ──────────────────────────────────────────────────────────

export async function getLeaderboard(period: "weekly" | "monthly" | "total" = "weekly") {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const viewName =
    period === "weekly"
      ? "leaderboard_eco_weekly"
      : period === "monthly"
        ? "leaderboard_eco_monthly"
        : "leaderboard_eco_total";

  const { data: entries } = await supabase
    .from(viewName)
    .select("*")
    .order("rank", { ascending: true })
    .limit(50);

  if (!entries || entries.length === 0) return { entries: [], userRank: null, userEntry: null };

  // Get profiles for all users in leaderboard
  const userIds = entries.map((e) => e.user_id).filter(Boolean) as string[];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url")
    .in("id", userIds);

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

  const enriched = entries.map((e) => ({
    ...e,
    profile: profileMap.get(e.user_id as string) ?? null,
  }));

  // Find user's rank
  let userRank: number | null = null;
  let userEntry = null;

  if (user) {
    const found = enriched.find((e) => e.user_id === user.id);
    if (found) {
      userRank = found.rank as number;
      userEntry = found;
    } else {
      // User not in top 50 — check their rank directly
      const { data: myRank } = await supabase
        .from(viewName)
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (myRank) {
        userRank = myRank.rank as number;
        const myProfile = profileMap.get(user.id) ?? null;
        userEntry = { ...myRank, profile: myProfile };
      }
    }
  }

  return { entries: enriched, userRank, userEntry };
}
