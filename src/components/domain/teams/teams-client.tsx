"use client";

import { useState, useTransition, useActionState } from "react";
import { Shield, Plus, LogIn } from "lucide-react";
import { TeamCard } from "./team-card";
import { CreateTeamModal } from "./create-team-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { EmptyState } from "@/components/ui/empty-state";
import { useHaptic } from "@/lib/hooks/use-haptics";
import { getTeams, joinTeam } from "@/lib/actions/social";

type TeamData = Awaited<ReturnType<typeof getTeams>>[number];

type Props = {
  initialTeams: TeamData[];
};

export function TeamsClient({ initialTeams }: Props) {
  const haptic = useHaptic();
  const [teams, setTeams] = useState(initialTeams);
  const [showCreate, setShowCreate] = useState(false);
  const [isRefreshing, startRefresh] = useTransition();

  const refresh = () => {
    startRefresh(async () => {
      const t = await getTeams();
      setTeams(t);
    });
  };

  const [joinState, joinAction, isJoining] = useActionState(
    async (prev: { error: string } | { success: true; message?: string } | null, formData: FormData) => {
      const result = await joinTeam(prev, formData);
      if ("success" in result) {
        haptic.notify("success");
        refresh();
      } else {
        haptic.notify("error");
      }
      return result;
    },
    null
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="primary"
          onClick={() => setShowCreate(true)}
          icon={<Plus className="w-4 h-4" />}
        >
          Create
        </Button>
      </div>

      {/* Join by code */}
      <form action={joinAction} className="card pad-3 flex flex-col gap-3" style={{ border: "var(--neo-border-thin) solid var(--border)", boxShadow: "var(--neo-shadow-sm)" }}>
        <p className="stamp">Join a team</p>
        {joinState && "error" in joinState && (
          <Alert variant="error">{joinState.error}</Alert>
        )}
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              name="inviteCode"
              placeholder="Enter invite code"
              maxLength={8}
            />
          </div>
          <Button
            variant="alive"
            type="submit"
            loading={isJoining}
            disabled={isJoining}
            icon={<LogIn className="w-4 h-4" />}
          >
            Join
          </Button>
        </div>
      </form>

      {/* Team list */}
      {teams.length === 0 ? (
        <EmptyState
          icon={<Shield className="w-12 h-12" />}
          title="No teams yet"
          description="Create a team or join one with an invite code."
        />
      ) : (
        <div className="flex flex-col gap-2">
          {teams.map((t) => (
            <TeamCard key={t.id} team={t} />
          ))}
        </div>
      )}

      {/* Create modal */}
      <CreateTeamModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={refresh}
      />
    </div>
  );
}
