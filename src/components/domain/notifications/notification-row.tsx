"use client";

import Link from "next/link";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Users, CheckCircle, MessageSquare } from "lucide-react";
import { useHaptic } from "@/lib/hooks/use-haptics";
import type { Notification } from "@/lib/hooks/use-notifications-realtime";

dayjs.extend(relativeTime);

type NotificationRowProps = {
  notification: Notification;
  isRead: boolean;
};

type NotificationMeta = {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  description: string;
  href: string;
};

function getNotificationMeta(notification: Notification): NotificationMeta {
  switch (notification.type) {
    case "friend_request":
      return {
        icon: <Users className="w-4 h-4" />,
        iconBg: "var(--ec-mint-600)",
        title: "Friend Request",
        description: "Someone wants to connect with you.",
        href: "/friends",
      };

    case "submission_approved": {
      const xp = notification.data?.xp as number | null | undefined;
      const eco = notification.data?.eco as number | null | undefined;
      const rewardParts: string[] = [];
      if (xp) rewardParts.push(`+${xp} XP`);
      if (eco) rewardParts.push(`+${eco} ECO`);
      const reward = rewardParts.length > 0 ? ` — ${rewardParts.join(", ")}` : "";
      return {
        icon: <CheckCircle className="w-4 h-4" />,
        iconBg: "var(--ec-gold-500)",
        title: "Quest Approved",
        description: `Your submission was approved${reward}.`,
        href: "/quests",
      };
    }

    case "message":
      return {
        icon: <MessageSquare className="w-4 h-4" />,
        iconBg: "var(--ec-forest-600)",
        title: "New Message",
        description: "You have a new notification.",
        href: "/home",
      };

    default:
      return {
        icon: <MessageSquare className="w-4 h-4" />,
        iconBg: "var(--ec-gray-500)",
        title: "Notification",
        description: "You have a new notification.",
        href: "/home",
      };
  }
}

export function NotificationRow({ notification, isRead }: NotificationRowProps) {
  const haptic = useHaptic();
  const meta = getNotificationMeta(notification);

  return (
    <Link
      href={meta.href}
      onClick={() => haptic.impact("light")}
      className="card card-interactive touch-target active-push flex items-start gap-3 p-3 border border-border relative"
      style={{ textDecoration: "none" }}
    >
      {/* Colored icon badge */}
      <div
        className="flex items-center justify-center w-9 h-9 rounded-xl shrink-0 mt-0.5"
        style={{
          background: meta.iconBg,
          color: "var(--ec-white)",
        }}
      >
        {meta.icon}
      </div>

      {/* Text content */}
      <div className="flex-1 min-w-0">
        <p
          className="text-fluid-sm leading-snug"
          style={{
            color: "var(--text-strong)",
            fontWeight: isRead ? 400 : 600,
          }}
        >
          {meta.title}
        </p>
        <p
          className="text-fluid-xs mt-0.5 leading-relaxed"
          style={{ color: "var(--text-muted)" }}
        >
          {meta.description}
        </p>
        <p
          className="text-fluid-xs mt-1"
          style={{ color: "var(--text-subtle)" }}
        >
          {dayjs(notification.created_at).fromNow()}
        </p>
      </div>

      {/* Unread dot */}
      {!isRead && (
        <span
          className="ec-dot absolute top-3 right-3 shrink-0"
          aria-label="Unread"
        />
      )}
    </Link>
  );
}
