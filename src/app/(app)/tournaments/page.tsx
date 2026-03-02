import { getTournaments } from "@/lib/actions/tournaments";
import { TournamentListClient } from "@/components/domain/tournaments/tournament-list-client";

export default async function TournamentsPage() {
  const tournaments = await getTournaments();
  return (
    <div className="container-page py-4 max-w-2xl mx-auto">
      <h1 className="text-fluid-xl uppercase mb-4">Tournaments</h1>
      <TournamentListClient initialTournaments={tournaments} />
    </div>
  );
}
