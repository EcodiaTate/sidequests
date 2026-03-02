"use server";

import { createClient } from "@/lib/supabase/server";

export type WeeklyImpactPoint = {
  week: string; // ISO date of week start (Monday)
  actions: number;
};

export type TopTheme = {
  theme: string;
  count: number;
};

export type TopPlace = {
  place: string;
  count: number;
};

export async function getWeeklyImpactTimeline(userId: string): Promise<WeeklyImpactPoint[]> {
  const supabase = await createClient();
  const weeks = 12;

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - weeks * 7);

  const { data, error } = await supabase
    .from("submissions")
    .select("created_at")
    .eq("user_id", userId)
    .eq("state", "approved")
    .gte("created_at", startDate.toISOString())
    .order("created_at", { ascending: true });

  if (error || !data) return [];

  // Pre-populate all week slots
  const weekMap = new Map<string, number>();
  for (let i = 0; i < weeks; i++) {
    const d = new Date();
    const day = d.getDay();
    const daysToMonday = (day + 6) % 7;
    d.setDate(d.getDate() - daysToMonday - (weeks - 1 - i) * 7);
    d.setHours(0, 0, 0, 0);
    const key = d.toISOString().slice(0, 10);
    if (!weekMap.has(key)) weekMap.set(key, 0);
  }

  for (const row of data) {
    if (!row.created_at) continue;
    const d = new Date(row.created_at);
    const day = d.getDay();
    const daysToMonday = (day + 6) % 7;
    d.setDate(d.getDate() - daysToMonday);
    d.setHours(0, 0, 0, 0);
    const key = d.toISOString().slice(0, 10);
    weekMap.set(key, (weekMap.get(key) ?? 0) + 1);
  }

  return Array.from(weekMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([week, actions]) => ({ week, actions }));
}

export async function getTopThemes(userId: string): Promise<TopTheme[]> {
  const supabase = await createClient();

  // Join submissions → sidequests, group by kind
  const { data, error } = await supabase
    .from("submissions")
    .select("sidequest_id, sidequests!inner(kind)")
    .eq("user_id", userId)
    .eq("state", "approved");

  if (error || !data) return [];

  const countMap = new Map<string, number>();
  for (const row of data) {
    const sq = (row.sidequests as unknown) as { kind: string } | null;
    if (!sq) continue;
    const kind = sq.kind;
    countMap.set(kind, (countMap.get(kind) ?? 0) + 1);
  }

  return Array.from(countMap.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6)
    .map(([theme, count]) => ({ theme, count }));
}

export async function getTopPlaces(userId: string): Promise<TopPlace[]> {
  const supabase = await createClient();

  // Get vouchers consumed by user, join to offers → businesses for location
  const { data, error } = await supabase
    .from("vouchers")
    .select("offer_id")
    .eq("user_id", userId)
    .in("status", ["consumed", "verified"]);

  if (error || !data || data.length === 0) return [];

  const offerIds = data.map((v) => v.offer_id);

  // Fetch offers with business area
  const { data: offers } = await supabase
    .from("offers")
    .select("business_id, businesses!inner(area, name)")
    .in("id", offerIds);

  if (!offers) return [];

  const countMap = new Map<string, number>();
  for (const offer of offers) {
    const biz = (offer.businesses as unknown) as { area: string | null; name: string } | null;
    if (!biz) continue;
    const place = biz.area ?? biz.name;
    if (!place) continue;
    countMap.set(place, (countMap.get(place) ?? 0) + 1);
  }

  return Array.from(countMap.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([place, count]) => ({ place, count }));
}
