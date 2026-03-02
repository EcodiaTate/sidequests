"use client";

import { useState, useTransition } from "react";
import { ArrowLeft, Copy, LogOut, Users, Zap } from "lucide-react";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { useHaptic } from "@/lib/hooks/use-haptics";
import { useToast } from "@/components/ui/toast";
import { leaveTeam } from "@/lib/actions/social";
import { useRouter } from "next/navigation";
import { TeamQuestsClient } from "./team-quests-client";
import type { TeamQuestProgress } from "@/lib/actions/social";

type MemberProfile = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  role: string | null;
};

type Member = {
  id: string;
  user_id: string;
  role: string;
  joined_at: string | null;
  profiles: MemberProfile | MemberProfile[] | null;
};

type Tab = "members" | "quests";

type Props = {
  team: {
    id: string;
    name: string;
    description: string | null;
    invite_code: string;
    owner_id: string;
    members: Member[];
  };
  currentUserId?: string;
  teamQuests: TeamQuestProgress[];
};

export function TeamDetailClient({ team, currentUserId, teamQuests }: Props) {
  const haptic = useHaptic();
  const { toast } = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<Tab>("members");

  const isOwner = currentUserId === team.owner_id;
  const isMember = team.members.some((m) => m.user_id === currentUserId);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(team.invite_code);
      toast("Invite code copied!", "success");
      haptic.impact("light");
    } catch {
      toast(team.invite_code, "info");
    }
  };

  const handleLeave = () => {
    startTransition(async () => {
      const result = await leaveTeam({ teamId: team.id });
      if ("success" in result) {
        haptic.impact("medium");
        router.push("/teams");
      } else {
        toast(result.error, "error");
        haptic.notify("error");
      }
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <Link
        href="/teams"
        className="flex items-center gap-1.5 text-fluid-sm t-muted active-push w-fit"
      >
        <ArrowLeft className="w-4 h-4" />
        All teams
      </Link>

      {/* Header */}
      <div className="flex items-start gap-3">
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: "var(--ec-mint-100)" }}
        >
          <Users className="w-7 h-7" style={{ color: "var(--ec-mint-600)" }} />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-fluid-xl uppercase">{team.name}</h1>
          {team.description && (
            <p className="text-fluid-sm t-muted mt-1">{team.description}</p>
          )}
        </div>
      </div>

      {/* Invite code */}
      <div
        className="card pad-3 flex items-center justify-between"
        style={{ border: "var(--neo-border-mid) solid var(--border)", boxShadow: "var(--neo-shadow-md)" }}
      >
        <div>
          <p className="stamp">Invite code</p>
          <p className="text-fluid-lg font-mono font-bold t-strong tracking-wider">
            {team.invite_code}
          </p>
        </div>
        <button
          type="button"
          onClick={handleCopyCode}
          className="active-push touch-target p-2"
          style={{ color: "var(--ec-mint-600)" }}
        >
          <Copy className="w-5 h-5" />
        </button>
      </div>

      {/* Tab nav */}
      <div
        className="flex rounded-[var(--ec-r-lg)] p-1 gap-1"
        style={{ background: "var(--surface-raised)" }}
      >
        {(["members", "quests"] as Tab[]).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => {
              haptic.impact("light");
              setActiveTab(tab);
            }}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-[var(--ec-r-md)] text-fluid-sm font-medium transition-all active-push touch-target"
            style={{
              background: activeTab === tab ? "var(--surface-base)" : "transparent",
              color: activeTab === tab ? "var(--text-strong)" : "var(--text-muted)",
              boxShadow: activeTab === tab ? "var(--neo-shadow-sm)" : "none",
            }}
          >
            {tab === "members" ? (
              <Users className="w-3.5 h-3.5" />
            ) : (
              <Zap className="w-3.5 h-3.5" />
            )}
            {tab === "members" ? `Members (${team.members.length})` : `Quests (${teamQuests.length})`}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "members" && (
        <div className="flex flex-col gap-2">
          {team.members.map((m) => {
            const profile: MemberProfile | null = Array.isArray(m.profiles)
              ? m.profiles[0] ?? null
              : m.profiles;
            return (
              <div
                key={m.id}
                className="card pad-3 flex items-center gap-3"
                style={{ border: "var(--neo-border-thin) solid var(--border)", boxShadow: "var(--neo-shadow-sm)" }}
              >
                <Avatar
                  src={profile?.avatar_url}
                  alt={profile?.display_name ?? "Member"}
                  size="sm"
                  fallback={profile?.display_name ?? "?"}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-fluid-sm font-medium t-strong truncate">
                    {profile?.display_name ?? "Member"}
                  </p>
                </div>
                {m.role === "owner" && (
                  <Chip variant="primary">Owner</Chip>
                )}
              </div>
            );
          })}
        </div>
      )}

      {activeTab === "quests" && (
        <TeamQuestsClient teamId={team.id} quests={teamQuests} />
      )}

      {/* Leave button */}
      {isMember && !isOwner && (
        <Button
          variant="tertiary"
          fullWidth
          onClick={handleLeave}
          loading={isPending}
          icon={<LogOut className="w-4 h-4" />}
        >
          Leave team
        </Button>
      )}
    </div>
  );
}
