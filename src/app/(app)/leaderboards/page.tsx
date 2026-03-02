import { createClient } from "@/lib/supabase/server";
import { getLeaderboard } from "@/lib/actions/gamification";
import { LeaderboardClient } from "@/components/domain/leaderboards/leaderboard-client";

export default async function LeaderboardsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const data = await getLeaderboard("weekly");

  return (
    <div className="container-page py-4 max-w-2xl mx-auto">
      <h1 className="text-fluid-xl uppercase mb-4">Leaderboards</h1>
      <LeaderboardClient
        initialData={data}
        currentUserId={user?.id}
      />
    </div>
  );
}
