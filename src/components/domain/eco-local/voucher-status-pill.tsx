import { VOUCHER_STATUS_CONFIG } from "@/lib/constants/eco-local";
import type { VoucherStatus } from "@/types/domain";

type Props = {
  status: VoucherStatus;
};

export function VoucherStatusPill({ status }: Props) {
  const config = VOUCHER_STATUS_CONFIG[status];

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
