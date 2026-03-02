"use client";

import { useActionState, useEffect, useState } from "react";
import { login } from "@/lib/actions/auth";
import { useHaptic } from "@/lib/hooks/use-haptics";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";

export default function LoginPage() {
  const haptic = useHaptic();
  const [state, formAction, isPending] = useActionState(login, null);
  const [params, setParams] = useState<URLSearchParams | null>(null);

  useEffect(() => {
    setParams(new URLSearchParams(window.location.search));
  }, []);

  useEffect(() => {
    if (state && "error" in state) {
      haptic.notify("error");
    }
  }, [state, haptic]);

  const showPasswordUpdated = params?.get("message") === "password-updated";
  const showAuthError = params?.get("error") === "auth-code-exchange-failed";

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-fluid-lg uppercase">Log in</h2>

      {showPasswordUpdated && (
        <Alert variant="success">
          Password updated successfully. You can now log in.
        </Alert>
      )}

      {showAuthError && (
        <Alert variant="error">
          Email confirmation failed. Please try again or request a new link.
        </Alert>
      )}

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
        <Input
          type="password"
          name="password"
          placeholder="Password"
          autoComplete="current-password"
          required
        />
        <Button
          variant="primary"
          type="submit"
          fullWidth
          disabled={isPending}
          loading={isPending}
        >
          Log in
        </Button>
      </form>

      <div className="flex flex-col gap-2 text-center text-fluid-sm">
        <Link href="/forgot-password" className="t-link">
          Forgot password?
        </Link>
        <p className="t-muted">
          No account?{" "}
          <Link href="/signup" className="t-link">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
