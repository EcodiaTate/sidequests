"use server";

import { createClient } from "@/lib/supabase/server";
import {
  sidequestFilterSchema,
  createSubmissionSchema,
  updateVisibilitySchema,
  hatchRewardSchema,
} from "@/lib/validations/sidequests";
import { PAGE_SIZE } from "@/lib/constants/sidequests";
import type { Sidequest, Submission, SidequestKind } from "@/types/domain";

export type ActionResult = { error: string } | { success: true; message?: string };

// ── Reads ────────────────────────────────────────────────────────────────

export async function getSidequests(filters: Record<string, unknown> = {}) {
  const parsed = sidequestFilterSchema.safeParse(filters);
  const f = parsed.success ? parsed.data : { page: 1 };

  const supabase = await createClient();
  const page = f.page ?? 1;
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from("sidequests")
    .select("*", { count: "exact" })
    .eq("status", "active")
    .range(from, to);

  if (f.kind) query = query.eq("kind", f.kind);
  if (f.search) query = query.ilike("title", `%${f.search}%`);
  if (f.tags && f.tags.length > 0) query = query.overlaps("tags", f.tags);

  if (f.sort === "reward_high") query = query.order("reward_eco", { ascending: false });
  else if (f.sort === "reward_low") query = query.order("reward_eco", { ascending: true });
  else query = query.order("created_at", { ascending: false });

  const { data, count, error } = await query;
  if (error) return { data: [] as Sidequest[], count: 0 };
  return { data: (data ?? []) as Sidequest[], count: count ?? 0 };
}

export async function getSidequestById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sidequests")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data as Sidequest;
}

export async function getChainSidequests(chainId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("sidequests")
    .select("*")
    .eq("chain_id", chainId)
    .order("chain_order", { ascending: true });

  return (data ?? []) as Sidequest[];
}

export async function getMySubmissions(limit = 20) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("submissions")
    .select("*, sidequests(title, hero_image, kind)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  return data ?? [];
}

export async function getSubmissionById(id: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("submissions")
    .select("*, sidequests(title, hero_image, kind, reward_eco, xp_reward)")
    .eq("id", id)
    .single();

  return data;
}

export async function getUserSubmissionsForQuest(sidequestId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("submissions")
    .select("*")
    .eq("user_id", user.id)
    .eq("sidequest_id", sidequestId)
    .order("created_at", { ascending: false });

  return (data ?? []) as Submission[];
}

// ── Mutations ────────────────────────────────────────────────────────────

