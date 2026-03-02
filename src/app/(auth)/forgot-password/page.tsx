"use client";

import { useActionState, useEffect } from "react";
import { forgotPassword } from "@/lib/actions/auth";
import { useHaptic } from "@/lib/hooks/use-haptics";
import Link from "next/link";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { LinkButton } from "@/components/ui/link-button";

export default function ForgotPasswordPage() {
  const haptic = useHaptic();
  const [state, formAction, isPending] = useActionState(forgotPassword, null);

  useEffect(() => {
    if (state && "error" in state) haptic.notify("error");
    if (state && "success" in state) haptic.notify("success");
  }, [state, haptic]);

  // Show confirmation UI after submission
  if (state && "success" in state && state.success) {
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
        <p className="t-muted text-fluid-sm">{state.message}</p>
        <LinkButton href="/login" variant="tertiary" fullWidth className="mt-2">
          Back to login
        </LinkButton>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-fluid-lg uppercase">Reset password</h2>
      <p className="t-muted text-fluid-sm">
        Enter your email and we&apos;ll send you a reset link.
      </p>

      {state && "error" in state && (
        <Alert variant="error">{state.error}</Alert>
      )}

      <form action={formAction} className="flex flex-col gap-3">
        <Input
          type="email"
          name="email"
          placeholder="Email"
          autoComplete="email"
          required
        />
        <Button
          variant="primary"
          type="submit"
          fullWidth
          disabled={isPending}
          loading={isPending}
        >
          Send reset link
        </Button>
      </form>

      <Link href="/login" className="t-link text-center text-fluid-sm">
        Back to login
      </Link>
    </div>
  );
}
