import { LoadingGrid } from "@/components/ui/loading-skeleton";

export default function Loading() {
  return (
    <div style={{ padding: "var(--space-3)", display: "flex", flexDirection: "column", gap: "0" }}>
      {/* Skeleton header tab */}
      <div
        style={{
          display: "inline-block",
          width: "120px",
          height: "30px",
          background: "var(--ec-forest-200)",
          border: "3px solid var(--ec-forest-300)",
          borderBottom: "none",
          animation: "ec-shimmer 1.5s ease-in-out infinite",
          backgroundSize: "400% 100%",
        }}
      />
      {/* Skeleton content box */}
      <div
        style={{
          border: "3px solid var(--ec-forest-300)",
          boxShadow: "6px 6px 0 var(--ec-forest-300)",
          padding: "var(--space-3)",
          background: "var(--surface-base)",
        }}
      >
        {/* Skeleton heading */}
        <div
          className="animate-shimmer"
          style={{
            height: "2rem",
            width: "40%",
            marginBottom: "var(--space-3)",
          }}
        />
        <LoadingGrid count={6} />
      </div>
    </div>
  );
}
