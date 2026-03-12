"use server";

import { createClient } from "@/lib/supabase/server";

export type ActionResult = { error: string } | { success: true; message?: string };

// ── Token management ────────────────────────────────────────────────────────

/**
 * Upsert a push token for the current user.
 * If the same user already has a token for this device_id, update it.
 * Otherwise insert a new row.
 */
export async function savePushToken(
  token: string,
  platform: "ios" | "android" | "web",
  deviceId?: string
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  if (deviceId) {
    // Check for existing row for this user + device
    const { data: existing } = await supabase
      .from("push_tokens")
      .select("id")
      .eq("user_id", user.id)
      .eq("device_id", deviceId)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from("push_tokens")
        .update({ token, platform })
        .eq("id", existing.id);
      if (error) return { error: "Failed to update push token" };
      return { success: true, message: "Token updated" };
    }
  }

  const { error } = await supabase.from("push_tokens").insert({
    user_id: user.id,
    token,
    platform,
    ...(deviceId ? { device_id: deviceId } : {}),
  });

  if (error) return { error: "Failed to save push token" };
  return { success: true, message: "Token registered" };
}

/**
 * Remove a push token by its value (called on logout or token refresh).
 */
export async function removePushToken(token: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("push_tokens")
    .delete()
    .eq("token", token)
    .eq("user_id", user.id);

  if (error) return { error: "Failed to remove push token" };
  return { success: true };
}

// ── Sending ─────────────────────────────────────────────────────────────────

const BATCH_SIZE = 500;

/**
 * Send a push notification to a list of user IDs.
 * Calls the Edge Function push-send in batches of 500.
 * Admin only - enforced by checking is_admin on the caller's profile.
 */
export async function sendPushNotification(
  userIds: string[],
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) return { error: "Admin access required" };

  // Fetch tokens for all target users
  const { data: tokenRows, error: tokenError } = await supabase
    .from("push_tokens")
    .select("token")
    .in("user_id", userIds);

  if (tokenError) return { error: "Failed to fetch push tokens" };
  if (!tokenRows || tokenRows.length === 0) {
    return { success: true, message: "No tokens to send to" };
  }

  const tokens = tokenRows.map((r) => r.token);
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  // Send in batches
  for (let i = 0; i < tokens.length; i += BATCH_SIZE) {
    const batch = tokens.slice(i, i + BATCH_SIZE);
    const res = await fetch(`${supabaseUrl}/functions/v1/push-send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({ tokens: batch, title, body, data: data ?? {} }),
    });

    if (!res.ok) {
      const text = await res.text();
      return { error: `Push send failed (batch ${i / BATCH_SIZE + 1}): ${text}` };
    }
  }

  return {
    success: true,
    message: `Sent to ${tokens.length} device${tokens.length !== 1 ? "s" : ""}`,
  };
}

/**
 * Send a push campaign to all users (or admins only).
 * Admin only.
 */
export async function sendCampaignPush(
  targetAll: boolean,
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) return { error: "Admin access required" };

  // Fetch the relevant user IDs
  let targetUserIds: string[];

  if (targetAll) {
    const { data: allTokens, error } = await supabase
      .from("push_tokens")
      .select("user_id");
    if (error) return { error: "Failed to fetch push tokens" };
    targetUserIds = [...new Set((allTokens ?? []).map((r) => r.user_id))];
  } else {
    // Admins only
    const { data: admins, error } = await supabase
      .from("profiles")
      .select("id")
      .eq("is_admin", true);
    if (error) return { error: "Failed to fetch admin profiles" };
    targetUserIds = (admins ?? []).map((r) => r.id);
  }

  if (targetUserIds.length === 0) {
    return { success: true, message: "No users to send to" };
  }

  return sendPushNotification(targetUserIds, title, body, data);
}
