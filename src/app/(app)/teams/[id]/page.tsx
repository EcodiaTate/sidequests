import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getTeamById, getTeamQuests } from "@/lib/actions/social";
import { TeamDetailClient } from "@/components/domain/teams/team-detail-client";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function TeamDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [team, teamQuests] = await Promise.all([
    getTeamById(id),
    getTeamQuests(id),
  ]);

  if (!team) notFound();

  return (
    <div className="container-page py-4 max-w-2xl mx-auto">
      <TeamDetailClient
        team={{ ...team, invite_code: team.invite_code ?? "" }}
        currentUserId={user?.id}
        teamQuests={teamQuests}
      />
    </div>
  );
}
