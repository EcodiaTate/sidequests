import { FileQuestion } from "lucide-react";
import { LinkButton } from "@/components/ui/link-button";

export default function NotFound() {
  return (
    <div className="ios-fill flex items-center justify-center bg-canopy tx-paper">
      <div className="flex flex-col items-center text-center px-4">
        {/* Brutalist 404 badge */}
        <div
          className="inline-flex items-center justify-center w-24 h-24 rounded-2xl"
          style={{
            border: "var(--neo-border-thick) solid var(--ec-forest-800)",
            boxShadow: "var(--neo-shadow-md)",
            background: "var(--surface-base)",
            color: "var(--text-subtle)",
          }}
        >
          <FileQuestion className="w-12 h-12" />
        </div>
        <h1 className="mt-6 text-fluid-2xl uppercase">Page not found</h1>
        <p className="t-muted text-fluid-sm mt-2 max-w-sm">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="mt-6">
          <LinkButton href="/" variant="primary">
            Go home
          </LinkButton>
        </div>
      </div>
    </div>
  );
}
