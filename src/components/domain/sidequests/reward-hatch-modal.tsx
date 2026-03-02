"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Zap } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { useHaptic } from "@/lib/hooks/use-haptics";
import { hatchReward } from "@/lib/actions/sidequests";

type Props = {
  submissionId: string;
  open: boolean;
  onClose: () => void;
};

export function RewardHatchModal({ submissionId, open, onClose }: Props) {
  const haptic = useHaptic();
  const [hatching, setHatching] = useState(false);
  const [result, setResult] = useState<{
    eco: number;
    xp: number;
    bonus: boolean;
  } | null>(null);

  const handleHatch = async () => {
    setHatching(true);
    haptic.impact("heavy");

    const res = await hatchReward({ submissionId });

    if ("success" in res) {
      setResult({
        eco: res.eco ?? 0,
        xp: res.xp ?? 0,
        bonus: res.bonus ?? false,
      });
      haptic.notify("success");
    } else {
      haptic.notify("error");
    }

    setHatching(false);
  };

  return (
    <Modal open={open} onClose={onClose} size="sm">
      <div className="flex flex-col items-center text-center gap-4 pad-4">
        {!result ? (
          <>
            <motion.div
              animate={hatching ? { scale: [1, 1.2, 0.9, 1.1, 1] } : {}}
              transition={{ duration: 0.6 }}
            >
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{
                  background: "var(--ec-mint-100)",
                  border: "var(--neo-border-mid) solid var(--ec-mint-300)",
                  boxShadow: "var(--neo-shadow-mint)",
                }}
              >
                <Sparkles
                  className="w-10 h-10"
                  style={{ color: "var(--ec-mint-600)" }}
                />
              </div>
            </motion.div>

            <h3 className="text-fluid-lg font-bold t-strong uppercase">
              Your reward is ready!
            </h3>
            <p className="text-fluid-sm t-muted">
              Tap to reveal what you earned.
            </p>

            <Button
              variant="alive"
              onClick={handleHatch}
              loading={hatching}
              disabled={hatching}
              fullWidth
            >
              Hatch reward
            </Button>
          </>
        ) : (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
            >
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{ background: "var(--ec-mint-100)" }}
              >
                <Zap
                  className="w-10 h-10"
                  style={{ color: "var(--ec-mint-600)" }}
                />
              </div>
            </motion.div>

            <h3 className="text-fluid-lg font-bold t-strong uppercase">
              {result.bonus ? "Bonus reward!" : "Nice work!"}
            </h3>

            <div className="flex items-center gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center"
              >
                <p className="text-fluid-2xl font-bold"
                  style={{ color: "var(--ec-mint-600)" }}>
                  +{result.eco}
                </p>
                <p className="text-fluid-xs t-muted">ECO</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-center"
              >
                <p className="text-fluid-2xl font-bold"
                  style={{ color: "var(--ec-gold-500)" }}>
                  +{result.xp}
                </p>
                <p className="text-fluid-xs t-muted">XP</p>
              </motion.div>
            </div>

            {result.bonus && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-fluid-xs font-medium"
                style={{ color: "var(--ec-gold-500)" }}
              >
                You got a bonus reward!
              </motion.p>
            )}

            <Button variant="primary" onClick={onClose} fullWidth>
              Done
            </Button>
          </>
        )}
      </div>
    </Modal>
  );
}
