"use client";

import { useHaptic } from "@/lib/hooks/use-haptics";
import { Mail } from "lucide-react";
import { LinkButton } from "@/components/ui/link-button";

export default function VerifyEmailPage() {
  // Hook registered so haptic feedback is available if we add interactions later
  useHaptic();

  return (
    <div className="flex flex-col gap-4 items-center text-center">
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center"
        style={{
          background: "var(--ec-mint-100)",
          border: "var(--neo-border-thin) solid var(--ec-mint-300)",
          boxShadow: "var(--neo-shadow-sm)",
        }}
      >
        <Mail className="w-6 h-6" style={{ color: "var(--ec-mint-700)" }} />
      </div>

      <h2 className="text-fluid-lg uppercase">Check your email</h2>

      <p className="t-muted text-fluid-sm">
        We&apos;ve sent a verification link to your email address. Click the
        link to verify your account.
      </p>

      <p className="t-muted text-fluid-sm">
        Didn&apos;t receive the email? Check your spam folder or try signing up
        again.
      </p>

      <div className="flex flex-col gap-2 w-full mt-2">
        <LinkButton href="/login" variant="tertiary" fullWidth>
          Back to login
        </LinkButton>
        <LinkButton href="/signup" variant="secondary" fullWidth>
          Try again
        </LinkButton>
      </div>
    </div>
  );
}
