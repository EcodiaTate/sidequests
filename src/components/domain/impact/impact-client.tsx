"use client";

import { useState } from "react";
import { Zap, Award, Target, Flame } from "lucide-react";
import { ImpactStatCard } from "./impact-stat-card";
import { BadgeGrid } from "./badge-grid";
import { TitleSelector } from "./title-selector";
import { QuestProgress } from "./quest-progress";
import { ImpactTimelineChart } from "./impact-timeline-chart";
import { TopThemesBreakdown } from "./top-themes-breakdown";
import { TopPlacesList } from "./top-places-list";
import { Chip } from "@/components/ui/chip";
import { useHaptic } from "@/lib/hooks/use-haptics";
import { ShareImpactCard } from "./share-impact-card";
import type { WeeklyImpactPoint, TopTheme, TopPlace } from "@/lib/actions/impact";

type Tab = "overview" | "badges" | "titles" | "quests" | "journey";

type Badge = {
  id: string;
  name: string;
  description: string | null;
  icon_url: string | null;
  earned: boolean;
  tier: number;
  earnedAt: string | null;
};

type TitleType = {
  id: string;
  name: string;
  description: string | null;
  xp_boost_pct: number | null;
};

type QuestItem = {
  id: string;
  name: string;
  description: string | null;
  cadence: string;
  limit_per_window: number;
  reward_eco: number;
  progress: number;
  target: number;
  completed: boolean;
};

type Props = {
  userId: string;
  displayName: string;
  ecoBalance: number;
  totalSubmissions: number;
  currentStreak: number;
  level: number;
  badges: Badge[];
  titles: TitleType[];
  selectedTitleId: string | null;
  quests: QuestItem[];
  timeline: WeeklyImpactPoint[];
  themes: TopTheme[];
  places: TopPlace[];
};

export function ImpactClient({
  userId,
  displayName,
  ecoBalance,
  totalSubmissions,
  currentStreak,
  level,
  badges,
  titles,
  selectedTitleId,
  quests,
  timeline,
  themes,
  places,
}: Props) {
  const haptic = useHaptic();
  const [tab, setTab] = useState<Tab>("overview");

  const earnedBadgeCount = badges.filter((b) => b.earned).length;
  const activeQuestCount = quests.filter((q) => !q.completed).length;

  return (
    <div className="flex flex-col gap-4">
      {/* Tab bar */}
      <div className="flex gap-2 overflow-x-auto scroll-native">
        {(["overview", "badges", "titles", "quests", "journey"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => {
              setTab(t);
              haptic.impact("light");
            }}
          >
            <Chip variant={tab === t ? "primary" : "secondary"}>
              {t === "overview" && "Overview"}
              {t === "badges" && `Badges (${earnedBadgeCount})`}
              {t === "titles" && "Titles"}
              {t === "quests" && `Quests (${activeQuestCount})`}
              {t === "journey" && "My Journey"}
            </Chip>
          </button>
        ))}
      </div>

      {/* Overview tab */}
      {tab === "overview" && (
        <div className="grid grid-cols-2 gap-3">
          <ImpactStatCard
            icon={<Zap className="w-5 h-5" />}
            label="ECO Balance"
            value={ecoBalance.toLocaleString()}
            color="var(--ec-mint-600)"
          />
          <ImpactStatCard
            icon={<Target className="w-5 h-5" />}
            label="Actions Completed"
            value={totalSubmissions}
            color="var(--ec-forest-600)"
          />
          <ImpactStatCard
            icon={<Flame className="w-5 h-5" />}
            label="Current Streak"
            value={`${currentStreak}d`}
            color="var(--ec-gold-500)"
          />
          <ImpactStatCard
            icon={<Award className="w-5 h-5" />}
            label="Level"
            value={level}
            color="var(--ec-gold-600)"
          />
        </div>
      )}

      {/* Badges tab */}
      {tab === "badges" && <BadgeGrid badges={badges} />}

      {/* Titles tab */}
      {tab === "titles" && (
        <TitleSelector titles={titles} selectedId={selectedTitleId} />
      )}

      {/* Quests tab */}
      {tab === "quests" && <QuestProgress quests={quests} />}

      {/* My Journey tab */}
      {tab === "journey" && (
        <div className="flex flex-col gap-4">
          <ImpactTimelineChart data={timeline} />
          <TopThemesBreakdown themes={themes} />
          <TopPlacesList places={places} />
        </div>
      )}

      {/* Share Your Impact */}
      <div className="border-t border-border pt-4">
        <ShareImpactCard
          userId={userId}
          displayName={displayName}
          ecoBalance={ecoBalance}
          totalSubmissions={totalSubmissions}
          level={level}
          streakDays={currentStreak}
        />
      </div>
    </div>
  );
}
