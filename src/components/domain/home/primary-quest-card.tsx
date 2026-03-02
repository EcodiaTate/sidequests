import { Compass, ArrowRight } from "lucide-react";
import Link from "next/link";

export function PrimaryQuestCard() {
  return (
    <div
      className="card pad-4 relative overflow-hidden"
      style={{
        background: "var(--ec-forest-950)",
        borderColor: "var(--ec-mint-500)",
        boxShadow: "var(--neo-shadow-md)",
      }}
    >
      {/* Grid texture */}
      <div
        className="absolute inset-0 tx-dotgrid pointer-events-none"
        style={{ opacity: 0.3 }}
      />

      <div className="relative flex items-center gap-4">
        <div
          style={{
            background: "var(--ec-forest-800)",
            border: "2px solid var(--ec-mint-600)",
            borderRadius: "var(--ec-r-sm)",
            boxShadow: "3px 3px 0 var(--ec-mint-800)",
            padding: "12px",
            flexShrink: 0,
          }}
        >
          <Compass
            className="w-8 h-8"
            style={{ color: "var(--ec-mint-400)" }}
          />
        </div>

        <div className="flex-1 min-w-0">
          <p
            className="stamp mb-1"
            style={{ color: "var(--ec-forest-500)", letterSpacing: "0.25em" }}
          >
            ACTIVE QUEST
          </p>
          <h3
            className="text-fluid-md font-heading uppercase leading-tight"
            style={{ color: "var(--ec-forest-200)" }}
          >
            No active quest
          </h3>
          <p
            className="text-fluid-xs mt-1"
            style={{ color: "var(--ec-forest-500)" }}
          >
            Explore quests to earn ECO and make an impact.
          </p>
        </div>

        <Link
          href="/quests"
          className="flex items-center gap-1.5 px-3 py-2 active-push touch-target shrink-0"
          style={{
            background: "var(--ec-mint-500)",
            color: "var(--ec-forest-950)",
            border: "2px solid var(--ec-mint-700)",
            borderRadius: "var(--ec-r-sm)",
            boxShadow: "3px 3px 0 var(--ec-mint-800)",
            fontFamily: "var(--ec-font-mono)",
            fontSize: "0.7rem",
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            textDecoration: "none",
          }}
        >
          Explore
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
