"use client";

import { useActionState, useEffect } from "react";
import { changePassword } from "@/lib/actions/profile";
import { useHaptic } from "@/lib/hooks/use-haptics";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";

export default function ChangePasswordPage() {
  const haptic = useHaptic();
  const [state, formAction, isPending] = useActionState(changePassword, null);

  useEffect(() => {
    if (state && "success" in state) haptic.notify("success");
    if (state && "error" in state) haptic.notify("error");
  }, [state, haptic]);

  return (
    <div className="container-page py-4 flex flex-col gap-fluid-4 max-w-lg mx-auto">
      <h2 className="text-fluid-lg uppercase">Change password</h2>

      {state && "success" in state && (
        <Alert variant="success">{state.message}</Alert>
      )}
      {state && "error" in state && (
        <Alert variant="error">{state.error}</Alert>
      )}

      <form action={formAction} className="flex flex-col gap-3">
        <Input
          label="New password"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          placeholder="At least 8 characters"
        />
        <Input
          label="Confirm password"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          placeholder="Repeat your new password"
        />
        <Button
          variant="primary"
          type="submit"
          disabled={isPending}
          loading={isPending}
        >
          Update password
        </Button>
      </form>
    </div>
  );
}
