import { getEcoLocalDashboard } from "@/lib/actions/eco-local";
import { EcoLocalClient } from "@/components/domain/eco-local/eco-local-client";

export default async function EcoLocalPage() {
  const dashboard = await getEcoLocalDashboard();

  return (
    <div className="container-page py-4">
      <div className="space-y-2 mb-4">
        <h1 className="text-fluid-xl uppercase">Eco-Local</h1>
        <p className="text-fluid-sm t-muted">
          Discover eco-friendly businesses, redeem offers, and earn ECO
        </p>
      </div>
      <EcoLocalClient initialData={dashboard} />
    </div>
  );
}
