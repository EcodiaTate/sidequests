"use server";

import { createClient } from "@/lib/supabase/server";
import {
  addReactionSchema,
  removeReactionSchema,
  addCommentSchema,
  deleteCommentSchema,
  feedFilterSchema,
} from "@/lib/validations/feed";

export type ActionResult = { error: string } | { success: true; message?: string };

type FeedItemWithProfile = {
  id: string;
  submission_id: string | null;
  author_id: string;
  sidequest_id: string | null;
  caption: string | null;
  visibility: string | null;
  media: Record<string, unknown> | null;
  reaction_count: number | null;
  comment_count: number | null;
  share_count: number | null;
  created_at: string | null;
  profiles: { id: string; display_name: string | null; avatar_url: string | null; role: string | null } | null;
};

type CommentWithProfile = {
  id: string;
  feed_item_id: string;
  user_id: string;
  body: string;
  deleted: boolean | null;
  created_at: string | null;
  profiles: { id: string; display_name: string | null; avatar_url: string | null } | null;
};

// ── Reads ────────────────────────────────────────────────────────────────

export async function getFeedItems(filters: Record<string, unknown> = {}) {
  const parsed = feedFilterSchema.safeParse(filters);
  const f = parsed.success ? parsed.data : { scope: "global" as const, limit: 20 };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let query = (supabase
    .from("feed_items")
    .select("*, profiles:author_id(id, display_name, avatar_url, role)") as any)
    .order("created_at", { ascending: false })
    .limit(f.limit ?? 20);

  // Scope filtering
  if (f.scope === "global") {
    query = query.eq("visibility", "public");
  } else if (f.scope === "friends" && user) {
    query = query.in("visibility", ["public", "friends"]);
  } else {
    query = query.eq("visibility", "public");
  }

  // Cursor-based pagination
  if (f.cursor) {
    query = query.lt("created_at", f.cursor);
  }

  const { data, error } = await query;
  if (error) return { data: [] as FeedItemWithProfile[], nextCursor: null };

  const items = (data ?? []) as FeedItemWithProfile[];
  const nextCursor = items.length === (f.limit ?? 20)
    ? items[items.length - 1]?.created_at ?? null
    : null;

  return { data: items, nextCursor };
}

export async function getFeedItemById(id: string) {
  const supabase = await createClient();
  const { data } = await (supabase
    .from("feed_items")
    .select("*, profiles:author_id(id, display_name, avatar_url, role)") as any)
    .eq("id", id)
    .single();

  return data as FeedItemWithProfile | null;
}

export async function getComments(feedItemId: string) {
  const supabase = await createClient();
  const { data } = await (supabase
    .from("comments")
    .select("*, profiles:user_id(id, display_name, avatar_url)") as any)
    .eq("feed_item_id", feedItemId)
    .eq("deleted", false)
    .order("created_at", { ascending: true });

  return (data ?? []) as CommentWithProfile[];
}

export async function getReactions(feedItemId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("reactions")
    .select("*")
    .eq("feed_item_id", feedItemId);

  const reactions = data ?? [];

  // Group by kind
  const counts: Record<string, number> = {};
  let userReaction: string | null = null;

  for (const r of reactions) {
    counts[r.kind] = (counts[r.kind] || 0) + 1;
    if (user && r.user_id === user.id) {
      userReaction = r.kind;
    }
  }

  return { counts, userReaction, total: reactions.length };
}

// ── Mutations ────────────────────────────────────────────────────────────

export async function addReaction(
  data: { feedItemId: string; kind: string }
): Promise<ActionResult> {
  const parsed = addReactionSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error: deleteError } = await supabase
    .from("reactions")
    .delete()
    .eq("feed_item_id", parsed.data.feedItemId)
    .eq("user_id", user.id);

  if (deleteError) return { error: "Failed to update reaction" };

  const { error } = await supabase.from("reactions").insert({
    feed_item_id: parsed.data.feedItemId,
    user_id: user.id,
    kind: parsed.data.kind,
  });

  if (error) return { error: "Failed to react" };
  return { success: true };
}

export async function removeReaction(
  data: { feedItemId: string }
): Promise<ActionResult> {
  const parsed = removeReactionSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("reactions")
    .delete()
    .eq("feed_item_id", parsed.data.feedItemId)
    .eq("user_id", user.id);

  if (error) return { error: "Failed to remove reaction" };
  return { success: true };
}

export async function addComment(
  data: { feedItemId: string; body: string }
): Promise<ActionResult> {
  const parsed = addCommentSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase.from("comments").insert({
    feed_item_id: parsed.data.feedItemId,
    user_id: user.id,
    body: parsed.data.body,
  });

  if (error) return { error: "Failed to add comment" };
  return { success: true, message: "Comment added" };
}

export async function deleteComment(
  data: { commentId: string }
): Promise<ActionResult> {
  const parsed = deleteCommentSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("comments")
    .update({ deleted: true })
    .eq("id", parsed.data.commentId)
    .eq("user_id", user.id);

  if (error) return { error: "Failed to delete comment" };
  return { success: true };
}

export async function deleteFeedItem(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("feed_items")
    .delete()
    .eq("id", id)
    .eq("author_id", user.id);

  if (error) return { error: "Failed to delete post" };
  return { success: true };
}
