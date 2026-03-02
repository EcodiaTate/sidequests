"use client";

import { useState, useEffect } from "react";
import { Monitor, Sun, Moon } from "lucide-react";
import { useHaptic } from "@/lib/hooks/use-haptics";
import { cn } from "@/lib/utils";

type Theme = "system" | "light" | "dark";

const themes: { value: Theme; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: "system", label: "System", icon: Monitor },
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
];

function applyTheme(theme: Theme) {
  const html = document.documentElement;
  if (theme === "system") {
    html.removeAttribute("data-theme");
  } else {
    html.setAttribute("data-theme", theme);
  }
}

export default function AppearancePage() {
  const haptic = useHaptic();
  const [current, setCurrent] = useState<Theme>("system");

  useEffect(() => {
    const stored = localStorage.getItem("ecodia-theme") as Theme | null;
    if (stored) {
      setCurrent(stored);
      applyTheme(stored);
    }
  }, []);

  const selectTheme = (theme: Theme) => {
    setCurrent(theme);
    applyTheme(theme);
    localStorage.setItem("ecodia-theme", theme);
    haptic.impact("light");
  };

  return (
    <div className="container-page py-4 flex flex-col gap-fluid-4 max-w-lg mx-auto">
      <h2 className="text-fluid-lg uppercase">Appearance</h2>
      <p className="t-muted text-fluid-sm">
        Choose how Ecodia looks on your device.
      </p>

      <div className="grid grid-cols-3 gap-3">
        {themes.map((t) => {
          const Icon = t.icon;
          const selected = current === t.value;
          return (
            <button
              key={t.value}
              type="button"
              onClick={() => selectTheme(t.value)}
              className={cn(
                "card card-interactive active-push touch-target flex flex-col items-center gap-2 pad-3 transition-all"
              )}
              style={
                selected
                  ? { border: "var(--neo-border-mid) solid var(--ec-mint-500)", boxShadow: "var(--neo-shadow-md)" }
                  : { border: "var(--neo-border-thin) solid var(--border)", boxShadow: "var(--neo-shadow-sm)" }
              }
            >
              <div
                style={{
                  color: selected
                    ? "var(--ec-mint-600)"
                    : "var(--text-muted)",
                }}
              >
                <Icon className="w-6 h-6" />
              </div>
              <span
                className={cn(
                  "text-fluid-sm",
                  selected ? "font-semibold t-strong" : "t-muted"
                )}
              >
                {t.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
