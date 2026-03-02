"use client";

import { useState, useTransition } from "react";
import { QrCode, Zap, PartyPopper } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { claimBusinessQr } from "@/lib/actions/eco-local";
import { useHaptic } from "@/lib/hooks/use-haptics";

type Props = {
  open: boolean;
  onClose: () => void;
  onClaimed?: () => void;
};

type ClaimResult = {
  message: string;
  ecoEarned: number;
};

export function QrClaimModal({ open, onClose, onClaimed }: Props) {
  const haptics = useHaptic();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<ClaimResult | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleClaim() {
    if (!code.trim()) {
      setError("Enter a QR code");
      return;
    }

    setError("");
    haptics.impact("medium");

    startTransition(async () => {
      const res = await claimBusinessQr(code.trim());

      if ("error" in res) {
        setError(res.error);
        haptics.notify("error");
      } else {
        setResult({
          message: res.message ?? "Claimed!",
          ecoEarned: res.ecoEarned ?? 0,
        });
        haptics.notify("success");
        onClaimed?.();
      }
    });
  }

  function handleClose() {
    setCode("");
    setError("");
    setResult(null);
    onClose();
  }

  return (
    <Modal open={open} onClose={handleClose} title="Scan QR Code" size="sm">
      <AnimatePresence mode="wait">
        {result ? (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4 py-4"
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: "var(--ec-mint-100)" }}
            >
              <PartyPopper className="w-8 h-8" style={{ color: "var(--ec-mint-600)" }} />
            </div>
            <p className="text-fluid-md font-semibold text-center">{result.message}</p>
            {result.ecoEarned > 0 && (
              <div
                className="flex items-center gap-2 px-4 py-2 rounded-full"
                style={{ background: "var(--ec-mint-50)" }}
              >
                <Zap className="w-5 h-5" style={{ color: "var(--ec-mint-600)" }} />
                <span
                  className="text-fluid-lg font-bold"
                  style={{ color: "var(--ec-mint-700)" }}
                >
                  +{result.ecoEarned} ECO
                </span>
              </div>
            )}
            <Button variant="primary" fullWidth onClick={handleClose}>
              Done
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="input"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="flex flex-col items-center gap-3 py-4">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: "var(--surface-subtle)" }}
              >
                <QrCode className="w-8 h-8" style={{ color: "var(--text-subtle)" }} />
              </div>
              <p className="text-fluid-sm t-muted text-center">
                Enter the code from a business QR sign to earn ECO
              </p>
            </div>

            <Input
              placeholder="Enter QR code..."
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleClaim()}
              className="text-center font-mono tracking-wider"
            />

            {error && (
              <p className="text-fluid-xs text-center" style={{ color: "var(--destructive, #e74c3c)" }}>
                {error}
              </p>
            )}

            <Button
              variant="alive"
              fullWidth
              loading={isPending}
              onClick={handleClaim}
              disabled={!code.trim()}
            >
              Claim ECO
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  );
}
