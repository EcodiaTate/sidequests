import { getTournament } from "@/lib/actions/tournaments";
import { notFound } from "next/navigation";
import { TournamentDetailClient } from "@/components/domain/tournaments/tournament-detail-client";

export default async function TournamentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tournament = await getTournament(id);
  if (!tournament) notFound();
  return (
    <div className="container-page py-4 max-w-2xl mx-auto">
      <TournamentDetailClient tournament={tournament} />
    </div>
  );
}