export async function createSubmission(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const parsed = createSubmissionSchema.safeParse({
    sidequestId: formData.get("sidequestId"),
    method: formData.get("method"),
    caption: formData.get("caption"),
    visibility: formData.get("visibility"),
    instagramUrl: formData.get("instagramUrl"),
  });

  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  let mediaUrl: string | null = null;

  if (parsed.data.method === "photo_upload") {
    const file = formData.get("media") as File | null;
    if (!file || file.size === 0) return { error: "Please upload a photo" };
    if (file.size > 10 * 1024 * 1024) return { error: "Photo must be under 10MB" };

    const ext = file.name.split(".").pop() || "jpg";
    const path = `${user.id}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("submissions")
      .upload(path, file, { cacheControl: "3600" });

    if (uploadError) return { error: "Failed to upload photo" };

    const { data: { publicUrl } } = supabase.storage
      .from("submissions")
      .getPublicUrl(path);

    mediaUrl = publicUrl;
  }

  const { error } = await supabase.from("submissions").insert({
    sidequest_id: parsed.data.sidequestId,
    user_id: user.id,
    method: parsed.data.method,
    caption: parsed.data.caption ?? "",
    visibility: parsed.data.visibility ?? "public",
    media_url: mediaUrl,
    instagram_url: parsed.data.instagramUrl || null,
  });

  if (error) return { error: "Failed to submit" };
  return { success: true, message: "Submission created" };
}

export async function updateSubmissionVisibility(
  data: { submissionId: string; visibility: string }
): Promise<ActionResult> {
  const parsed = updateVisibilitySchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("submissions")
    .update({ visibility: parsed.data.visibility })
    .eq("id", parsed.data.submissionId)
    .eq("user_id", user.id);

  if (error) return { error: "Failed to update visibility" };
  return { success: true };
}

export async function hatchReward(
  data: { submissionId: string }
): Promise<ActionResult & { eco?: number; xp?: number; bonus?: boolean }> {
  const parsed = hatchRewardSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: submission } = await supabase
    .from("submissions")
    .select("*")
    .eq("id", parsed.data.submissionId)
    .eq("user_id", user.id)
    .eq("state", "approved")
    .eq("reward_hatched", false)
    .single();

  if (!submission) return { error: "No reward to hatch" };

  const { error } = await supabase
    .from("submissions")
    .update({ reward_hatched: true })
    .eq("id", parsed.data.submissionId);

  if (error) return { error: "Failed to hatch reward" };

  return {
    success: true,
    message: "Reward hatched!",
    eco: submission.final_eco ?? undefined,
    xp: submission.final_xp ?? undefined,
    bonus: submission.had_bonus ?? undefined,
  };
}

// ── Natural Language Quest Search ─────────────────────────────────────────

export type SidequestSearchResult = {
  quests: Sidequest[];
  mode: "semantic" | "keyword";
};

/**
 * searchQuestsNL — keyword-based NL search with heuristic intent parsing.
 *
 * Architecture note: this function is structured to drop in pgvector cosine
 * similarity when the semantic_profile column is populated. To enable that,
 * replace the query block below with:
 *   supabase.rpc("match_sidequests", { query_embedding, match_count: 8 })
 * and flip the returned mode to "semantic".
 */
export async function searchQuestsNL(query: string): Promise<SidequestSearchResult> {
  const supabase = await createClient();
  const q = query.toLowerCase().trim();

  // Heuristic intent parsing
  let inferredDifficulty: string | null = null;
  let inferredKind: SidequestKind | null = null;
  let inferredVerification: string | null = null;

  // Difficulty signals
  if (/\b(easy|quick|simple|fast|beginner)\b/.test(q)) {
    inferredDifficulty = "easy";
  } else if (/\b(hard|challenge|difficult|tough|advanced)\b/.test(q)) {
    inferredDifficulty = "hard";
  } else if (/\b(medium|moderate|intermediate)\b/.test(q)) {
    inferredDifficulty = "medium";
  }

  // Kind signals
  if (/\b(daily|today|everyday|every day)\b/.test(q)) {
    inferredKind = "daily";
  } else if (/\b(team|group|together|social|squad)\b/.test(q)) {
    inferredKind = "team";
  } else if (/\b(weekly|week|this week)\b/.test(q)) {
    inferredKind = "weekly";
  } else if (/\b(chain|series|journey|multi.step)\b/.test(q)) {
    inferredKind = "chain";
  } else if (/\b(tournament|compete|competition)\b/.test(q)) {
    inferredKind = "tournament";
  }

  // Verification signals
  if (/\b(photo|picture|snap|image|camera|selfie)\b/.test(q)) {
    inferredVerification = "photo_upload";
  } else if (/\b(instagram|post|share|ig)\b/.test(q)) {
    inferredVerification = "instagram_link";
  }

  // Extract keyword words (3+ chars, skip common stop words)
  const STOP_WORDS = new Set([
    "the", "and", "for", "with", "that", "this", "have", "from",
    "are", "was", "can", "will", "find", "show", "want", "need",
    "near", "some", "easy", "hard", "quick", "daily", "team",
    "group", "photo", "picture", "weekly", "something",
  ]);
  const keywords = q
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !STOP_WORDS.has(w));

  // Build base query
  let dbQuery = supabase
    .from("sidequests")
    .select("*")
    .eq("status", "active")
    .limit(8);

  // Apply inferred filters
  if (inferredDifficulty) {
    dbQuery = dbQuery.eq("difficulty", inferredDifficulty);
  }
  if (inferredKind) {
    dbQuery = dbQuery.eq("kind", inferredKind);
  }
  if (inferredVerification) {
    dbQuery = dbQuery.contains("verification_methods", [inferredVerification]);
  }

  // Keyword search: if we have specific keywords, search title + description
  // Use the first meaningful keyword for a targeted ilike; fall back to tag overlap
  if (keywords.length > 0) {
    // Search title for any of the keywords using OR conditions
    const titleFilters = keywords
      .map((kw) => `title.ilike.%${kw}%`)
      .join(",");
    const descFilters = keywords
      .map((kw) => `description_md.ilike.%${kw}%`)
      .join(",");
    dbQuery = dbQuery.or(`${titleFilters},${descFilters}`);
  } else if (!inferredDifficulty && !inferredKind && !inferredVerification) {
    // Completely unconstrained — return recent active quests
    dbQuery = dbQuery.order("created_at", { ascending: false });
  }

  dbQuery = dbQuery.order("created_at", { ascending: false });

  const { data, error } = await dbQuery;

  if (error) return { quests: [], mode: "keyword" };

  return {
    quests: (data ?? []) as Sidequest[],
    mode: "keyword",
    // Future: change to "semantic" when pgvector embeddings are populated
  };
}
