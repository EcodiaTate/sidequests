import { OFFER_STATUS_CONFIG } from "@/lib/constants/eco-local";
import type { OfferStatus } from "@/types/domain";

type Props = {
  status: OfferStatus;
};

export function OfferStatusPill({ status }: Props) {
  const config = OFFER_STATUS_CONFIG[status];

  return (
    <span
      className="inline-flex items-center text-fluid-xs font-semibold px-2 py-0.5 rounded-full"
      style={{
        background: config.color,
        color: config.colorFg,
      }}
    >
      {config.label}
    </span>
  );
}
