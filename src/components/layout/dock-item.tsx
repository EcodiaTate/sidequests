"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useHaptic } from "@/lib/hooks/use-haptics";
import { cn } from "@/lib/utils";
import type { DockNavItem } from "./dock-types";
import { DOCK_ICON_MAP } from "./dock-icons";

type DockItemProps = {
  item: DockNavItem;
  orientation: "horizontal" | "vertical";
  showLabel?: boolean;
  compact?: boolean;
};

export function DockItem({
  item,
  orientation,
  showLabel = true,
  compact,
}: DockItemProps) {
  const pathname = usePathname();
  const haptic = useHaptic();

  const isActive =
    pathname === item.href || pathname.startsWith(item.href + "/");
  const Icon = DOCK_ICON_MAP[item.icon];

  if (orientation === "horizontal") {
    return (
      <Link
        href={item.href}
        onClick={() => haptic.impact("light")}
        className={cn(
          "mobile-tab-bar-item touch-target relative",
          isActive && "is-active"
        )}
        aria-current={isActive ? "page" : undefined}
        style={isActive ? {
          color: "var(--ec-forest-950)",
          background: "var(--ec-mint-500)",
          borderTop: "3px solid var(--ec-mint-300)",
          marginTop: "-3px",
          filter: "none",
        } : undefined}
      >
        {Icon && (
          <Icon
            className={cn("w-5 h-5", isActive ? "stroke-[2.5px]" : "stroke-2")}
          />
        )}
        {showLabel && (
          <span
            style={{
              fontSize: "0.55rem",
              lineHeight: 1.2,
              fontFamily: "var(--ec-font-mono)",
              fontWeight: isActive ? 800 : 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: isActive ? "var(--ec-forest-950)" : undefined,
            }}
          >
            {item.label}
          </span>
        )}
        {item.badge && item.badge > 0 && (
          <span
            className="absolute top-0.5 right-0.5"
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "var(--ec-gold-500)",
              border: "2px solid var(--ec-forest-950)",
            }}
          />
        )}
      </Link>
    );
  }

  // Vertical (desktop rail)
  return (
    <Link
      href={item.href}
      onClick={() => haptic.impact("light")}
      className={cn(
        "dock-nav-item flex-row w-full relative",
        isActive ? "dock-nav-item--active" : ""
      )}
      aria-current={isActive ? "page" : undefined}
      style={{
        padding: "0.625rem 0.75rem",
        borderRadius: 0,
        ...(isActive ? {
          background: "var(--ec-mint-500)",
          color: "var(--ec-forest-950)",
          borderLeft: "4px solid var(--ec-mint-300)",
          boxShadow: "4px 0 0 var(--ec-mint-800) inset, 3px 3px 0 var(--ec-mint-700)",
        } : {
          borderLeft: "4px solid transparent",
        }),
      }}
    >
      {Icon && (
        <Icon
          className={cn(
            "w-4 h-4 shrink-0 mr-3",
            isActive ? "stroke-[2.5px]" : "stroke-2"
          )}
          style={{ color: isActive ? "var(--ec-forest-950)" : undefined }}
        />
      )}
      {showLabel && (
        <span
          style={{
            fontSize: "var(--text-sm)",
            fontFamily: isActive ? "var(--ec-font-head)" : "var(--ec-font-body)",
            fontWeight: isActive ? 800 : 500,
            textTransform: isActive ? "uppercase" : "none",
            letterSpacing: isActive ? "0.06em" : "normal",
            color: isActive ? "var(--ec-forest-950)" : undefined,
          }}
        >
          {item.label}
        </span>
      )}
      {item.badge && item.badge > 0 && (
        <span
          className="ml-auto flex items-center justify-center text-[0.6rem] font-bold"
          style={{
            minWidth: "1.25rem",
            height: "1.25rem",
            background: "var(--ec-gold-500)",
            color: "var(--ec-forest-950)",
            border: "2px solid var(--ec-forest-800)",
            boxShadow: "2px 2px 0 var(--ec-forest-900)",
            fontFamily: "var(--ec-font-mono)",
            fontSize: "0.55rem",
            fontWeight: 800,
            letterSpacing: "0.05em",
            padding: "0 0.25rem",
          }}
        >
          {item.badge > 9 ? "9+" : item.badge}
        </span>
      )}
    </Link>
  );
}
