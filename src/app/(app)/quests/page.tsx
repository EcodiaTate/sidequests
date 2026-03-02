import { getSidequests } from "@/lib/actions/sidequests";
import { QuestListClient } from "@/components/domain/sidequests/quest-list-client";
import { OrbAssistant } from "@/components/domain/sidequests/orb-assistant";

export default async function QuestsPage() {
  const result = await getSidequests({ page: 1 });

  return (
    <div style={{ padding: "var(--space-3)", display: "flex", flexDirection: "column", gap: "0" }}>
      {/* Brutalist section header */}
      <div
        style={{
          display: "inline-block",
          width: "fit-content",
          background: "var(--ec-mint-500)",
          border: "3px solid var(--ec-forest-800)",
          borderBottom: "none",
          padding: "0.4rem 1rem",
        }}
      >
        <span
          style={{
            fontFamily: "var(--ec-font-mono)",
            fontSize: "0.6rem",
            fontWeight: 700,
            letterSpacing: "0.35em",
            textTransform: "uppercase",
            color: "var(--ec-forest-950)",
          }}
        >
          🌿 SIDEQUESTS
        </span>
      </div>

      {/* Content box */}
      <div
        style={{
          border: "3px solid var(--ec-forest-800)",
          boxShadow: "6px 6px 0 var(--ec-mint-500)",
          background: "var(--surface-base)",
          overflow: "hidden",
        }}
      >
        {/* Inner heading */}
        <div
          style={{
            padding: "var(--space-3) var(--space-3) 0",
            display: "flex",
            alignItems: "baseline",
            gap: "0.75rem",
          }}
        >
          <h1
            style={{
              fontFamily: "var(--ec-font-head)",
              fontSize: "clamp(1.5rem, 5vw, 2.5rem)",
              fontWeight: 800,
              letterSpacing: "0.04em",
              lineHeight: 1,
              textTransform: "uppercase",
              color: "var(--text-strong)",
            }}
          >
            SIDEQUESTS
          </h1>
          {result.count > 0 && (
            <span
              style={{
                fontFamily: "var(--ec-font-mono)",
                fontSize: "0.6rem",
                fontWeight: 700,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "var(--ec-mint-600)",
                background: "var(--ec-mint-50)",
                border: "2px solid var(--ec-mint-300)",
                padding: "0.2rem 0.6rem",
                boxShadow: "2px 2px 0 var(--ec-mint-600)",
              }}
            >
              {result.count}
            </span>
          )}
        </div>

        <div style={{ padding: "var(--space-3)" }}>
          <QuestListClient
            initialQuests={result.data}
            initialCount={result.count}
          />
        </div>
      </div>

      {/* OrbAssistant is fixed-position, placement here is just for tree clarity */}
      <OrbAssistant />
    </div>
  );
}
