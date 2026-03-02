import { createClient } from "@/lib/supabase/server";
import { DashboardClient } from "@/components/domain/home/dashboard-client";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Parallel fetches
  const [profileResult, leaderboardResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("*")
      .eq("id", user!.id)
      .single(),
    supabase
      .from("leaderboard_eco_weekly")
      .select("*")
      .eq("user_id", user!.id)
      .maybeSingle(),
  ]);

  return (
    <DashboardClient
      profile={profileResult.data!}
      weeklyRank={leaderboardResult.data}
    />
  );
}
