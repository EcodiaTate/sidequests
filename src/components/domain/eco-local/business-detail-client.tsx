"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Globe,
  Clock,
  Zap,
  Tag,
  Shield,
  Leaf,
  Users,
  ExternalLink,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { PledgeBadge } from "./pledge-badge";
import { OfferCard } from "./offer-card";
import { MetricsPanel } from "./metrics-panel";
import { useHaptic } from "@/lib/hooks/use-haptics";
import { redeemOffer } from "@/lib/actions/eco-local";
import {
  BUSINESS_TYPE_CONFIG,
  DAY_LABELS,
} from "@/lib/constants/eco-local";
import type { BusinessDetail } from "@/lib/actions/eco-local";

type Props = {
  business: BusinessDetail;
  isOwner: boolean;
};

type HoursEntry = { open: string; close: string; closed?: boolean };

export function BusinessDetailClient({ business, isOwner }: Props) {
  const router = useRouter();
  const haptics = useHaptic();
  const [redeemModalOpen, setRedeemModalOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [redeemResult, setRedeemResult] = useState<{ success: boolean; message: string } | null>(null);

  const typeConfig = BUSINESS_TYPE_CONFIG[business.business_type ?? "in_store"];
  const hoursMap = (business.hours_map ?? {}) as Record<string, HoursEntry>;

  const ecoStandards = Array.isArray(business.standards_eco) ? business.standards_eco as unknown as string[] : [];
  const sustainStandards = Array.isArray(business.standards_sustainability) ? business.standards_sustainability as unknown as string[] : [];
  const socialStandards = Array.isArray(business.standards_social) ? business.standards_social as unknown as string[] : [];

  const standards = [
    ...ecoStandards.map((s) => ({ label: s, kind: "eco" as const })),
    ...sustainStandards.map((s) => ({ label: s, kind: "sustainability" as const })),
    ...socialStandards.map((s) => ({ label: s, kind: "social" as const })),
  ];

  function handleRedeem(offerId: string) {
    setSelectedOffer(offerId);
    setRedeemResult(null);
    setRedeemModalOpen(true);
  }

  function confirmRedeem() {
    if (!selectedOffer) return;
    haptics.impact("heavy");

    startTransition(async () => {
      const result = await redeemOffer({ offerId: selectedOffer });
      if ("error" in result) {
        setRedeemResult({ success: false, message: result.error });
        haptics.notify("error");
      } else {
        setRedeemResult({ success: true, message: result.message ?? "Redeemed!" });
        haptics.notify("success");
      }
    });
  }

  return (
    <div className="space-y-4">
      {/* Back button */}
      <button
        onClick={() => {
          haptics.impact("light");
          router.back();
        }}
        className="flex items-center gap-1 text-fluid-sm t-muted active-push touch-target"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      {/* Hero */}
      {business.hero_url ? (
        <div className="rounded-xl overflow-hidden h-48">
          <img
            src={business.hero_url}
            alt={business.name}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div
          className="rounded-xl h-48 flex items-center justify-center"
          style={{ background: "var(--surface-subtle)" }}
        >
          <MapPin className="w-12 h-12" style={{ color: "var(--text-subtle)" }} />
        </div>
      )}

      {/* Header */}
      <div className="flex items-start gap-3">
        {business.avatar_url && (
          <img
            src={business.avatar_url}
            alt=""
            className="w-14 h-14 rounded-full border border-border object-cover shrink-0 -mt-8 relative"
            style={{ boxShadow: "var(--ec-elev-2)" }}
          />
        )}
        <div className="flex-1 min-w-0">
          <h1 className="text-fluid-xl uppercase">{business.name}</h1>
          {business.tagline && (
            <p className="text-fluid-sm t-muted">{business.tagline}</p>
          )}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <PledgeBadge tier={business.pledge_tier ?? "starter"} size="md" />
            <span
              className="text-fluid-xs px-2 py-0.5 rounded-full"
              style={{ background: "var(--surface-subtle)", color: typeConfig.color }}
            >
              {typeConfig.label}
            </span>
          </div>
        </div>
      </div>

      {/* Owner actions */}
      {isOwner && (
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => router.push("/eco-local/my-business")}
          >
            Manage Business
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => router.push("/eco-local/my-business/offers")}
          >
            Manage Offers
          </Button>
        </div>
      )}

      {/* Description */}
      {business.description && (
        <Card padding="md" style={{ border: "var(--neo-border-thin) solid var(--border)", boxShadow: "var(--neo-shadow-sm)" }}>
          <p className="text-fluid-sm whitespace-pre-wrap">{business.description}</p>
        </Card>
      )}

      {/* Details grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Location */}
        {(business.address || business.area) && (
          <Card padding="md" style={{ border: "var(--neo-border-thin) solid var(--border)", boxShadow: "var(--neo-shadow-sm)" }}>
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "var(--ec-forest-600)" }} />
              <div>
                <p className="stamp">Location</p>
                {business.address && <p className="text-fluid-sm">{business.address}</p>}
                {business.area && <p className="text-fluid-xs t-muted">{business.area}</p>}
              </div>
            </div>
          </Card>
        )}

        {/* Website */}
        {business.website && (
          <Card padding="md" style={{ border: "var(--neo-border-thin) solid var(--border)", boxShadow: "var(--neo-shadow-sm)" }}>
            <a
              href={business.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-fluid-sm"
              style={{ color: "var(--text-link)" }}
            >
              <Globe className="w-4 h-4 shrink-0" />
              <span className="truncate">{business.website.replace(/^https?:\/\//, "")}</span>
              <ExternalLink className="w-3 h-3 shrink-0" />
            </a>
          </Card>
        )}
      </div>

      {/* Hours */}
      {Object.keys(hoursMap).length > 0 && (
        <Card padding="md" style={{ border: "var(--neo-border-thin) solid var(--border)", boxShadow: "var(--neo-shadow-sm)" }}>
          <h3 className="stamp flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4" style={{ color: "var(--ec-gold-500)" }} />
            Opening Hours
          </h3>
          <div className="space-y-1">
            {Object.entries(hoursMap).map(([day, hours]) => (
              <div key={day} className="flex items-center justify-between text-fluid-xs">
                <span className="font-medium">{DAY_LABELS[day] ?? day}</span>
                <span className="t-muted">
                  {hours.closed ? "Closed" : `${hours.open} – ${hours.close}`}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Standards */}
      {standards.length > 0 && (
        <div className="space-y-2">
          <h3 className="stamp flex items-center gap-2">
            <Shield className="w-4 h-4" style={{ color: "var(--ec-mint-500)" }} />
            Eco Standards
          </h3>
          <div className="flex flex-wrap gap-2">
            {standards.map(({ label, kind }) => (
              <span
                key={label}
                className="text-fluid-xs px-2.5 py-1 rounded-full border border-border"
                style={{
                  color: kind === "eco"
                    ? "var(--ec-mint-600)"
                    : kind === "sustainability"
                    ? "var(--ec-forest-600)"
                    : "var(--ec-gold-600)",
                }}
              >
                {kind === "eco" && <Leaf className="w-3 h-3 inline mr-1" />}
                {kind === "social" && <Users className="w-3 h-3 inline mr-1" />}
                {label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Offers */}
      {business.offers.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-fluid-md uppercase flex items-center gap-2">
            <Tag className="w-5 h-5" style={{ color: "var(--ec-gold-500)" }} />
            Available Offers
          </h3>
          {business.offers.map((offer) => (
            <OfferCard
              key={offer.id}
              offer={{ ...offer, business: { id: business.id, name: business.name, avatar_url: business.avatar_url, area: business.area, pledge_tier: business.pledge_tier } }}
              onRedeem={() => handleRedeem(offer.id)}
            />
          ))}
        </div>
      )}

      {/* Metrics (owner only) */}
      {isOwner && business.metrics && (
        <MetricsPanel metrics={business.metrics} />
      )}

      {/* Redeem confirmation modal */}
      <Modal
        open={redeemModalOpen}
        onClose={() => setRedeemModalOpen(false)}
        title={redeemResult ? undefined : "Redeem Offer"}
        size="sm"
      >
        {redeemResult ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-3 py-4"
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mx-auto"
              style={{
                background: redeemResult.success ? "var(--ec-mint-100)" : "var(--destructive-bg, #fef2f2)",
              }}
            >
              <Zap
                className="w-6 h-6"
                style={{
                  color: redeemResult.success ? "var(--ec-mint-600)" : "var(--destructive, #e74c3c)",
                }}
              />
            </div>
            <p className="text-fluid-md font-semibold">{redeemResult.message}</p>
            <Button
              variant="primary"
              fullWidth
              onClick={() => {
                setRedeemModalOpen(false);
                if (redeemResult.success) router.refresh();
              }}
            >
              {redeemResult.success ? "View My Vouchers" : "Close"}
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <p className="text-fluid-sm">
              Are you sure you want to redeem this offer? ECO will be deducted from your balance.
            </p>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                fullWidth
                onClick={() => setRedeemModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="alive"
                fullWidth
                loading={isPending}
                onClick={confirmRedeem}
              >
                Redeem
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
