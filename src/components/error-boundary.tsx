"use client";

import { useEffect } from "react";

export function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="max-w-md rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <h1 className="mb-2 text-2xl font-bold text-red-900">
          Something went wrong
        </h1>
        <p className="mb-4 text-sm text-red-700">
          {error.message || "An unexpected error occurred"}
        </p>
        <div className="space-x-2">
          <button
            onClick={reset}
            className="rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-block rounded border border-red-600 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}
