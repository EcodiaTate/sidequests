import { createClient } from "@/lib/supabase/server";
import { getBadges, getTitles, getQuests } from "@/lib/actions/gamification";
import { getWeeklyImpactTimeline, getTopThemes, getTopPlaces } from "@/lib/actions/impact";
import { ImpactClient } from "@/components/domain/impact/impact-client";

export default async function ImpactPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [profile, badges, titlesData, quests, submissionCount, timeline, themes, places] = await Promise.all([
    supabase
      .from("profiles")
      .select("display_name, eco_balance, level, streak_days")
      .eq("id", user!.id)
      .single(),
    getBadges(),
    getTitles(),
    getQuests(),
    supabase
      .from("submissions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user!.id)
      .eq("state", "approved"),
    getWeeklyImpactTimeline(user!.id),
    getTopThemes(user!.id),
    getTopPlaces(user!.id),
  ]);

  return (
    <div className="container-page py-4 max-w-2xl mx-auto">
      <h1 className="text-fluid-xl uppercase mb-4">Your Impact</h1>
      <ImpactClient
        userId={user!.id}
        displayName={profile.data?.display_name ?? "Ecodia Member"}
        ecoBalance={profile.data?.eco_balance ?? 0}
        totalSubmissions={submissionCount.count ?? 0}
        currentStreak={profile.data?.streak_days ?? 0}
        level={profile.data?.level ?? 1}
        badges={badges.map(b => ({ ...b, description: b.name, icon_url: b.icon }))}
        titles={titlesData.titles.map(t => ({ ...t, name: t.label, xp_boost_pct: t.xp_boost }))}
        selectedTitleId={titlesData.selectedId}
        quests={(quests as any[]).map(q => ({ ...q, name: q.label, description: null, reward_eco: q.base_eco ?? 0 }))}
        timeline={timeline}
        themes={themes}
        places={places}
      />
    </div>
  );
}
