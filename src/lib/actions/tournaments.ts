"use server";

import { createClient } from "@/lib/supabase/server";
import { createTournamentSchema, updateTournamentSchema } from "@/lib/validations/tournaments";
import type { UpdateTournamentInput } from "@/lib/validations/tournaments";
import type { Tournament, TournamentParticipant } from "@/types/domain";
export type ActionResult = { error: string } | { success: true; message?: string };

// ── Types ─────────────────────────────────────────────────────────────────

export type TournamentWithStats = Tournament & {
  participantCount: number;
  isJoined: boolean;
};

export type TournamentParticipantWithProfile = TournamentParticipant & {
  profile: {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
    level: number;
  } | null;
};

export type TournamentDetail = Tournament & {
  participants: TournamentParticipantWithProfile[];
  isJoined: boolean;
};

// ── Helpers ────────────────────────────────────────────────────────────────

async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

async function requireAdmin() {
  const { supabase, user } = await getUser();
  if (!user) return { supabase, user: null, error: "Not authenticated" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) return { supabase, user: null, error: "Not authorized" };
  return { supabase, user, error: null };
}

// ── Queries ────────────────────────────────────────────────────────────────

export async function getTournaments(
  statusFilter?: "upcoming" | "active" | "ended" | "cancelled"
): Promise<TournamentWithStats[]> {
  const { supabase, user } = await getUser();

  let query = supabase
    .from("tournaments")
    .select(
      `
      *,
      tournament_participants(count)
    `
    )
    .order("created_at", { ascending: false });

  if (statusFilter) {
    query = query.eq("status", statusFilter);
  }

  const { data: tournaments } = await query;

  if (!tournaments) return [];

  // Fetch current user's joined tournaments
  let joinedIds = new Set<string>();
  if (user) {
    const { data: joined } = await supabase
      .from("tournament_participants")
      .select("tournament_id")
      .eq("user_id", user.id);
    joinedIds = new Set((joined ?? []).map((j) => j.tournament_id));
  }

  return tournaments.map((t: any) => ({
    ...t,
    participantCount: t.tournament_participants?.[0]?.count ?? 0,
    isJoined: joinedIds.has(t.id),
  }));
}

export async function getTournament(id: string): Promise<TournamentDetail | null> {
  const { supabase, user } = await getUser();

  const { data: tournament } = await supabase
    .from("tournaments")
    .select("*")
    .eq("id", id)
    .single();

  if (!tournament) return null;

  // Fetch participants with profiles, ordered by score descending
  const { data: participants } = await supabase
    .from("tournament_participants")
    .select(
      `
      *,
      profile:profiles(id, display_name, avatar_url, level)
    `
    )
    .eq("tournament_id", id)
    .order("score", { ascending: false });

  let isJoined = false;
  if (user) {
    const { data: existing } = await supabase
      .from("tournament_participants")
      .select("id")
      .eq("tournament_id", id)
      .eq("user_id", user.id)
      .maybeSingle();
    isJoined = !!existing;
  }

  const mappedParticipants: TournamentParticipantWithProfile[] = (participants ?? []).map(
    (p: any) => ({
      ...p,
      profile: Array.isArray(p.profile) ? (p.profile[0] ?? null) : (p.profile ?? null),
    })
  );

  return {
    ...tournament,
    participants: mappedParticipants,
    isJoined,
  };
}

// ── Mutations ──────────────────────────────────────────────────────────────

export async function joinTournament(tournamentId: string): Promise<ActionResult> {
  const { supabase, user } = await getUser();
  if (!user) return { error: "Not authenticated" };

  // Check tournament exists and is joinable
  const { data: tournament } = await supabase
    .from("tournaments")
    .select("status")
    .eq("id", tournamentId)
    .single();

  if (!tournament) return { error: "Tournament not found" };
  if (tournament.status === "ended" || tournament.status === "cancelled") {
    return { error: "Tournament is no longer open for joining" };
  }

  // Check not already joined
  const { data: existing } = await supabase
    .from("tournament_participants")
    .select("id")
    .eq("tournament_id", tournamentId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) return { error: "Already joined this tournament" };

  const { error } = await supabase.from("tournament_participants").insert({
    tournament_id: tournamentId,
    user_id: user.id,
    score: 0,
  });

  if (error) return { error: "Failed to join tournament" };
  return { success: true, message: "Joined tournament" };
}

export async function leaveTournament(tournamentId: string): Promise<ActionResult> {
  const { supabase, user } = await getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("tournament_participants")
    .delete()
    .eq("tournament_id", tournamentId)
    .eq("user_id", user.id);

  if (error) return { error: "Failed to leave tournament" };
  return { success: true, message: "Left tournament" };
}

// ── Admin Mutations ────────────────────────────────────────────────────────

export async function createTournament(
  data: Parameters<typeof createTournamentSchema.parse>[0]
): Promise<ActionResult & { id?: string }> {
  const parsed = createTournamentSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { supabase, user, error } = await requireAdmin();
  if (error || !user) return { error: error ?? "Not authorized" };

  const { data: created, error: insertError } = await supabase
    .from("tournaments")
    .insert({
      title: parsed.data.title,
      description: parsed.data.description,
      status: parsed.data.status,
      start_at: parsed.data.start_at ?? null,
      end_at: parsed.data.end_at ?? null,
      config: parsed.data.config,
      owner_id: user.id,
    })
    .select("id")
    .single();

  if (insertError) return { error: "Failed to create tournament" };
  return { success: true, message: "Tournament created", id: created.id };
}

export async function updateTournament(
  id: string,
  data: Omit<UpdateTournamentInput, "tournamentId">
): Promise<ActionResult> {
  const parsed = updateTournamentSchema.safeParse({ tournamentId: id, ...data });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { supabase, error } = await requireAdmin();
  if (error) return { error };

  const { tournamentId, ...rest } = parsed.data;
  const { error: updateError } = await supabase
    .from("tournaments")
    .update({
      ...rest,
      start_at: rest.start_at ?? null,
      end_at: rest.end_at ?? null,
    })
    .eq("id", tournamentId);

  if (updateError) return { error: "Failed to update tournament" };
  return { success: true, message: "Tournament updated" };
}

export async function deleteTournament(id: string): Promise<ActionResult> {
  const { supabase, error } = await requireAdmin();
  if (error) return { error };

  const { error: deleteError } = await supabase
    .from("tournaments")
    .delete()
    .eq("id", id);

  if (deleteError) return { error: "Failed to delete tournament" };
  return { success: true, message: "Tournament deleted" };
}
