import { notFound } from "next/navigation";
import { getSidequestById, getChainSidequests, getUserSubmissionsForQuest } from "@/lib/actions/sidequests";
import { SidequestDetailView } from "@/components/domain/sidequests/sidequest-detail-view";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function QuestDetailPage({ params }: Props) {
  const { id } = await params;
  const sidequest = await getSidequestById(id);
  if (!sidequest) notFound();

  const [chain, submissions] = await Promise.all([
    sidequest.chain_id
      ? getChainSidequests(sidequest.chain_id)
      : Promise.resolve([]),
    getUserSubmissionsForQuest(id),
  ]);

  const completedIds = new Set(
    submissions
      .filter((s) => s.state === "approved")
      .map((s) => s.sidequest_id)
  );

  return (
    <div className="container-page py-4 max-w-2xl mx-auto">
      <SidequestDetailView
        sidequest={sidequest}
        chain={chain}
        completedIds={completedIds}
        submissions={submissions}
      />
    </div>
  );
}
