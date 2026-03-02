"use client";

import dayjs from "dayjs";
import { Trophy, Zap, Flame } from "lucide-react";
import { LevelXPCircle } from "./level-xp-circle";
import { EcoCounter } from "./eco-counter";
import { StreakPill } from "./streak-pill";
import { PrimaryQuestCard } from "./primary-quest-card";
import type { Profile } from "@/types/domain";
import type { Database } from "@/types/database";

type LeaderboardRow =
  Database["public"]["Views"]["leaderboard_eco_weekly"]["Row"];

type DashboardClientProps = {
  profile: Profile;
  weeklyRank: LeaderboardRow | null;
};

function getGreeting(): string {
  const hour = dayjs().hour();
  if (hour < 12) return "GM";
  if (hour < 17) return "GA";
  return "GE";
}

function getGreetingFull(): string {
  const hour = dayjs().hour();
  if (hour < 12) return "GOOD MORNING";
  if (hour < 17) return "GOOD AFTERNOON";
  return "GOOD EVENING";
}

export function DashboardClient({
  profile,
  weeklyRank,
}: DashboardClientProps) {
  const greeting = getGreeting();
  const greetingFull = getGreetingFull();
  const name = (profile.display_name || "THERE").toUpperCase();
  const isTopRank = weeklyRank?.rank != null && weeklyRank.rank <= 3;

  return (
    <div
      style={{
        padding: "var(--space-3)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-3)",
      }}
    >
      {/* ── HERO HEADER ── Raw brutalist stamp block */}
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          background: "var(--ec-forest-950)",
          border: "3px solid var(--ec-forest-800)",
          boxShadow: "6px 6px 0 var(--ec-mint-500)",
        }}
      >
        {/* Dot-grid texture */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "var(--tx-dotgrid)",
            backgroundSize: "28px 28px",
            opacity: 0.35,
            pointerEvents: "none",
          }}
        />

        {/* Mint top accent bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "3px",
            background: "var(--ec-mint-500)",
          }}
        />

        {/* Diagonal decorative element */}
        <div
          style={{
            position: "absolute",
            top: "-20px",
            right: "-20px",
            width: "120px",
            height: "120px",
            background: "var(--ec-mint-500)",
            opacity: 0.06,
            transform: "rotate(45deg)",
          }}
        />

        <div
          style={{
            position: "relative",
            padding: "var(--space-3)",
          }}
        >
          {/* Time-based stamp */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              marginBottom: "0.5rem",
            }}
          >
            <span
              style={{
                fontFamily: "var(--ec-font-mono)",
                fontSize: "0.6rem",
                fontWeight: 700,
                letterSpacing: "0.35em",
                textTransform: "uppercase",
                color: "var(--ec-mint-500)",
              }}
            >
              {greetingFull}
            </span>
            <span
              style={{
                background: "var(--ec-mint-500)",
                color: "var(--ec-forest-950)",
                fontFamily: "var(--ec-font-mono)",
                fontSize: "0.55rem",
                fontWeight: 800,
                letterSpacing: "0.15em",
                padding: "0.15rem 0.5rem",
              }}
            >
              {greeting}
            </span>
          </div>

          {/* Name — massive brutalist type */}
          <h1
            style={{
              fontFamily: "var(--ec-font-head)",
              fontSize: "clamp(2rem, 10vw, 3.5rem)",
              fontWeight: 800,
              letterSpacing: "0.05em",
              lineHeight: 0.9,
              textTransform: "uppercase",
              color: "var(--ec-white)",
              textShadow: "4px 4px 0 var(--ec-mint-800)",
              marginBottom: "0.75rem",
            }}
          >
            {name}
          </h1>

          {/* Level + XP bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                background: "var(--ec-mint-500)",
                color: "var(--ec-forest-950)",
                fontFamily: "var(--ec-font-mono)",
                fontSize: "0.6rem",
                fontWeight: 800,
                letterSpacing: "0.2em",
                padding: "0.25rem 0.75rem",
                border: "2px solid var(--ec-mint-300)",
                boxShadow: "2px 2px 0 var(--ec-mint-800)",
              }}
            >
              LVL {profile.level ?? 1}
            </span>
            <span
              style={{
                fontFamily: "var(--ec-font-mono)",
                fontSize: "0.6rem",
                fontWeight: 700,
                letterSpacing: "0.2em",
                color: "var(--ec-forest-400)",
                textTransform: "uppercase",
              }}
            >
              {(profile.xp_total ?? 0).toLocaleString()} XP TOTAL
            </span>
          </div>
        </div>
      </div>

      {/* ── STAT GRID — 2-col mobile, 4-col desktop ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "0",
          border: "3px solid var(--ec-forest-800)",
          boxShadow: "6px 6px 0 var(--ec-forest-800)",
          background: "var(--ec-forest-900)",
        }}
      >
        {/* LEVEL CARD */}
        <div
          style={{
            background: "var(--ec-forest-950)",
            borderRight: "2px solid var(--ec-forest-800)",
            borderBottom: "2px solid var(--ec-forest-800)",
            padding: "var(--space-3)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <span
            style={{
              fontFamily: "var(--ec-font-mono)",
              fontSize: "0.55rem",
              fontWeight: 700,
              letterSpacing: "0.3em",
              color: "var(--ec-mint-600)",
              textTransform: "uppercase",
              width: "100%",
            }}
          >
            LEVEL
          </span>
          <LevelXPCircle
            level={profile.level ?? 1}
            xpTotal={profile.xp_total ?? 0}
          />
        </div>

        {/* ECO BALANCE CARD */}
        <div
          style={{
            background: "var(--ec-forest-950)",
            borderBottom: "2px solid var(--ec-forest-800)",
            padding: "var(--space-3)",
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
            }}
          >
            <div
              style={{
                width: "20px",
                height: "20px",
                background: "var(--ec-gold-500)",
                border: "2px solid var(--ec-forest-800)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Zap size={10} color="var(--ec-forest-950)" strokeWidth={3} />
            </div>
            <span
              style={{
                fontFamily: "var(--ec-font-mono)",
                fontSize: "0.55rem",
                fontWeight: 700,
                letterSpacing: "0.25em",
                color: "var(--ec-gold-500)",
                textTransform: "uppercase",
              }}
            >
              ECO BALANCE
            </span>
          </div>
          <EcoCounter />
        </div>

        {/* STREAK CARD */}
        <div
          style={{
            background: "var(--ec-forest-950)",
            borderRight: "2px solid var(--ec-forest-800)",
            padding: "var(--space-3)",
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
            }}
          >
            <div
              style={{
                width: "20px",
                height: "20px",
                background: "var(--ec-gold-500)",
                border: "2px solid var(--ec-forest-800)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Flame size={10} color="var(--ec-forest-950)" strokeWidth={3} />
            </div>
            <span
              style={{
                fontFamily: "var(--ec-font-mono)",
                fontSize: "0.55rem",
                fontWeight: 700,
                letterSpacing: "0.25em",
                color: "var(--ec-gold-500)",
                textTransform: "uppercase",
              }}
            >
              STREAK
            </span>
          </div>
          <StreakPill streakDays={profile.streak_days ?? 0} />
        </div>

        {/* WEEKLY RANK CARD */}
        <div
          style={{
            background: isTopRank ? "var(--ec-gold-900)" : "var(--ec-forest-950)",
            padding: "var(--space-3)",
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {isTopRank && (
            <div
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                bottom: 0,
                width: "3px",
                background: "var(--ec-gold-500)",
              }}
            />
          )}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
            }}
          >
            <div
              style={{
                width: "20px",
                height: "20px",
                background: isTopRank ? "var(--ec-gold-500)" : "var(--ec-forest-800)",
                border: "2px solid var(--ec-forest-700)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Trophy size={10} color={isTopRank ? "var(--ec-forest-950)" : "var(--ec-forest-500)"} strokeWidth={3} />
            </div>
            <span
              style={{
                fontFamily: "var(--ec-font-mono)",
                fontSize: "0.55rem",
                fontWeight: 700,
                letterSpacing: "0.25em",
                color: isTopRank ? "var(--ec-gold-500)" : "var(--ec-forest-500)",
                textTransform: "uppercase",
              }}
            >
              WEEKLY RANK
            </span>
          </div>
          <span
            style={{
              fontFamily: "var(--ec-font-head)",
              fontSize: "clamp(1.5rem, 7vw, 2rem)",
              fontWeight: 800,
              letterSpacing: "0.02em",
              lineHeight: 1,
              color: weeklyRank?.rank ? "var(--ec-gold-400)" : "var(--ec-forest-700)",
              textShadow: weeklyRank?.rank ? "2px 2px 0 var(--ec-forest-900)" : "none",
            }}
          >
            {weeklyRank?.rank ? `#${weeklyRank.rank}` : "—"}
          </span>
        </div>
      </div>

      {/* ── PRIMARY QUEST ── Brutalist section header + card */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0",
        }}
      >
        {/* Section label bar */}
        <div
          style={{
            background: "var(--ec-mint-500)",
            border: "2px solid var(--ec-forest-800)",
            borderBottom: "none",
            padding: "0.4rem 0.875rem",
            display: "inline-block",
            width: "fit-content",
          }}
        >
          <span
            style={{
              fontFamily: "var(--ec-font-mono)",
              fontSize: "0.55rem",
              fontWeight: 700,
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "var(--ec-forest-950)",
            }}
          >
            🌿 PRIMARY QUEST
          </span>
        </div>

        {/* Quest card wrapper — boxed in */}
        <div
          style={{
            border: "2px solid var(--ec-forest-800)",
            boxShadow: "4px 4px 0 var(--ec-mint-500)",
          }}
        >
          <PrimaryQuestCard />
        </div>
      </div>
    </div>
  );
}
