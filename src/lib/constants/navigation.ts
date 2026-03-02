import type { DockNavItem } from "@/components/layout/dock-types";

export const NAV_ITEMS: DockNavItem[] = [
  { key: "home", label: "Home", href: "/home", icon: "home" },
  { key: "quests", label: "Quests", href: "/quests", icon: "compass" },
  { key: "feed", label: "Feed", href: "/feed", icon: "message-square" },
  { key: "impact", label: "Impact", href: "/impact", icon: "bar-chart-3" },
  { key: "wallet", label: "Wallet", href: "/wallet", icon: "wallet" },
  { key: "friends", label: "Friends", href: "/friends", icon: "users" },
  { key: "teams", label: "Teams", href: "/teams", icon: "shield" },
  {
    key: "leaderboards",
    label: "Leaderboards",
    href: "/leaderboards",
    icon: "trophy",
  },
  {
    key: "tournaments",
    label: "Tournaments",
    href: "/tournaments",
    icon: "medal",
  },
  { key: "notifications", label: "Notifications", href: "/notifications", icon: "bell" },
  { key: "causes", label: "ECO Causes", href: "/causes", icon: "heart" },
  { key: "eco-local", label: "Eco-Local", href: "/eco-local", icon: "map-pin" },
  { key: "account", label: "Settings", href: "/account", icon: "settings" },
];

/** Mobile dock shows these 5 primary tabs */
export const MOBILE_TAB_KEYS = [
  "home",
  "quests",
  "feed",
  "impact",
  "wallet",
];
