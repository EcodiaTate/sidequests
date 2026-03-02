"use client";

import { useState, useActionState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sprout,
  Store,
  Palette,
  Handshake,
  ChevronRight,
  ChevronLeft,
  Check,
} from "lucide-react";
import { acceptLegalOnboarding } from "@/lib/actions/profile";
import { useHaptic } from "@/lib/hooks/use-haptics";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

const roles = [
  {
    value: "youth" as const,
    label: "Youth",
    description: "Complete sidequests, earn ECO, make an impact",
    icon: Sprout,
  },
  {
    value: "business" as const,
    label: "Business",
    description: "Connect with eco-conscious customers",
    icon: Store,
  },
  {
    value: "creative" as const,
    label: "Creative",
    description: "Sell upcycled goods on Studio",
    icon: Palette,
  },
  {
    value: "partner" as const,
    label: "Partner",
    description: "Organizational partnerships",
    icon: Handshake,
  },
];

export default function OnboardingPage() {
  const haptic = useHaptic();
  const [step, setStep] = useState(0);
  const [role, setRole] = useState<string>("");
  const [over18, setOver18] = useState(false);
  const [tosAccepted, setTosAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  const [state, formAction, isPending] = useActionState(
    acceptLegalOnboarding,
    null
  );

  useEffect(() => {
    if (state && "error" in state) {
      haptic.notify("error");
    }
  }, [state, haptic]);

  const canAdvance = () => {
    if (step === 0) return !!role;
    if (step === 1) return over18;
    if (step === 2) return tosAccepted && privacyAccepted;
    return false;
  };

  const nextStep = () => {
    if (canAdvance()) {
      haptic.impact("medium");
      setStep((s) => s + 1);
    }
  };

  const prevStep = () => {
    haptic.impact("light");
    setStep((s) => Math.max(0, s - 1));
  };

  const handleSubmit = () => {
    haptic.impact("heavy");
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Progress dots */}
      <div className="flex items-center justify-center gap-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn(
              "w-2 h-2 rounded-full transition-all duration-300",
              i === step ? "w-6" : "",
              i <= step ? "" : "opacity-30"
            )}
            style={{
              background:
                i <= step
                  ? "var(--ec-mint-500)"
                  : "var(--ec-gray-300)",
            }}
          />
        ))}
      </div>

      {state && "error" in state && (
        <Alert variant="error">{state.error}</Alert>
      )}

      <AnimatePresence mode="wait">
        {/* Step 0: Role Selection */}
        {step === 0 && (
          <motion.div
            key="role"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <h3 className="text-fluid-lg uppercase mb-1">
              How will you use Ecodia?
            </h3>
            <p className="t-muted text-fluid-sm mb-4">
              You can change this later in settings.
            </p>

            <div className="grid grid-cols-2 gap-3">
              {roles.map((r) => {
                const Icon = r.icon;
                const selected = role === r.value;
                return (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => {
                      setRole(r.value);
                      haptic.impact("medium");
                    }}
                    className={cn(
                      "card card-interactive pad-3 text-left flex flex-col gap-2 active-push touch-target transition-all"
                    )}
                    style={
                      selected
                        ? {
                            border: "var(--neo-border-mid) solid var(--ec-mint-500)",
                            boxShadow: "var(--neo-shadow-md)",
                          }
                        : {
                            border: "var(--neo-border-thin) solid var(--border)",
                            boxShadow: "var(--neo-shadow-sm)",
                          }
                    }
                  >
                    <div
                      style={{
                        color: selected
                          ? "var(--ec-mint-600)"
                          : "var(--text-muted)",
                      }}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="font-semibold text-fluid-sm">
                      {r.label}
                    </span>
                    <span className="text-fluid-xs t-muted">
                      {r.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Step 1: Age Confirmation */}
        {step === 1 && (
          <motion.div
            key="age"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <h3 className="text-fluid-lg uppercase mb-1">Age confirmation</h3>
            <p className="t-muted text-fluid-sm mb-4">
              To use Ecodia, you must be 18 years or older.
            </p>

            <label className="flex items-start gap-3 active-push touch-target cursor-pointer card pad-3" style={{ border: "var(--neo-border-thin) solid var(--border)", boxShadow: "var(--neo-shadow-sm)" }}>
              <input
                type="checkbox"
                checked={over18}
                onChange={(e) => {
                  setOver18(e.target.checked);
                  haptic.impact("light");
                }}
                className="mt-0.5 w-5 h-5 shrink-0 accent-[var(--ec-mint-500)]"
              />
              <span className="text-fluid-sm">
                I confirm I am 18 years of age or older
              </span>
            </label>
          </motion.div>
        )}

        {/* Step 2: Legal Acceptance */}
        {step === 2 && (
          <motion.div
            key="legal"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <h3 className="text-fluid-lg uppercase mb-1">Almost there</h3>
            <p className="t-muted text-fluid-sm mb-4">
              Please review and accept our policies.
            </p>

            <div className="flex flex-col gap-3">
              <label className="flex items-start gap-3 active-push touch-target cursor-pointer card pad-3" style={{ border: "var(--neo-border-thin) solid var(--border)", boxShadow: "var(--neo-shadow-sm)" }}>
                <input
                  type="checkbox"
                  checked={tosAccepted}
                  onChange={(e) => {
                    setTosAccepted(e.target.checked);
                    haptic.impact("light");
                  }}
                  className="mt-0.5 w-5 h-5 shrink-0 accent-[var(--ec-mint-500)]"
                />
                <span className="text-fluid-sm">
                  I have read and agree to the{" "}
                  <a
                    href="/legal/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="t-link underline"
                  >
                    Terms of Service
                  </a>
                </span>
              </label>

              <label className="flex items-start gap-3 active-push touch-target cursor-pointer card pad-3" style={{ border: "var(--neo-border-thin) solid var(--border)", boxShadow: "var(--neo-shadow-sm)" }}>
                <input
                  type="checkbox"
                  checked={privacyAccepted}
                  onChange={(e) => {
                    setPrivacyAccepted(e.target.checked);
                    haptic.impact("light");
                  }}
                  className="mt-0.5 w-5 h-5 shrink-0 accent-[var(--ec-mint-500)]"
                />
                <span className="text-fluid-sm">
                  I have read and agree to the{" "}
                  <a
                    href="/legal/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="t-link underline"
                  >
                    Privacy Policy
                  </a>
                </span>
              </label>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation buttons */}
      <div className="flex items-center gap-3 mt-2">
        {step > 0 && (
          <Button
            variant="tertiary"
            onClick={prevStep}
            icon={<ChevronLeft className="w-4 h-4" />}
          >
            Back
          </Button>
        )}

        <div className="flex-1" />

        {step < 2 ? (
          <Button
            variant="primary"
            onClick={nextStep}
            disabled={!canAdvance()}
            iconRight={<ChevronRight className="w-4 h-4" />}
          >
            Continue
          </Button>
        ) : (
          <form action={formAction}>
            <input type="hidden" name="role" value={role} />
            <input
              type="hidden"
              name="over18Confirmed"
              value={over18 ? "true" : "false"}
            />
            <input
              type="hidden"
              name="tosAccepted"
              value={tosAccepted ? "true" : "false"}
            />
            <input
              type="hidden"
              name="privacyAccepted"
              value={privacyAccepted ? "true" : "false"}
            />
            <Button
              variant="alive"
              type="submit"
              disabled={!canAdvance() || isPending}
              loading={isPending}
              onClick={handleSubmit}
              icon={<Check className="w-4 h-4" />}
            >
              Get started
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
