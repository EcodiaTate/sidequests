import { getTeams } from "@/lib/actions/social";
import { TeamsClient } from "@/components/domain/teams/teams-client";

export default async function TeamsPage() {
  const teams = await getTeams();

  return (
    <div className="container-page py-4 max-w-2xl mx-auto">
      <h1 className="text-fluid-xl uppercase mb-4">Teams</h1>
      <TeamsClient initialTeams={teams} />
    </div>
  );
}
