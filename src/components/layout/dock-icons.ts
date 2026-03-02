import type { ComponentType } from "react";
import {
  Home,
  Compass,
  MessageSquare,
  BarChart3,
  Wallet,
  Users,
  Shield,
  Trophy,
  MapPin,
  Palette,
  Settings,
  ShieldCheck,
  Bell,
} from "lucide-react";

/** Maps string icon keys (used in NAV_ITEMS) to Lucide components.
 *  Keeps icon imports client-side so NAV_ITEMS stay serialisable. */
export const DOCK_ICON_MAP: Record<string, ComponentType<{ className?: string }>> = {
  home: Home,
  compass: Compass,
  "message-square": MessageSquare,
  "bar-chart-3": BarChart3,
  wallet: Wallet,
  users: Users,
  shield: Shield,
  trophy: Trophy,
  "map-pin": MapPin,
  palette: Palette,
  settings: Settings,
  "shield-check": ShieldCheck,
  bell: Bell,
};
