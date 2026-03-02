"use client";

import { cn } from "@/lib/utils";
import { LogOut } from "lucide-react";
import { signOut } from "@/lib/actions/auth";
import { Avatar } from "@/components/ui/avatar";
import type { DockNavItem } from "./dock-types";
import { DockItem } from "./dock-item";
import type { Profile } from "@/types/domain";

type DockRailProps = {
  items: DockNavItem[];
  profile: Profile;
  className?: string;
  unreadNotifications?: number;
};

export function DockRail({
  items,
  profile,
  className,
  unreadNotifications = 0,
}: DockRailProps) {
  const resolvedItems: DockNavItem[] = items.map((item) => {
    if (item.key === "notifications" && unreadNotifications > 0) {
      return { ...item, badge: unreadNotifications };
    }
    return item;
  });

  return (
    <aside
      className={cn(
        "hidden lg:flex lg:flex-col lg:w-64 ios-fill dock-rail",
        className
      )}
      style={{
        background: "var(--ec-forest-950)",
        borderRight: "4px solid var(--ec-mint-500)",
        boxShadow: "4px 0 0 var(--ec-mint-800)",
      }}
    >
      {/* Logo block */}
      <div
        style={{
          padding: "var(--space-3)",
          borderBottom: "3px solid var(--ec-forest-800)",
          backgroundImage: "var(--tx-dotgrid)",
          backgroundSize: "28px 28px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Mint accent bar on left edge */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            bottom: 0,
            width: "4px",
            background: "var(--ec-mint-500)",
          }}
        />
        <span
          style={{
            fontFamily: "var(--ec-font-head)",
            fontSize: "1.6rem",
            fontWeight: 800,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--ec-mint-400)",
            textShadow: "3px 3px 0 var(--ec-mint-800)",
            display: "block",
            lineHeight: 1,
            marginBottom: "0.35rem",
          }}
        >
          ECODIA
        </span>
        <p
          style={{
            fontFamily: "var(--ec-font-mono)",
            fontSize: "0.55rem",
            fontWeight: 700,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: "var(--ec-forest-500)",
            margin: 0,
          }}
        >
          PLANET · PEOPLE · ACTION
        </p>
      </div>

      {/* Navigation */}
      <nav
        className="flex-1 scroll-native flex flex-col"
        style={{ padding: "var(--space-2) 0", gap: "1px" }}
      >
        {resolvedItems.map((item) => (
          <DockItem
            key={item.key}
            item={item}
            orientation="vertical"
          />
        ))}
      </nav>

      {/* User card */}
      <div
        style={{
          padding: "var(--space-3)",
          borderTop: "3px solid var(--ec-forest-800)",
          background: "rgba(0,0,0,0.25)",
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div
            style={{
              border: "2px solid var(--ec-mint-500)",
              boxShadow: "3px 3px 0 var(--ec-mint-800)",
              overflow: "hidden",
              flexShrink: 0,
              borderRadius: 0,
            }}
          >
            <Avatar
              src={profile.avatar_url}
              alt={profile.display_name || "User"}
              size="sm"
              fallback={profile.display_name || "?"}
            />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                fontSize: "var(--text-sm)",
                fontWeight: 700,
                color: "var(--ec-forest-100)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                margin: "0 0 0.15rem 0",
              }}
            >
              {profile.display_name || "User"}
            </p>
            <span
              style={{
                fontFamily: "var(--ec-font-mono)",
                fontSize: "0.55rem",
                fontWeight: 700,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "var(--ec-mint-500)",
                background: "var(--ec-forest-900)",
                padding: "0.15rem 0.4rem",
                border: "1px solid var(--ec-forest-700)",
                display: "inline-block",
              }}
            >
              {profile.role}
            </span>
          </div>
        </div>

        <form action={signOut}>
          <button
            type="submit"
            className="active-push touch-target"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontFamily: "var(--ec-font-mono)",
              fontSize: "0.6rem",
              fontWeight: 700,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "var(--ec-forest-500)",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: "0.25rem 0",
              width: "100%",
              transition: "color 120ms ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.color = "var(--ec-danger)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.color = "var(--ec-forest-500)";
            }}
          >
            <LogOut size={12} />
            SIGN OUT
          </button>
        </form>
      </div>
    </aside>
  );
}
