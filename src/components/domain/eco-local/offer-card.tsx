"use client";

import { Zap, Clock, Tag } from "lucide-react";
import { Card } from "@/components/ui/card";
import { OFFER_TYPE_CONFIG } from "@/lib/constants/eco-local";
import { PledgeBadge } from "./pledge-badge";
import type { OfferWithBusiness } from "@/lib/actions/eco-local";

type Props = {
  offer: OfferWithBusiness;
  onRedeem?: () => void;
};

export function OfferCard({ offer, onRedeem }: Props) {
  const typeConfig = OFFER_TYPE_CONFIG[offer.offer_type];
  const isExpired = offer.valid_until ? new Date(offer.valid_until) < new Date() : false;
  const isOutOfStock = offer.stock !== null && offer.stock <= 0;

  return (
    <Card interactive padding="md" onClick={onRedeem} style={{ border: "var(--neo-border-thin) solid var(--border)", boxShadow: "var(--neo-shadow-sm)" }}>
      <div className="flex items-start gap-3">
        {/* Type icon */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: typeConfig.color, color: typeConfig.colorFg }}
        >
          <Tag className="w-5 h-5" />
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          {/* Title */}
          <h4 className="text-fluid-md font-semibold truncate">{offer.title}</h4>

          {/* Blurb */}
          {offer.blurb && (
            <p className="text-fluid-xs t-muted line-clamp-2">{offer.blurb}</p>
          )}

          {/* Business info */}
          {offer.business && (
            <div className="flex items-center gap-2">
              {offer.business.avatar_url && (
                <img
                  src={offer.business.avatar_url}
                  alt=""
                  className="w-5 h-5 rounded-full"
                />
              )}
              <span className="text-fluid-xs t-muted">{offer.business.name}</span>
              <PledgeBadge tier={offer.business.pledge_tier ?? "starter"} size="sm" />
            </div>
          )}

          {/* Footer row */}
          <div className="flex items-center gap-3 pt-1">
            {(offer.eco_price ?? 0) > 0 && (
              <div className="flex items-center gap-1 text-fluid-xs font-semibold">
                <Zap className="w-3.5 h-3.5" style={{ color: "var(--ec-mint-500)" }} />
                <span style={{ color: "var(--ec-mint-600)" }}>
                  {offer.eco_price} ECO
                </span>
              </div>
            )}
            {(offer.eco_price ?? 0) === 0 && (
              <span
                className="text-fluid-xs font-semibold"
                style={{ color: "var(--ec-mint-600)" }}
              >
                Free
              </span>
            )}
            {offer.stock !== null && (
              <span className="text-fluid-xs t-muted">
                {offer.stock} left
              </span>
            )}
            {offer.valid_until && (
              <div className="flex items-center gap-1 text-fluid-xs t-muted">
                <Clock className="w-3 h-3" />
                <span>
                  {isExpired ? "Expired" : `Until ${new Date(offer.valid_until).toLocaleDateString()}`}
                </span>
              </div>
            )}
            {isOutOfStock && (
              <span className="text-fluid-xs font-semibold" style={{ color: "var(--offer-hidden)" }}>
                Sold Out
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
