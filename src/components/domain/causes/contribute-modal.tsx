"use client";

import { useState, useTransition } from "react";
import { Zap, AlertTriangle } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useHaptic } from "@/lib/hooks/use-haptics";
import { contributeToCause } from "@/lib/actions/causes";
import type { CauseWithProgress } from "@/lib/actions/causes";

type Props = {
  cause: CauseWithProgress | null;
  ecoBalance: number;
  onClose: () => void;
  onSuccess: () => void;
};

const PRESETS = [50, 100, 250, 500];

export function ContributeModal({ cause, ecoBalance, onClose, onSuccess }: Props) {
  const haptic = useHaptic();
  const [amount, setAmount] = useState(100);
  const [customInput, setCustomInput] = useState("");
  const [useCustom, setUseCustom] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);

  const effectiveAmount = useCustom ? (parseInt(customInput) || 0) : amount;
  const isValid = effectiveAmount > 0 && effectiveAmount <= ecoBalance;

  function handlePreset(n: number) {
    haptic.selection();
    setAmount(n);
    setUseCustom(false);
    setCustomInput("");
    setError(null);
  }

  function handleConfirm() {
    if (!cause) return;
    if (!isValid) {
      setError(effectiveAmount <= 0 ? "Enter a valid amount" : "Insufficient ECO balance");
      haptic.notify("error");
      return;
    }
    setError(null);
    haptic.impact("heavy");

    startTransition(async () => {
      const result = await contributeToCause({ causeId: cause.id, amount: effectiveAmount });
      if ("success" in result) {
        setSuccess(true);
        haptic.notify("success");
        setTimeout(() => {
          onSuccess();
        }, 1200);
      } else {
        setError(result.error);
        haptic.notify("error");
      }
    });
  }

  return (
    <Modal open={!!cause} onClose={onClose} title={success ? undefined : "Contribute ECO"} size="sm">
      {success ? (
        <div className="text-center space-y-3 py-4">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mx-auto"
            style={{ background: "var(--ec-mint-100)" }}
          >
            <Zap className="w-7 h-7" style={{ color: "var(--ec-mint-600)" }} />
          </div>
          <p className="text-fluid-md font-bold">Contribution sent!</p>
          <p className="text-fluid-sm t-muted">{effectiveAmount.toLocaleString()} ECO contributed to {cause?.title}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Cause summary */}
          {cause && (
            <div className="space-y-1">
              <p className="text-fluid-sm font-bold">{cause.title}</p>
              <p className="text-fluid-xs t-muted">{cause.pct}% funded · {cause.supporter_count.toLocaleString()} supporters</p>
            </div>
          )}

          {/* Balance display */}
          <div
            className="flex items-center justify-between p-3 rounded-lg"
            style={{ background: "var(--surface-subtle)" }}
          >
            <span className="text-fluid-xs t-muted">Your ECO balance</span>
            <div className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5" style={{ color: "var(--ec-mint-600)" }} />
              <span className="text-fluid-sm font-bold" style={{ color: "var(--ec-mint-600)" }}>
                {ecoBalance.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Preset amounts */}
          <div className="space-y-1">
            <p className="text-fluid-xs stamp">Amount</p>
            <div className="grid grid-cols-4 gap-2">
              {PRESETS.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => handlePreset(n)}
                  className="touch-target active-push rounded-lg py-2 text-fluid-sm font-bold border transition-colors"
                  style={{
                    borderColor: !useCustom && amount === n ? "var(--ec-mint-600)" : "var(--border)",
                    background: !useCustom && amount === n ? "var(--ec-mint-50)" : "var(--surface-base)",
                    color: !useCustom && amount === n ? "var(--ec-mint-700)" : "var(--text-base)",
                  }}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Custom amount */}
          <div>
            <Input
              label="Custom amount"
              type="number"
              min={1}
              max={ecoBalance}
              value={customInput}
              onChange={(e) => {
                setCustomInput(e.target.value);
                setUseCustom(true);
                setError(null);
              }}
              placeholder="Enter custom amount"
            />
          </div>

          {/* Warning */}
          <div
            className="flex items-start gap-2 p-3 rounded-lg text-fluid-xs"
            style={{ background: "var(--ec-gold-50)", color: "var(--ec-gold-800)" }}
          >
            <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <span>Your contribution is permanent and cannot be refunded.</span>
          </div>

          {error && (
            <p className="text-fluid-xs" style={{ color: "var(--ec-danger)" }}>{error}</p>
          )}

          <div className="flex gap-2">
            <Button variant="secondary" fullWidth onClick={onClose} disabled={isPending}>Cancel</Button>
            <Button
              variant="alive"
              fullWidth
              loading={isPending}
              onClick={handleConfirm}
              disabled={!isValid}
            >
              Confirm {effectiveAmount > 0 ? effectiveAmount.toLocaleString() + " ECO" : ""}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
