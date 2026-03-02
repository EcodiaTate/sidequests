"use client";

import { useState } from "react";
import { Award, Calendar, Copy, Check, Flame, Leaf, Trophy, Zap } from "lucide-react";
import { useHaptic } from "@/lib/hooks/use-haptics";

type PublicBadge = {
  id: string;
  name: string;
  icon: string | null;
  earned_at: string | null;
};

export type PublicProfile = {
  display_name: string;
  avatar_url: string | null;
  role: string | null;
  level: number;
  xp_total: number;
  eco_balance: number;
  streak_days: number;
  bio: string | null;
  created_at: string | null;
  selectedTitle: string | null;
  badges: PublicBadge[];
  submissionCount: number;
};

type Props = {
  profile: PublicProfile;
};

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((word) => word[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}


export function PublicProfileView({ profile }: Props) {
  const haptic = useHaptic();
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = `${window.location.origin}/u/${encodeURIComponent(profile.display_name)}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      haptic.notify("success");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      haptic.notify("error");
    }
  };

  const memberSince = profile.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-AU", {
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <div className="flex flex-col items-center gap-fluid-4 max-w-lg mx-auto">
      {/* Avatar */}
      <div
        className="relative"
        style={{
          width: 96,
          height: 96,
        }}
      >
        {profile.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt={profile.display_name}
            className="w-full h-full rounded-full object-cover"
            style={{
              border: "var(--neo-border-mid) solid var(--ec-forest-800)",
              boxShadow: "var(--neo-shadow-sm)",
            }}
          />
        ) : (
          <div
            className="w-full h-full rounded-full flex items-center justify-center font-heading text-fluid-xl"
            style={{
              background: "var(--ec-mint-100)",
              color: "var(--ec-forest-800)",
              border: "var(--neo-border-mid) solid var(--ec-forest-800)",
              boxShadow: "var(--neo-shadow-sm)",
            }}
          >
            {getInitials(profile.display_name)}
          </div>
        )}
      </div>

      {/* Display Name */}
      <h1
        className="font-heading text-fluid-xl uppercase tracking-wider text-center"
        style={{ color: "var(--text-strong)" }}
      >
        {profile.display_name}
      </h1>

      {/* Selected Title Chip */}
      {profile.selectedTitle && (
        <span
          className="chip"
          style={{
            background: "var(--ec-mint-100)",
            color: "var(--ec-forest-800)",
            borderColor: "var(--ec-mint-400)",
          }}
        >
          {profile.selectedTitle}
        </span>
      )}

      {/* Bio */}
      {profile.bio && (
        <p
          className="text-fluid-sm text-center"
          style={{
            color: "var(--text-muted)",
            maxWidth: "50ch",
          }}
        >
          {profile.bio}
        </p>
      )}

      {/* Stats Grid (2x2) */}
      <div className="grid grid-cols-2 gap-fluid-2 w-full">
        <StatCard
          icon={<Trophy className="w-5 h-5" />}
          label="Level"
          value={profile.level}
          color="var(--ec-gold-500)"
        />
        <StatCard
          icon={<Leaf className="w-5 h-5" />}
          label="ECO Balance"
          value={profile.eco_balance.toLocaleString()}
          color="var(--ec-mint-600)"
        />
        <StatCard
          icon={<Zap className="w-5 h-5" />}
          label="Sidequests"
          value={profile.submissionCount}
          color="var(--ec-forest-600)"
        />
        <StatCard
          icon={<Flame className="w-5 h-5" />}
          label="Streak Days"
          value={profile.streak_days}
          color="var(--ec-gold-600)"
        />
      </div>

      {/* Badges */}
      {profile.badges.length > 0 && (
        <div className="w-full">
          <h2
            className="font-heading text-fluid-lg uppercase tracking-wider mb-3"
            style={{ color: "var(--text-strong)" }}
          >
            Badges
          </h2>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {profile.badges.map((badge) => (
              <div
                key={badge.id}
                className="flex flex-col items-center gap-1 p-2 rounded-lg"
                title={badge.name}
              >
                {badge.icon ? (
                  <img
                    src={badge.icon}
                    alt={badge.name}
                    className="w-10 h-10"
                  />
                ) : (
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{
                      background: "var(--ec-gold-100)",
                    }}
                  >
                    <Award
                      className="w-5 h-5"
                      style={{ color: "var(--ec-gold-500)" }}
                    />
                  </div>
                )}
                <span className="text-fluid-xs t-base text-center line-clamp-1">
                  {badge.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Share Button */}
      <button
        type="button"
        onClick={handleShare}
        className="btn btn-tertiary touch-target active-push flex items-center gap-2"
      >
        {copied ? (
          <>
            <Check className="w-4 h-4" style={{ color: "var(--ec-success)" }} />
            <span>Link copied!</span>
          </>
        ) : (
          <>
            <Copy className="w-4 h-4" />
            <span>Share profile</span>
          </>
        )}
      </button>

      {/* Member Since */}
      {memberSince && (
        <p
          className="text-fluid-xs flex items-center gap-1"
          style={{ color: "var(--text-subtle)" }}
        >
          <Calendar className="w-3.5 h-3.5" />
          Member since {memberSince}
        </p>
      )}
    </div>
  );
}

/* ── Mini stat card ── */

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div
      className="flex flex-col items-center gap-1 pad-3 rounded-lg text-center"
      style={{
        background: "var(--surface-base)",
        border: `var(--neo-border-thin) solid var(--border-strong)`,
        boxShadow: "var(--neo-shadow-sm)",
      }}
    >
      <div
        className="w-8 h-8 rounded-md flex items-center justify-center mb-1"
        style={{
          background: color + "20",
          color: color,
        }}
      >
        {icon}
      </div>
      <p
        className="text-fluid-lg font-bold tabular-nums"
        style={{ color: "var(--text-strong)" }}
      >
        {value}
      </p>
      <p className="stamp">{label}</p>
    </div>
  );
}
