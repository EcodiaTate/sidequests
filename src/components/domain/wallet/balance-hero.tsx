import { Zap, TrendingUp, TrendingDown } from "lucide-react";

type Props = {
  balance: number;
  totalEarned: number;
  totalSpent: number;
};

export function BalanceHero({ balance, totalEarned, totalSpent }: Props) {
  return (
    <div
      className="card pad-4 flex flex-col items-center gap-3"
      style={{
        background: "var(--ec-mint-50)",
        border: "var(--neo-border-mid) solid var(--ec-mint-300)",
        boxShadow: "var(--neo-shadow-mint)",
      }}
    >
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center"
        style={{
          background: "var(--ec-mint-100)",
          border: "var(--neo-border-thin) solid var(--ec-mint-300)",
        }}
      >
        <Zap className="w-7 h-7" style={{ color: "var(--ec-mint-600)" }} />
      </div>
      <div className="text-center">
        <p className="stamp">ECO Balance</p>
        <p
          className="text-fluid-3xl font-bold"
          style={{ color: "var(--ec-mint-700)" }}
        >
          {balance.toLocaleString()}
        </p>
      </div>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4" style={{ color: "var(--tx-earned)" }} />
          <div>
            <p className="text-fluid-sm font-semibold" style={{ color: "var(--tx-earned)" }}>
              +{totalEarned.toLocaleString()}
            </p>
            <p className="text-fluid-xs t-muted">Earned</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <TrendingDown className="w-4 h-4" style={{ color: "var(--tx-spent)" }} />
          <div>
            <p className="text-fluid-sm font-semibold" style={{ color: "var(--tx-spent)" }}>
              -{totalSpent.toLocaleString()}
            </p>
            <p className="text-fluid-xs t-muted">Spent</p>
          </div>
        </div>
      </div>
    </div>
  );
}
