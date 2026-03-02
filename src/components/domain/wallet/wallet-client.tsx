"use client";

import { useState, useTransition, useCallback } from "react";
import { Wallet } from "lucide-react";
import { BalanceHero } from "./balance-hero";
import { TransactionFilters } from "./transaction-filters";
import { TransactionRow } from "./transaction-row";
import { EcoTimelineChart } from "./eco-timeline-chart";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { getTransactions } from "@/lib/actions/wallet";
import type { EcoTimelineWeek } from "@/lib/actions/wallet";

type TxData = Awaited<ReturnType<typeof getTransactions>>["data"][number];
type Direction = "all" | "earned" | "spent";

type Props = {
  summary: { balance: number; totalEarned: number; totalSpent: number };
  initialTransactions: TxData[];
  initialCursor: string | null;
  timeline: EcoTimelineWeek[];
};

export function WalletClient({ summary, initialTransactions, initialCursor, timeline }: Props) {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [cursor, setCursor] = useState(initialCursor);
  const [direction, setDirection] = useState<Direction>("all");
  const [isPending, startTransition] = useTransition();

  const fetchTransactions = useCallback(
    (dir: Direction, newCursor?: string | null) => {
      startTransition(async () => {
        const result = await getTransactions({
          direction: dir,
          cursor: newCursor || undefined,
        });
        if (newCursor) {
          setTransactions((prev) => [...prev, ...result.data]);
        } else {
          setTransactions(result.data);
        }
        setCursor(result.nextCursor);
      });
    },
    []
  );

  const handleDirectionChange = (d: Direction) => {
    setDirection(d);
    fetchTransactions(d);
  };

  return (
    <div className="flex flex-col gap-4">
      <BalanceHero
        balance={summary.balance}
        totalEarned={summary.totalEarned}
        totalSpent={summary.totalSpent}
      />

      <EcoTimelineChart data={timeline} />

      <TransactionFilters
        direction={direction}
        onDirectionChange={handleDirectionChange}
      />

      {transactions.length === 0 && !isPending ? (
        <EmptyState
          icon={<Wallet className="w-12 h-12" />}
          title="No transactions"
          description="Complete sidequests to start earning ECO!"
        />
      ) : (
        <div className="flex flex-col gap-1">
          {transactions.map((tx) => (
            <TransactionRow key={tx.id} transaction={tx} />
          ))}
        </div>
      )}

      {cursor && (
        <div className="flex justify-center">
          <Button
            variant="tertiary"
            onClick={() => fetchTransactions(direction, cursor)}
            loading={isPending}
          >
            Load more
          </Button>
        </div>
      )}
    </div>
  );
}
