import { getCauses } from "@/lib/actions/causes";
import { CausesClient } from "@/components/domain/causes/causes-client";
import { createClient } from "@/lib/supabase/server";

export default async function CausesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [causes, profileResult] = await Promise.all([
    getCauses(),
    user
      ? supabase.from("profiles").select("eco_balance").eq("id", user.id).single()
      : Promise.resolve({ data: null }),
  ]);

  const ecoBalance = profileResult.data?.eco_balance ?? 0;

  return (
    <div className="container-page py-4 max-w-2xl mx-auto">
      <h1 className="text-fluid-xl uppercase mb-1">ECO Causes</h1>
      <p className="t-muted text-fluid-sm mb-4">Use your earned ECO to support real environmental projects across Australia.</p>
      <CausesClient initialCauses={causes} ecoBalance={ecoBalance} />
    </div>
  );
}
