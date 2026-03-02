import { getWalletSummary, getTransactions, getEcoTimeline } from "@/lib/actions/wallet";
import Link from "next/link";
import { Zap } from "lucide-react";
import { WalletClient } from "@/components/domain/wallet/wallet-client";

export default async function WalletPage() {
  const [summary, txResult, timeline] = await Promise.all([
    getWalletSummary(),
    getTransactions({ direction: "all" }),
    getEcoTimeline(16),
  ]);

  return (
    <div className="container-page py-4 max-w-2xl mx-auto">
      <h1 className="text-fluid-xl uppercase mb-4">Wallet</h1>
      <WalletClient
        summary={summary ?? { balance: 0, totalEarned: 0, totalSpent: 0 }}
        initialTransactions={txResult.data}
        initialCursor={txResult.nextCursor}
        timeline={timeline}
      />
      <Link
        href="/causes"
        className="mt-4 block card pad-4 border border-border active-push touch-target"
        style={{ background: "var(--ec-forest-50)", boxShadow: "var(--neo-shadow-sm)" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
            style={{ background: "var(--ec-forest-700)" }}
          >
            <Zap className="w-5 h-5" style={{ color: "var(--ec-mint-400)" }} />
          </div>
          <div>
            <p className="text-fluid-sm font-bold" style={{ color: "var(--ec-forest-800)" }}>Spend your ECO</p>
            <p className="text-fluid-xs" style={{ color: "var(--ec-forest-600)" }}>
              Support Australian environmental causes with your earned ECO
            </p>
          </div>
        </div>
      </Link>
    </div>
  );
}
