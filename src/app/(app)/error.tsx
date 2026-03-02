"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error:", error);
  }, [error]);

  return (
    <div className="container-page py-12 flex flex-col items-center text-center">
      <div
        className="inline-flex items-center justify-center w-20 h-20 rounded-2xl"
        style={{
          border: "var(--neo-border-thick) solid var(--ec-danger-border)",
          boxShadow: "var(--neo-shadow-md)",
          background: "var(--surface-base)",
          color: "var(--ec-danger)",
        }}
      >
        <AlertTriangle className="w-10 h-10" />
      </div>
      <h2 className="mt-4 text-fluid-lg uppercase">Something went wrong</h2>
      <p className="t-muted text-fluid-sm mt-2 max-w-sm">
        {error.message || "An unexpected error occurred. Please try again."}
      </p>
      <div className="mt-6">
        <Button variant="primary" onClick={reset}>
          Try again
        </Button>
      </div>
    </div>
  );
}
