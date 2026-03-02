"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useHaptic } from "@/lib/hooks/use-haptics";
import { createBusiness, updateBusiness } from "@/lib/actions/eco-local";
import {
  INDUSTRY_GROUPS,
  BUSINESS_SIZES,
  BUSINESS_TYPE_CONFIG,
  PLEDGE_TIER_CONFIG,
} from "@/lib/constants/eco-local";
import type { Business, BusinessType, PledgeTier } from "@/types/domain";

type Props = {
  business?: Business | null;
  onSaved?: () => void;
};

export function BusinessForm({ business, onSaved }: Props) {
  const haptics = useHaptic();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const isEditing = !!business;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    haptics.impact("medium");

    const form = new FormData(e.currentTarget);
    const data = {
      name: form.get("name") as string,
      tagline: form.get("tagline") as string,
      description: form.get("description") as string,
      website: form.get("website") as string,
      address: form.get("address") as string,
      area: form.get("area") as string,
      abn: form.get("abn") as string,
      industry_group: form.get("industry_group") as string,
      size: form.get("size") as string,
      business_type: form.get("business_type") as BusinessType,
      pledge_tier: form.get("pledge_tier") as PledgeTier,
    };

    startTransition(async () => {
      const result = isEditing
        ? await updateBusiness({ businessId: business.id, ...data })
        : await createBusiness(data);

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
        <label className="text-fluid-xs font-medium">Business Name *</label>
        <Input
          name="name"
          defaultValue={business?.name ?? ""}
          placeholder="Your business name"
          required
        />
      </div>

      <div className="space-y-1">
        <label className="text-fluid-xs font-medium">Tagline</label>
        <Input
          name="tagline"
          defaultValue={business?.tagline ?? ""}
          placeholder="A short tagline"
        />
      </div>

      <div className="space-y-1">
        <label className="text-fluid-xs font-medium">Description</label>
        <textarea
          name="description"
          defaultValue={business?.description ?? ""}
          placeholder="Tell people about your business and eco commitments..."
          className="input min-h-24"
          rows={4}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-fluid-xs font-medium">Website</label>
          <Input
            name="website"
            type="url"
            defaultValue={business?.website ?? ""}
            placeholder="https://..."
          />
        </div>
        <div className="space-y-1">
          <label className="text-fluid-xs font-medium">ABN</label>
          <Input
            name="abn"
            defaultValue={business?.abn ?? ""}
            placeholder="XX XXX XXX XXX"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-fluid-xs font-medium">Address</label>
          <Input
            name="address"
            defaultValue={business?.address ?? ""}
            placeholder="Street address"
          />
        </div>
        <div className="space-y-1">
          <label className="text-fluid-xs font-medium">Area / Suburb</label>
          <Input
            name="area"
            defaultValue={business?.area ?? ""}
            placeholder="e.g. Fitzroy"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-fluid-xs font-medium">Industry</label>
          <select name="industry_group" defaultValue={business?.industry_group ?? ""} className="input">
            <option value="">Select...</option>
            {INDUSTRY_GROUPS.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-fluid-xs font-medium">Size</label>
          <select name="size" defaultValue={business?.size ?? ""} className="input">
            <option value="">Select...</option>
            {BUSINESS_SIZES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-fluid-xs font-medium">Business Type</label>
          <select
            name="business_type"
            defaultValue={business?.business_type ?? "in_store"}
            className="input"
          >
            {(Object.entries(BUSINESS_TYPE_CONFIG) as [BusinessType, typeof BUSINESS_TYPE_CONFIG[BusinessType]][]).map(
              ([value, config]) => (
                <option key={value} value={value}>{config.label}</option>
              )
            )}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-fluid-xs font-medium">Eco Pledge Tier</label>
          <select
            name="pledge_tier"
            defaultValue={business?.pledge_tier ?? "starter"}
            className="input"
          >
            {(Object.entries(PLEDGE_TIER_CONFIG) as [PledgeTier, typeof PLEDGE_TIER_CONFIG[PledgeTier]][]).map(
              ([value, config]) => (
                <option key={value} value={value}>{config.label} — {config.description}</option>
              )
            )}
          </select>
        </div>
      </div>

      <Button type="submit" variant="alive" fullWidth loading={isPending}>
        {isEditing ? "Save Changes" : "Register Business"}
      </Button>
    </form>
  );
}
