"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useHaptic } from "@/lib/hooks/use-haptics";
import { createOffer, updateOffer } from "@/lib/actions/eco-local";
import {
  OFFER_TYPE_CONFIG,
  REDEMPTION_MODE_CONFIG,
} from "@/lib/constants/eco-local";
import type { Offer, OfferType, RedemptionMode } from "@/types/domain";

type Props = {
  businessId: string;
  offer?: Offer | null;
  onSaved?: () => void;
};

export function OfferForm({ businessId, offer, onSaved }: Props) {
  const haptics = useHaptic();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const isEditing = !!offer;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    haptics.impact("medium");

    const form = new FormData(e.currentTarget);

    const data = {
      title: form.get("title") as string,
      blurb: form.get("blurb") as string,
      offer_type: form.get("offer_type") as OfferType,
      eco_price: parseInt(form.get("eco_price") as string) || 0,
      stock: form.get("stock") ? parseInt(form.get("stock") as string) : undefined,
      url: form.get("url") as string,
      valid_until: form.get("valid_until") as string,
      redemption_mode: form.get("redemption_mode") as RedemptionMode,
      discount_code: form.get("discount_code") as string,
    };

    startTransition(async () => {
      const result = isEditing
        ? await updateOffer({ offerId: offer.id, ...data })
        : await createOffer({ businessId, ...data });

      if ("error" in result) {
        setError(result.error);
        haptics.notify("error");
      } else {
        haptics.notify("success");
        onSaved?.();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div
          className="text-fluid-sm px-3 py-2 rounded-lg"
          style={{ background: "var(--destructive-bg, #fef2f2)", color: "var(--destructive, #e74c3c)" }}
        >
          {error}
        </div>
      )}

      <div className="space-y-1">
        <label className="text-fluid-xs font-medium">Title *</label>
        <Input
          name="title"
          defaultValue={offer?.title ?? ""}
          placeholder="e.g. 10% off your first order"
          required
        />
      </div>

      <div className="space-y-1">
        <label className="text-fluid-xs font-medium">Description</label>
        <textarea
          name="blurb"
          defaultValue={offer?.blurb ?? ""}
          placeholder="Describe what the customer gets..."
          className="input min-h-20"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-fluid-xs font-medium">Offer Type</label>
          <select
            name="offer_type"
            defaultValue={offer?.offer_type ?? "discount"}
            className="input"
          >
            {(Object.entries(OFFER_TYPE_CONFIG) as [OfferType, typeof OFFER_TYPE_CONFIG[OfferType]][]).map(
              ([value, config]) => (
                <option key={value} value={value}>{config.label}</option>
              )
            )}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-fluid-xs font-medium">ECO Price</label>
          <Input
            name="eco_price"
            type="number"
            min={0}
            defaultValue={offer?.eco_price ?? 0}
            placeholder="0 = free"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-fluid-xs font-medium">Stock (leave empty = unlimited)</label>
          <Input
            name="stock"
            type="number"
            min={0}
            defaultValue={offer?.stock ?? ""}
            placeholder="Unlimited"
          />
        </div>
        <div className="space-y-1">
          <label className="text-fluid-xs font-medium">Valid Until</label>
          <Input
            name="valid_until"
            type="datetime-local"
            defaultValue={
              offer?.valid_until
                ? new Date(offer.valid_until).toISOString().slice(0, 16)
                : ""
            }
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-fluid-xs font-medium">Redemption Method</label>
          <select
            name="redemption_mode"
            defaultValue={offer?.redemption_mode ?? "in_store_qr"}
            className="input"
          >
            {(Object.entries(REDEMPTION_MODE_CONFIG) as [RedemptionMode, typeof REDEMPTION_MODE_CONFIG[RedemptionMode]][]).map(
              ([value, config]) => (
                <option key={value} value={value}>{config.label}</option>
              )
            )}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-fluid-xs font-medium">Discount Code</label>
          <Input
            name="discount_code"
            defaultValue={offer?.discount_code ?? ""}
            placeholder="Optional code"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-fluid-xs font-medium">URL (optional)</label>
        <Input
          name="url"
          type="url"
          defaultValue={offer?.url ?? ""}
          placeholder="https://..."
        />
      </div>

      <Button type="submit" variant="alive" fullWidth loading={isPending}>
        {isEditing ? "Save Changes" : "Create Offer"}
      </Button>
    </form>
  );
}
