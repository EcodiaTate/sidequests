"use client";

import { useActionState } from "react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { useHaptic } from "@/lib/hooks/use-haptics";
import { createTeam } from "@/lib/actions/social";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
};

export function CreateTeamModal({ open, onClose, onCreated }: Props) {
  const haptic = useHaptic();

  const [state, formAction, isPending] = useActionState(
    async (prev: { error: string } | { success: true; message?: string } | null, formData: FormData) => {
      const result = await createTeam(prev, formData);
      if ("success" in result) {
        haptic.impact("heavy");
        onCreated?.();
        onClose();
      } else {
        haptic.notify("error");
      }
      return result;
    },
    null
  );

  return (
    <Modal open={open} onClose={onClose} title="Create team" size="sm">
      <form action={formAction} className="flex flex-col gap-4">
        {state && "error" in state && (
          <Alert variant="error">{state.error}</Alert>
        )}
        <Input
          name="name"
          label="Team name"
          placeholder="e.g. Green Warriors"
          required
          minLength={2}
          maxLength={50}
        />
        <Textarea
          name="description"
          label="Description (optional)"
          placeholder="What's your team about?"
          maxLength={300}
        />
        <Button
          variant="alive"
          type="submit"
          loading={isPending}
          disabled={isPending}
          fullWidth
        >
          Create team
        </Button>
      </form>
    </Modal>
  );
}
