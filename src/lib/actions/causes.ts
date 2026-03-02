"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

export type ActionResult = { error: string } | { success: true; message?: string };

export type Cause = {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  category: string;
  goal_eco: number;
  raised_eco: number;
  supporter_count: number;
  status: string;
  featured: boolean;
  ends_at: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type CauseWithProgress = Cause & {
  pct: number;
  userContributed: number;
};

export type MyContribution = {
  cause: Cause;
  amount: number;
  created_at: string;
};

const contributeSchema = z.object({
  causeId: z.string().uuid(),
  amount: z.number().int().positive(),
  message: z.string().max(200).optional(),
});

const createCauseSchema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().max(2000).optional(),
  image_url: z.string().url().optional().nullable(),
  category: z.enum(["reforestation", "ocean", "clean_energy", "wildlife", "general"]).default("general"),
  goal_eco: z.number().int().positive(),
  featured: z.boolean().optional(),
  ends_at: z.string().datetime().optional().nullable(),
});

const updateCauseSchema = createCauseSchema.partial().extend({ id: z.string().uuid() });

// Queries

export async function getCauses(): Promise<CauseWithProgress[]> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  const { data: { user } } = await supabase.auth.getUser();

  const { data: causes } = await db
    .from("eco_causes")
    .select("*")
    .eq("status", "active")
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false });

  if (!causes) return [];

  const userContributions: Record<string, number> = {};

  if (user) {
    const { data: contribs } = await db
      .from("eco_cause_contributions")
      .select("cause_id, amount")
      .eq("user_id", user.id);

    if (contribs) {
      for (const c of contribs as { cause_id: string; amount: number }[]) {
        userContributions[c.cause_id] = (userContributions[c.cause_id] ?? 0) + c.amount;
      }
    }
  }

  return (causes as Cause[]).map((cause) => ({
    ...cause,
    pct: cause.goal_eco > 0 ? Math.min(100, Math.round((cause.raised_eco / cause.goal_eco) * 100)) : 0,
    userContributed: userContributions[cause.id] ?? 0,
  }));
}

export async function getCause(id: string): Promise<CauseWithProgress | null> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  const { data: { user } } = await supabase.auth.getUser();

  const { data: cause } = await db
    .from("eco_causes")
    .select("*")
    .eq("id", id)
    .single();

  if (!cause) return null;
  const c = cause as Cause;

  let userContributed = 0;
  if (user) {
    const { data: contribs } = await db
      .from("eco_cause_contributions")
      .select("amount")
      .eq("cause_id", id)
      .eq("user_id", user.id);
    userContributed = ((contribs ?? []) as { amount: number }[]).reduce((s, r) => s + r.amount, 0);
  }

  return {
    ...c,
    pct: c.goal_eco > 0 ? Math.min(100, Math.round((c.raised_eco / c.goal_eco) * 100)) : 0,
    userContributed,
  };
}

export async function getMyContributions(): Promise<MyContribution[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { data } = await db
    .from("eco_cause_contributions")
    .select("amount, created_at, eco_causes(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (!data) return [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data as any[]).map((row) => ({
    cause: Array.isArray(row.eco_causes) ? row.eco_causes[0] : row.eco_causes,
    amount: row.amount,
    created_at: row.created_at,
  })).filter((r) => r.cause != null);
}

// Mutations

export async function contributeToCause(
  data: Parameters<typeof contributeSchema.safeParse>[0]
): Promise<ActionResult> {
  const parsed = contributeSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { causeId, amount, message } = parsed.data;

  const { data: cause } = await db.from("eco_causes").select("*").eq("id", causeId).single() as { data: Cause | null };
  if (!cause) return { error: "Cause not found" };
  if (cause.status !== "active") return { error: "This cause is no longer accepting contributions" };

  const { data: profile } = await supabase.from("profiles").select("eco_balance").eq("id", user.id).single();
  if (!profile) return { error: "Profile not found" };
  if ((profile.eco_balance ?? 0) < amount) return { error: "Insufficient ECO balance" };

  const { count: existingCount } = await db
    .from("eco_cause_contributions")
    .select("id", { count: "exact", head: true })
    .eq("cause_id", causeId)
    .eq("user_id", user.id);

  const isFirstContribution = (existingCount ?? 0) === 0;

  const { error: contribError } = await db.from("eco_cause_contributions").insert({
    cause_id: causeId,
    user_id: user.id,
    amount,
    message: message ?? "",
  });
  if (contribError) return { error: "Failed to record contribution" };

  await supabase.from("eco_transactions").insert({
    user_id: user.id,
    kind: "contribute" as const,
    direction: "spent" as const,
    amount,
    source: "cause:" + causeId,
    metadata: { cause_id: causeId, cause_title: cause.title },
  });

  const updatePayload: Record<string, unknown> = { raised_eco: (cause.raised_eco ?? 0) + amount };
  if (isFirstContribution) updatePayload.supporter_count = (cause.supporter_count ?? 0) + 1;
  await db.from("eco_causes").update(updatePayload).eq("id", causeId);

  if ((cause.raised_eco + amount) >= cause.goal_eco) {
    await db.from("eco_causes").update({ status: "completed" }).eq("id", causeId);
  }

  return { success: true, message: amount + " ECO contributed to " + cause.title };
}

export async function createCause(
  data: Parameters<typeof createCauseSchema.safeParse>[0]
): Promise<ActionResult> {
  const parsed = createCauseSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!profile?.is_admin) return { error: "Admin access required" };

  const { error } = await db.from("eco_causes").insert(parsed.data);
  if (error) return { error: "Failed to create cause" };

  return { success: true, message: "Cause created" };
}

export async function updateCause(
  data: Parameters<typeof updateCauseSchema.safeParse>[0]
): Promise<ActionResult> {
  const parsed = updateCauseSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!profile?.is_admin) return { error: "Admin access required" };

  const { id, ...updateData } = parsed.data;
  const { error } = await db.from("eco_causes").update(updateData).eq("id", id);
  if (error) return { error: "Failed to update cause" };

  return { success: true, message: "Cause updated" };
}
