"use client";

import { cn } from "@/lib/utils";
import type { DockNavItem } from "./dock-types";
import { DockItem } from "./dock-item";

type DockShellProps = {
  items: DockNavItem[];
  className?: string;
};

export function DockShell({ items, className }: DockShellProps) {
  return (
    <nav
      className={cn("mobile-tab-bar lg:hidden", className)}
    >
      {items.map((item) => (
        <DockItem
          key={item.key}
          item={item}
          orientation="horizontal"
          compact
        />
      ))}
    </nav>
  );
}
