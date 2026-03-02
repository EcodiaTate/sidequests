"use client";

import { useActionState, useEffect } from "react";
import { signup } from "@/lib/actions/auth";
import { useHaptic } from "@/lib/hooks/use-haptics";
import Link from "next/link";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { LinkButton } from "@/components/ui/link-button";

export default function SignupPage() {
  const haptic = useHaptic();
  const [state, formAction, isPending] = useActionState(signup, null);

  useEffect(() => {
    if (state && "error" in state) haptic.notify("error");
    if (state && "success" in state) haptic.notify("success");
  }, [state, haptic]);

  // Show confirmation UI after successful signup
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
      <h2 className="text-fluid-lg uppercase">Create account</h2>

      {state && "error" in state && (
        <Alert variant="error">{state.error}</Alert>
      )}

      <form action={formAction} className="flex flex-col gap-3">
        <Input
          type="text"
          name="displayName"
          placeholder="Display name"
          autoComplete="name"
          required
          minLength={2}
          maxLength={50}
        />
        <Input
          type="email"
          name="email"
          placeholder="Email"
          autoComplete="email"
          required
        />
        <Input
          type="password"
          name="password"
          placeholder="Password (8+ characters)"
          autoComplete="new-password"
          required
          minLength={8}
        />
        <Button
          variant="primary"
          type="submit"
          fullWidth
          disabled={isPending}
          loading={isPending}
        >
          Sign up
        </Button>
      </form>

      <p className="t-muted text-center text-fluid-sm">
        Already have an account?{" "}
        <Link href="/login" className="t-link">
          Log in
        </Link>
      </p>
    </div>
  );
}
