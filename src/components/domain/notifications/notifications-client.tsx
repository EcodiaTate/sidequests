"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dayjs from "dayjs";
import isToday from "dayjs/plugin/isToday";
import isYesterday from "dayjs/plugin/isYesterday";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import { Bell, CheckCheck } from "lucide-react";
import { useHaptic } from "@/lib/hooks/use-haptics";
import { useNotificationsRealtime } from "@/lib/hooks/use-notifications-realtime";
import { useProfile } from "@/lib/hooks/use-profile";
import { NotificationRow } from "./notification-row";
import type { Notification } from "@/lib/hooks/use-notifications-realtime";

dayjs.extend(isToday);
dayjs.extend(isYesterday);
dayjs.extend(isSameOrAfter);

// ── Group labels ──────────────────────────────────────────────────────────

function getGroupKey(created_at: string): string {
  const d = dayjs(created_at);
  if (d.isToday()) return "Today";
  if (d.isYesterday()) return "Yesterday";
  const weekAgo = dayjs().subtract(7, "day");
  if (d.isSameOrAfter(weekAgo)) return "This week";
  return "Older";
}

const GROUP_ORDER = ["Today", "Yesterday", "This week", "Older"];

function groupNotifications(
  notifications: Notification[]
): Map<string, Notification[]> {
  const map = new Map<string, Notification[]>();

  for (const n of notifications) {
    const key = getGroupKey(n.created_at);
    const existing = map.get(key) ?? [];
    existing.push(n);
    map.set(key, existing);
  }

  // Return in canonical order, omitting empty groups
  const ordered = new Map<string, Notification[]>();
  for (const label of GROUP_ORDER) {
    if (map.has(label)) {
      ordered.set(label, map.get(label)!);
    }
  }
  return ordered;
}

function deduplicateById(a: Notification[], b: Notification[]): Notification[] {
  const seen = new Set<string>();
  const merged: Notification[] = [];

  for (const n of [...a, ...b]) {
    if (!seen.has(n.id)) {
      seen.add(n.id);
      merged.push(n);
    }
  }

  merged.sort(
    (x, y) =>
      new Date(y.created_at).getTime() - new Date(x.created_at).getTime()
  );

  return merged;
}

// ── Local read-state storage (client-side) ────────────────────────────────
const STORAGE_KEY = "ec_notifications_read_ids";

function getLocalReadIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

function saveLocalReadIds(ids: Set<string>): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
  } catch {
    // localStorage unavailable - silent fail
  }
}

// ── Animation variants ────────────────────────────────────────────────────

const listVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
};

// ── Component ─────────────────────────────────────────────────────────────

type Props = {
  initialNotifications: Notification[];
};

export function NotificationsClient({ initialNotifications }: Props) {
  const haptic = useHaptic();
  const { profile } = useProfile();

  // Merge realtime notifications over the server-fetched initial set
  const { notifications: realtimeNotifs } = useNotificationsRealtime(
    profile?.id ?? null
  );

  const merged = deduplicateById(initialNotifications, realtimeNotifs);

  // Read state is managed entirely client-side via localStorage
  const [readIds, setReadIds] = useState<Set<string>>(() => getLocalReadIds());

  // Mark all as read when the page mounts (with a short delay so the dots
  // are visible briefly, confirming there was something new)
  useEffect(() => {
    const timer = setTimeout(() => {
      const allIds = new Set<string>(merged.map((n) => n.id));
      const combined = new Set<string>([...readIds, ...allIds]);
      setReadIds(combined);
      saveLocalReadIds(combined);
    }, 1500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMarkAllRead = useCallback(() => {
    haptic.impact("medium");
    const allIds = new Set<string>(merged.map((n) => n.id));
    const combined = new Set<string>([...readIds, ...allIds]);
    setReadIds(combined);
    saveLocalReadIds(combined);
  }, [haptic, merged, readIds]);

  const unreadCount = merged.filter((n) => !readIds.has(n.id)).length;

  const grouped = groupNotifications(merged);

  // ── Empty state ──────────────────────────────────────────────────────────
  if (merged.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center py-20 gap-4"
        style={{ color: "var(--text-subtle)" }}
      >
        <Bell
          className="w-12 h-12 opacity-30"
          style={{ color: "var(--ec-mint-600)" }}
        />
        <p className="text-fluid-sm font-medium" style={{ color: "var(--text-muted)" }}>
          You're all caught up
        </p>
        <p className="text-fluid-xs" style={{ color: "var(--text-subtle)" }}>
          New friend requests, approved quests, and messages will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Mark all read button */}
      <div className="flex items-center justify-between">
        <p className="text-fluid-xs" style={{ color: "var(--text-muted)" }}>
          {unreadCount > 0 ? (
            <>
              <span style={{ color: "var(--ec-mint-600)", fontWeight: 600 }}>
                {unreadCount}
              </span>{" "}
              unread
            </>
          ) : (
            "All caught up"
          )}
        </p>

        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              type="button"
              onClick={handleMarkAllRead}
              className="active-push touch-target flex items-center gap-1.5 text-fluid-xs font-medium px-3 py-1.5 rounded-full border border-border"
              style={{
                color: "var(--ec-mint-600)",
                background: "var(--surface-elevated)",
              }}
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark all read
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Grouped notifications */}
      {[...grouped.entries()].map(([label, notifs]) => (
        <section key={label}>
          <p
            className="text-fluid-xs uppercase tracking-wider font-semibold mb-2"
            style={{ color: "var(--text-subtle)" }}
          >
            {label}
          </p>
          <motion.div
            className="flex flex-col gap-2"
            variants={listVariants}
            initial="hidden"
            animate="visible"
          >
            {notifs.map((n) => (
              <motion.div key={n.id} variants={itemVariants}>
                <NotificationRow
                  notification={n}
                  isRead={readIds.has(n.id)}
                />
              </motion.div>
            ))}
          </motion.div>
        </section>
      ))}
    </div>
  );
}
