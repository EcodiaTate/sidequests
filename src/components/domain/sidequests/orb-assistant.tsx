"use client";

import { useState, useRef, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, Sparkles } from "lucide-react";
import { useHaptic } from "@/lib/hooks/use-haptics";
import { searchQuestsNL } from "@/lib/actions/sidequests";
import { OrbAssistantMiniCard } from "./orb-assistant-mini-card";
import type { Sidequest } from "@/types/domain";

const SUGGESTION_CHIPS = [
  { label: "Daily action", query: "daily easy action" },
  { label: "Hard challenge", query: "hard challenge" },
  { label: "Team quest", query: "team group" },
  { label: "Quick win", query: "quick easy fast" },
];

// Typing indicator - 3 bouncing dots
function TypingDots() {
  return (
    <div className="flex items-center gap-1 py-2 px-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full"
          style={{ background: "var(--ec-mint-500)" }}
          animate={{ y: [0, -6, 0] }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.15,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

export function OrbAssistant() {
  const haptics = useHaptic();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Sidequest[] | null>(null);
  const [searchMode, setSearchMode] = useState<"semantic" | "keyword">("keyword");
  const [hasSearched, setHasSearched] = useState(false);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  function openOrb() {
    haptics.impact("medium");
    setIsOpen(true);
    // Focus input after animation
    setTimeout(() => inputRef.current?.focus(), 200);
  }

  function closeOrb() {
    haptics.impact("light");
    setIsOpen(false);
    setQuery("");
    setResults(null);
    setHasSearched(false);
  }

  function handleSearch(searchQuery: string) {
    if (!searchQuery.trim()) return;
    haptics.impact("medium");
    setHasSearched(true);

    startTransition(async () => {
      const result = await searchQuestsNL(searchQuery.trim());
      setResults(result.quests);
      setSearchMode(result.mode);
    });
  }

  function handleChipClick(chipQuery: string) {
    setQuery(chipQuery);
    handleSearch(chipQuery);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      handleSearch(query);
    }
    if (e.key === "Escape") {
      closeOrb();
    }
  }

  return (
    <>
      {/* Floating orb button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            key="orb-btn"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="fixed"
            style={{
              bottom: "calc(var(--tab-bar-height, 80px) + 16px)",
              right: "16px",
              zIndex: "calc(var(--ec-z-sticky, 100) + 10)",
            }}
          >
            <button
              type="button"
              onClick={openOrb}
              className="active-push"
              aria-label="Open Orb quest search"
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background:
                  "radial-gradient(circle at 35% 35%, var(--ec-mint-400), var(--ec-forest-600))",
                border: "2px solid rgba(255,255,255,0.2)",
                boxShadow:
                  "0 4px 20px rgba(127, 208, 105, 0.4), 0 0 0 0 rgba(127, 208, 105, 0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                animation: "eco-glow 3s ease-in-out infinite",
              }}
            >
              <Sparkles
                className="w-6 h-6"
                style={{ color: "var(--ec-pearl)" }}
              />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sheet overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="orb-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0"
            style={{
              zIndex: "calc(var(--ec-z-modal, 200) - 1)",
              background: "rgba(0,0,0,0.4)",
              backdropFilter: "blur(6px)",
            }}
            onClick={closeOrb}
          />
        )}
      </AnimatePresence>

      {/* Expanding sheet from bottom */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="orb-sheet"
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 280 }}
            className="fixed left-0 right-0 bottom-0 flex flex-col"
            style={{
              zIndex: "var(--ec-z-modal, 200)",
              maxHeight: "85dvh",
              borderRadius: "24px 24px 0 0",
              background: "var(--surface-elevated)",
              border: "2px solid var(--border)",
              borderBottom: "none",
              boxShadow: "0 -8px 40px rgba(0,0,0,0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sheet header */}
            <div className="flex items-center justify-between pad-4 pb-2 shrink-0">
              <div className="flex items-center gap-2">
                {/* Mini orb in header */}
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    background:
                      "radial-gradient(circle at 35% 35%, var(--ec-mint-400), var(--ec-forest-600))",
                    animation: isPending ? "eco-mint-pulse 0.8s ease-in-out infinite" : undefined,
                  }}
                >
                  <Sparkles
                    className="w-4 h-4"
                    style={{ color: "var(--ec-pearl)" }}
                  />
                </div>
                <div>
                  <h2 className="text-fluid-md font-semibold uppercase t-strong leading-none">
                    Ask Orb
                  </h2>
                  {isPending ? (
                    <p className="text-fluid-xs t-muted">Searching...</p>
                  ) : hasSearched && results !== null ? (
                    <p className="text-fluid-xs t-muted">
                      {results.length > 0
                        ? `${results.length} quest${results.length !== 1 ? "s" : ""} found`
                        : "No results - try different words"}
                    </p>
                  ) : (
                    <p className="text-fluid-xs t-muted">
                      Find quests with natural language
                    </p>
                  )}
                </div>
              </div>
              <button
                type="button"
                className="active-push touch-target p-1 rounded-xl"
                style={{
                  background: "var(--surface-subtle)",
                  border: "1px solid var(--border)",
                }}
                onClick={closeOrb}
              >
                <X className="w-5 h-5 t-muted" />
              </button>
            </div>

            {/* Search input */}
            <div className="px-4 pb-3 shrink-0">
              <div
                className="flex items-center gap-2 pad-2 rounded-2xl"
                style={{
                  background: "var(--surface-subtle)",
                  border: "2px solid var(--ec-mint-300)",
                }}
              >
                <Search
                  className="w-4 h-4 shrink-0"
                  style={{ color: "var(--ec-mint-600)" }}
                />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Find me something easy near water..."
                  className="flex-1 bg-transparent outline-none text-fluid-sm t-strong placeholder:t-muted"
                  style={{ minWidth: 0 }}
                />
                {query && (
                  <button
                    type="button"
                    className="active-push shrink-0 p-1 rounded-full"
                    onClick={() => setQuery("")}
                  >
                    <X
                      className="w-3.5 h-3.5"
                      style={{ color: "var(--text-muted)" }}
                    />
                  </button>
                )}
              </div>
            </div>

            {/* Suggestion chips */}
            {!hasSearched && !isPending && (
              <div className="flex gap-2 px-4 pb-3 flex-wrap shrink-0">
                {SUGGESTION_CHIPS.map((chip) => (
                  <button
                    key={chip.label}
                    type="button"
                    onClick={() => handleChipClick(chip.query)}
                    className="active-push touch-target text-fluid-xs font-medium px-3 py-2 rounded-full transition-all"
                    style={{
                      background: "var(--ec-mint-50)",
                      border: "1px solid var(--ec-mint-200)",
                      color: "var(--ec-forest-700)",
                    }}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            )}

            {/* Results / typing indicator */}
            <div className="flex-1 overflow-y-auto scroll-native px-4 pb-safe">
              {/* Typing indicator while fetching */}
              {isPending && (
                <div className="flex items-center gap-2 py-2">
                  <TypingDots />
                  <p className="text-fluid-xs t-muted">Orb is thinking...</p>
                </div>
              )}

              {/* Empty results after search */}
              {!isPending && hasSearched && results !== null && results.length === 0 && (
                <div className="flex flex-col items-center gap-2 py-8">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ background: "var(--surface-subtle)" }}
                  >
                    <Sparkles
                      className="w-6 h-6"
                      style={{ color: "var(--empty-state-icon, var(--text-muted))" }}
                    />
                  </div>
                  <p className="text-fluid-sm t-muted text-center">
                    No quests matched. Try different words or a suggestion chip.
                  </p>
                  <button
                    type="button"
                    className="active-push touch-target text-fluid-xs font-medium px-3 py-2 rounded-full"
                    style={{
                      background: "var(--ec-mint-50)",
                      border: "1px solid var(--ec-mint-200)",
                      color: "var(--ec-forest-700)",
                    }}
                    onClick={() => {
                      setHasSearched(false);
                      setResults(null);
                      setQuery("");
                    }}
                  >
                    Clear search
                  </button>
                </div>
              )}

              {/* Quest results */}
              <AnimatePresence>
                {!isPending && results !== null && results.length > 0 && (
                  <motion.div
                    key="results"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col gap-2 pb-4"
                  >
                    {searchMode === "keyword" && (
                      <p
                        className="stamp text-fluid-xs pb-1"
                        style={{ color: "var(--text-muted)" }}
                      >
                        KEYWORD SEARCH - semantic search available when AI enabled
                      </p>
                    )}
                    {results.map((quest, idx) => (
                      <motion.div
                        key={quest.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.15, delay: idx * 0.04 }}
                      >
                        <OrbAssistantMiniCard
                          sidequest={quest}
                          onSelect={closeOrb}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Initial idle state */}
              {!isPending && !hasSearched && (
                <div className="py-4 flex flex-col gap-3">
                  <p className="text-fluid-xs t-muted">
                    Try describing what you want to do in plain English.
                    Orb will find matching sidequests.
                  </p>
                  <div
                    className="pad-3 rounded-2xl"
                    style={{
                      background: "var(--surface-subtle)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <p className="text-fluid-xs t-muted leading-relaxed">
                      <strong className="t-strong">Examples:</strong>
                      {" "}
                      "something easy I can do at home" •
                      "a team challenge about recycling" •
                      "hard photo quest" •
                      "quick daily win"
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Submit bar */}
            {query.trim().length > 0 && !isPending && (
              <div
                className="shrink-0 px-4 py-3"
                style={{
                  borderTop: "1px solid var(--border)",
                  background: "var(--surface-elevated)",
                }}
              >
                <button
                  type="button"
                  className="btn btn-primary active-push touch-target w-full"
                  onClick={() => handleSearch(query)}
                >
                  <Search className="w-4 h-4 mr-2" />
                  Search for "{query.length > 30 ? query.slice(0, 30) + "..." : query}"
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
