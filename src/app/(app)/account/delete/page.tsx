"use client";

import { useState } from "react";
import { deleteAccount } from "@/lib/actions/profile";
import { useHaptic } from "@/lib/hooks/use-haptics";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Alert } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

export default function DeleteAccountPage() {
  const haptic = useHaptic();
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canDelete = confirmText === "DELETE";

  const handleDelete = async () => {
    if (!canDelete) return;
    setDeleting(true);
    setError(null);
    haptic.impact("heavy");

    const result = await deleteAccount();
    if ("error" in result) {
      setError(result.error);
      setDeleting(false);
      haptic.notify("error");
    }
    // On success, the server action redirects to /login
  };

  return (
    <div className="container-page py-4 flex flex-col gap-fluid-4 max-w-lg mx-auto">
      <h2 className="text-fluid-lg uppercase">Delete account</h2>

      <Alert variant="warning">
        This action is <strong>permanent</strong> and cannot be undone. All your
        data, ECO balance, badges, and submissions will be permanently deleted.
      </Alert>

      {error && <Alert variant="error">{error}</Alert>}

      <Button
        variant="danger"
        onClick={() => {
          setShowConfirm(true);
          haptic.impact("medium");
        }}
        icon={<AlertTriangle className="w-4 h-4" />}
      >
        Delete my account
      </Button>

      <Modal
        open={showConfirm}
        onClose={() => {
          setShowConfirm(false);
          setConfirmText("");
        }}
        title="Are you sure?"
        description="Type DELETE to confirm permanent account deletion."
        size="sm"
      >
        <div className="flex flex-col gap-3">
          <Input
            name="confirm"
            placeholder='Type "DELETE" to confirm'
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            autoComplete="off"
          />
          <div className="flex gap-2">
            <Button
              variant="tertiary"
              onClick={() => {
                setShowConfirm(false);
                setConfirmText("");
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              disabled={!canDelete || deleting}
              loading={deleting}
              className="flex-1"
            >
              Delete forever
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
