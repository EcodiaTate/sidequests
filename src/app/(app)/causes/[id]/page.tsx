import { notFound } from "next/navigation";
import { getCause, getMyContributions } from "@/lib/actions/causes";
import { createClient } from "@/lib/supabase/server";
import { CauseCard } from "@/components/domain/causes/cause-card";
import { ContributeModal } from "@/components/domain/causes/contribute-modal";
import { CauseDetailClient } from "@/components/domain/causes/cause-detail-client";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function CauseDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [cause, profileResult, contributions] = await Promise.all([
    getCause(id),
    user
      ? supabase.from("profiles").select("eco_balance").eq("id", user.id).single()
      : Promise.resolve({ data: null }),
    user ? getMyContributions() : Promise.resolve([]),
  ]);

  if (!cause) notFound();

  const ecoBalance = profileResult.data?.eco_balance ?? 0;
  const myCauses = contributions.filter((c) => c.cause.id === id);

  return (
    <div className="container-page py-4 max-w-2xl mx-auto space-y-6">
      <CauseDetailClient cause={cause} ecoBalance={ecoBalance} myContributions={myCauses} />
    </div>
  );
}
