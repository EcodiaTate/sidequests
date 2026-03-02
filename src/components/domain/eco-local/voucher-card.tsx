"use client";

import { useState, useTransition } from "react";
import { Ticket, Copy, Check, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { VoucherStatusPill } from "./voucher-status-pill";
import { consumeVoucher } from "@/lib/actions/eco-local";
import { useHaptic } from "@/lib/hooks/use-haptics";
import type { VoucherWithOffer } from "@/lib/actions/eco-local";

type Props = {
  voucher: VoucherWithOffer;
  onConsumed?: () => void;
};

export function VoucherCard({ voucher, onConsumed }: Props) {
  const haptics = useHaptic();
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  const isUsable = voucher.status === "issued";
  const isExpired = voucher.expires_at ? new Date(voucher.expires_at) < new Date() : false;

  function handleCopyCode() {
    if (!voucher.code) return;
    navigator.clipboard.writeText(voucher.code);
    setCopied(true);
    haptics.selection();
    setTimeout(() => setCopied(false), 2000);
  }

  function handleMarkUsed() {
    haptics.impact("medium");
    startTransition(async () => {
      const result = await consumeVoucher({ voucherId: voucher.id });
      if ("success" in result) {
        haptics.notify("success");
        onConsumed?.();
      } else {
        haptics.notify("error");
      }
    });
  }

  return (
    <Card padding="md" style={{ border: "var(--neo-border-thin) solid var(--border)", boxShadow: "var(--neo-shadow-sm)" }}>
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Ticket className="w-5 h-5 shrink-0" style={{ color: "var(--ec-mint-500)" }} />
            <div className="min-w-0">
              <h4 className="text-fluid-sm font-semibold truncate">
                {voucher.offer?.title ?? "Offer"}
              </h4>
              {voucher.offer?.business && (
                <div className="flex items-center gap-1 text-fluid-xs t-muted">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate">{voucher.offer.business.name}</span>
                </div>
              )}
            </div>
          </div>
          <VoucherStatusPill status={isExpired && voucher.status === "issued" ? "expired" : (voucher.status ?? "issued")} />
        </div>

        {/* Code */}
        {voucher.code && (
          <button
            type="button"
            onClick={handleCopyCode}
            className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg border border-border active-push"
            style={{ background: "var(--surface-subtle)" }}
          >
            <code className="text-fluid-sm font-mono font-semibold tracking-wider">
              {voucher.code}
            </code>
            {copied ? (
              <Check className="w-4 h-4 shrink-0" style={{ color: "var(--ec-mint-500)" }} />
            ) : (
              <Copy className="w-4 h-4 shrink-0 t-muted" />
            )}
          </button>
        )}

        {/* Expiry */}
        {voucher.expires_at && (
          <p className="text-fluid-xs t-muted">
            {isExpired
              ? "Expired"
              : `Expires ${new Date(voucher.expires_at).toLocaleDateString()}`}
          </p>
        )}

        {/* Actions */}
        {isUsable && !isExpired && (
          <Button
            variant="primary"
            size="sm"
            fullWidth
            loading={isPending}
            onClick={handleMarkUsed}
          >
            Mark as Used
          </Button>
        )}
      </div>
    </Card>
  );
}
