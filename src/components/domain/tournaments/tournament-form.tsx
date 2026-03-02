"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useHaptic } from "@/lib/hooks/use-haptics";
import { createTournament, updateTournament } from "@/lib/actions/tournaments";
import type { Tournament, TournamentStatus } from "@/types/domain";

type Props = {
  tournament?: Tournament;
  onSuccess?: (id: string) => void;
};

export function TournamentForm({ tournament, onSuccess }: Props) {
  const router = useRouter();
  const haptics = useHaptic();
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const isEditing = !!tournament;

  const [title, setTitle] = useState(tournament?.title ?? "");
  const [description, setDescription] = useState(tournament?.description ?? "");
  const [status, setStatus] = useState<TournamentStatus>((tournament?.status as TournamentStatus) ?? "upcoming");
  const [startAt, setStartAt] = useState(tournament?.start_at ? tournament.start_at.slice(0, 16) : "");
  const [endAt, setEndAt] = useState(tournament?.end_at ? tournament.end_at.slice(0, 16) : "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) { setFormError("Title is required."); return; }
    setFormError(null);
    haptics.impact("medium");

    startTransition(async () => {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        status,
        start_at: startAt || null,
        end_at: endAt || null,
      };
      let result;
      if (isEditing && tournament) {
        result = await updateTournament(tournament.id, payload);
      } else {
        result = await createTournament(payload);
      }
      if ("error" in result) {
        setFormError(result.error);
        haptics.notify("error");
      } else {
        haptics.notify("success");
        const resultWithId = result as { id?: string };
        const id = resultWithId.id ?? tournament?.id ?? "";
        if (onSuccess) { onSuccess(id); } else { router.push("/tournaments"); }
      }
    });
  }

  const fieldClass = "flex flex-col gap-1.5";
  const labelClass = "text-sm font-semibold t-strong";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className={fieldClass}>
        <label className={labelClass}>Title</label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Tournament name..." required />
      </div>

      <div className={fieldClass}>
        <label className={labelClass}>Description</label>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What is this tournament about?" rows={3} />
      </div>

      <div className={fieldClass}>
        <label className={labelClass}>Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as TournamentStatus)}
          className="w-full rounded-lg border border-border pad-2 text-sm"
          style={{ background: "var(--surface-2)", color: "var(--text-primary)" }}
        >
          <option value="upcoming">Upcoming</option>
          <option value="active">Active</option>
          <option value="ended">Ended</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className={fieldClass}>
          <label className={labelClass}>Start Date</label>
          <Input type="datetime-local" value={startAt} onChange={(e) => setStartAt(e.target.value)} />
        </div>
        <div className={fieldClass}>
          <label className={labelClass}>End Date</label>
          <Input type="datetime-local" value={endAt} onChange={(e) => setEndAt(e.target.value)} />
        </div>
      </div>

      {formError && (
        <p className="text-sm" style={{ color: "var(--ec-danger)" }}>{formError}</p>
      )}

      <div className="flex gap-3 mt-2">
        <Button type="button" variant="secondary" onClick={() => { haptics.impact("light"); router.back(); }} className="active-push touch-target flex-1">
          Cancel
        </Button>
        <Button type="submit" variant="primary" loading={isPending} className="active-push touch-target flex-1">
          {isEditing ? "Save Changes" : "Create Tournament"}
        </Button>
      </div>
    </form>
  );
}