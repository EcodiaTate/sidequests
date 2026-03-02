import { ECO_TX_KIND_CONFIG, ECO_TX_DIRECTION_CONFIG } from "@/lib/constants/wallet";
import type { EcoTxKind, EcoTxDirection } from "@/types/domain";

type Props = {
  transaction: {
    id: string;
    kind: string;
    direction: string;
    amount: number;
    source: string | null;
    created_at: string | null;
  };
};

export function TransactionRow({ transaction }: Props) {
  const kindConfig = ECO_TX_KIND_CONFIG[transaction.kind as EcoTxKind];
  const dirConfig = ECO_TX_DIRECTION_CONFIG[transaction.direction as EcoTxDirection];

  return (
    <div className="card pad-3 flex items-center gap-3" style={{ border: "var(--neo-border-thin) solid var(--border)" }}>
      <div className="flex-1 min-w-0">
        <p className="text-fluid-sm font-medium t-strong truncate">
          {kindConfig?.label ?? transaction.kind}
        </p>
        {transaction.source && (
          <p className="text-fluid-xs t-muted truncate">{transaction.source}</p>
        )}
        <p className="text-fluid-xs t-subtle">
          {transaction.created_at
            ? new Date(transaction.created_at).toLocaleDateString()
            : ""}
        </p>
      </div>
      <p
        className="text-fluid-sm font-bold shrink-0"
        style={{ color: dirConfig?.color ?? "var(--text-base)" }}
      >
        {dirConfig?.sign ?? ""}{transaction.amount.toLocaleString()} ECO
      </p>
    </div>
  );
}
