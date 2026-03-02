"use client";

import { useState } from "react";
import { Share2, Download, ImageIcon } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { useHaptic } from "@/lib/hooks/use-haptics";

type Template = "clean" | "poster" | "polaroid";

type Props = {
  userId: string;
  displayName: string;
  ecoBalance: number;
  totalSubmissions: number;
  level: number;
  streakDays: number;
};

const TEMPLATES: { id: Template; label: string; desc: string; size: string }[] = [
  { id: "clean", label: "Clean", desc: "Minimal white card, great for any platform", size: "1200×630" },
  { id: "poster", label: "Poster", desc: "Dark forest green with bold neon mint stats", size: "1200×630" },
  { id: "polaroid", label: "Polaroid", desc: "Square format, perfect for Instagram", size: "1080×1080" },
];

function buildImageUrl(userId: string, template: Template): string {
  return `/api/impact-card?userId=${encodeURIComponent(userId)}&template=${template}`;
}

export function ShareImpactCard({ userId, displayName, ecoBalance, totalSubmissions, level, streakDays }: Props) {
  const haptic = useHaptic();
  const [open, setOpen] = useState(false);
  const [template, setTemplate] = useState<Template>("clean");
  const [generated, setGenerated] = useState(false);

  const imageUrl = buildImageUrl(userId, template);
  const shareTitle = `${displayName}'s Ecodia Impact`;
  const shareText = `I've earned ${ecoBalance.toLocaleString()} ECO and completed ${totalSubmissions} eco actions on Ecodia! Join me 🌿`;

  function handleGenerate() {
    haptic.impact("medium");
    setGenerated(true);
    setOpen(true);
  }

  function handleTemplateChange(t: Template) {
    haptic.selection();
    setTemplate(t);
    setGenerated(false);
  }

  async function handleShare() {
    haptic.impact("medium");
    const url = imageUrl;

    // Try Capacitor Share if available
    try {
      const { Capacitor } = await import("@capacitor/core");
      if (Capacitor.isNativePlatform()) {
        // Use dynamic require-style import to avoid TS module resolution
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const cap = Capacitor as any;
        if (cap.Plugins?.Share) {
          await cap.Plugins.Share.share({ title: shareTitle, text: shareText, url });
          haptic.notify("success");
          return;
        }
      }
    } catch {
      // not on native, fall through
    }

    // Web Share API
    if (navigator.share) {
      try {
        await navigator.share({ title: shareTitle, text: shareText, url });
        haptic.notify("success");
        return;
      } catch {
        // user cancelled or API failed
      }
    }

    // Fallback: copy link
    await navigator.clipboard.writeText(url);
    haptic.notify("success");
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Share2 className="w-5 h-5" style={{ color: "var(--ec-mint-600)" }} />
        <h3 className="text-fluid-md uppercase">Share Your Impact</h3>
      </div>

      {/* Template selector */}
      <div className="grid grid-cols-3 gap-2">
        {TEMPLATES.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => handleTemplateChange(t.id)}
            className="card pad-3 text-left active-push touch-target flex flex-col gap-1"
            style={{
              border: template === t.id ? "2px solid var(--ec-mint-600)" : "var(--neo-border-thin) solid var(--border)",
              background: template === t.id ? "var(--ec-mint-50)" : "var(--surface-base)",
            }}
          >
            <span className="text-fluid-xs font-bold uppercase" style={{ color: "var(--text-strong)" }}>{t.label}</span>
            <span className="text-fluid-xs t-muted">{t.desc}</span>
            <span className="text-fluid-xs font-mono" style={{ color: "var(--text-subtle)" }}>{t.size}</span>
          </button>
        ))}
      </div>

      <Button
        variant="primary"
        fullWidth
        icon={<ImageIcon className="w-4 h-4" />}
        onClick={handleGenerate}
      >
        Generate Card
      </Button>

      <Modal open={open} onClose={() => setOpen(false)} title="Your Impact Card" size="lg">
        <div className="space-y-4">
          {/* Image preview */}
          <div
            className="rounded-xl overflow-hidden border border-border"
            style={{ aspectRatio: template === "polaroid" ? "1/1" : "1200/630", background: "var(--surface-subtle)" }}
          >
            {generated && (
              <img
                src={imageUrl}
                alt="Impact card preview"
                className="w-full h-full object-contain"
                onError={() => setGenerated(false)}
              />
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <a
              href={imageUrl}
              download={`ecodia-impact-${template}.png`}
              className="flex-1"
              onClick={() => haptic.impact("light")}
            >
              <Button variant="secondary" fullWidth icon={<Download className="w-4 h-4" />}>
                Download
              </Button>
            </a>
            <Button
              variant="primary"
              className="flex-1"
              icon={<Share2 className="w-4 h-4" />}
              onClick={handleShare}
            >
              Share
            </Button>
          </div>

          <p className="text-fluid-xs t-muted text-center">
            Tip: download and post on social media tagging @ecodia
          </p>
        </div>
      </Modal>
    </div>
  );
}
