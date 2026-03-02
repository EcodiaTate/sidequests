"use client";

import { useActionState, useState } from "react";
import { Camera, Upload, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert } from "@/components/ui/alert";
import { Chip } from "@/components/ui/chip";
import { useHaptic } from "@/lib/hooks/use-haptics";
import { useToast } from "@/components/ui/toast";
import { createSubmission } from "@/lib/actions/sidequests";
import { VERIFICATION_METHODS } from "@/lib/constants/sidequests";
import type { Sidequest } from "@/types/domain";

type Props = {
  sidequest: Sidequest;
  onSuccess?: () => void;
};

export function SubmissionForm({ sidequest, onSuccess }: Props) {
  const haptic = useHaptic();
  const { toast } = useToast();
  const [method, setMethod] = useState<"photo_upload" | "instagram_link">(
    sidequest.verification_methods?.[0] ?? "photo_upload"
  );
  const [visibility, setVisibility] = useState<"public" | "friends" | "private">("public");
  const [preview, setPreview] = useState<string | null>(null);

  const [state, formAction, isPending] = useActionState(
    async (prev: { error: string } | { success: true; message?: string } | null, formData: FormData) => {
      const result = await createSubmission(prev, formData);
      if ("success" in result) {
        haptic.impact("heavy");
        toast("Submission created!", "success");
        onSuccess?.();
      } else {
        haptic.notify("error");
      }
      return result;
    },
    null
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      haptic.impact("light");
    }
  };

  const methods = sidequest.verification_methods ?? ["photo_upload"];

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="sidequestId" value={sidequest.id} />
      <input type="hidden" name="method" value={method} />
      <input type="hidden" name="visibility" value={visibility} />

      {state && "error" in state && (
        <Alert variant="error">{state.error}</Alert>
      )}

      {/* Method selector */}
      {methods.length > 1 && (
        <div>
          <label className="text-fluid-xs font-medium t-strong mb-2 block">
            Verification method
          </label>
          <div className="flex gap-2">
            {methods.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMethod(m);
                  haptic.impact("light");
                }}
              >
                <Chip variant={method === m ? "primary" : "secondary"}>
                  {VERIFICATION_METHODS[m].label}
                </Chip>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Photo upload */}
      {method === "photo_upload" && (
        <div>
          <label className="text-fluid-xs font-medium t-strong mb-2 block">
            Upload proof
          </label>
          {preview ? (
            <div className="relative">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-48 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => setPreview(null)}
                className="absolute top-2 right-2 card pad-1 text-fluid-xs active-push"
              >
                Change
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center gap-2 pad-4 border-2 border-dashed rounded-lg cursor-pointer active-push touch-target"
              style={{ borderColor: "var(--border)" }}>
              <div className="flex items-center gap-2 t-muted">
                <Camera className="w-5 h-5" />
                <Upload className="w-5 h-5" />
              </div>
              <span className="text-fluid-xs t-muted">
                Tap to take or choose a photo
              </span>
              <input
                type="file"
                name="media"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="sr-only"
              />
            </label>
          )}
        </div>
      )}

      {/* Instagram link */}
      {method === "instagram_link" && (
        <div>
          <label className="text-fluid-xs font-medium t-strong mb-2 block">
            Instagram post URL
          </label>
          <input
            type="url"
            name="instagramUrl"
            placeholder="https://www.instagram.com/p/..."
            className="input"
          />
        </div>
      )}

      {/* Caption */}
      <Textarea
        name="caption"
        label="Caption (optional)"
        placeholder="Tell us about your experience..."
        maxLength={500}
      />

      {/* Visibility */}
      <div>
        <label className="text-fluid-xs font-medium t-strong mb-2 flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5" />
          Visibility
        </label>
        <div className="flex gap-2">
          {(["public", "friends", "private"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => {
                setVisibility(v);
                haptic.impact("light");
              }}
            >
              <Chip variant={visibility === v ? "primary" : "secondary"}>
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </Chip>
            </button>
          ))}
        </div>
      </div>

      <Button
        variant="alive"
        type="submit"
        loading={isPending}
        disabled={isPending}
        fullWidth
      >
        Submit
      </Button>
    </form>
  );
}
