"use server";

import { createClient } from "@/lib/supabase/server";
import {
  sendFriendRequestSchema,
  respondFriendRequestSchema,
  blockUserSchema,
  createTeamSchema,
  joinTeamSchema,
  updateTeamSchema,
} from "@/lib/validations/social";

export type ActionResult = { error: string } | { success: true; message?: string };

type ProfileInfo = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  role?: string | null;
};

export type FriendData = {
  friendshipId: string;
  tier: string | null;
  createdAt: string | null;
  friend: ProfileInfo | null;
};

export type RequestItem = {
  id: string;
  from_user: string;
  to_user: string;
  status: string | null;
  created_at: string | null;
  profiles: ProfileInfo | null;
};

export type BlockData = {
  blocker_id: string;
  blocked_id: string;
  created_at: string | null;
  profiles: ProfileInfo | null;
};

// ── Friend Reads ─────────────────────────────────────────────────────────

export async function getFriends(): Promise<FriendData[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  // Friendships where user is user_a or user_b
  const { data: friendshipsA } = await (supabase
    .from("friendships")
    .select("*, profiles:user_b(id, display_name, avatar_url, role)") as any)
    .eq("user_a", user.id);

  const { data: friendshipsB } = await (supabase
    .from("friendships")
    .select("*, profiles:user_a(id, display_name, avatar_url, role)") as any)
    .eq("user_b", user.id);

  const friends: FriendData[] = [
    ...((friendshipsA ?? []) as any[]).map((f: any) => ({
      friendshipId: f.id,
      tier: f.tier,
      createdAt: f.created_at,
      friend: f.profiles as ProfileInfo | null,
    })),
    ...((friendshipsB ?? []) as any[]).map((f: any) => ({
      friendshipId: f.id,
      tier: f.tier,
      createdAt: f.created_at,
      friend: f.profiles as ProfileInfo | null,
    })),
  ];

  return friends;
}

export async function getFriendRequests(): Promise<{ incoming: RequestItem[]; outgoing: RequestItem[] }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { incoming: [], outgoing: [] };

  const { data: incoming } = await (supabase
    .from("friend_requests")
    .select("*, profiles:from_user(id, display_name, avatar_url)") as any)
    .eq("to_user", user.id)
    .eq("status", "pending");

  const { data: outgoing } = await (supabase
    .from("friend_requests")
    .select("*, profiles:to_user(id, display_name, avatar_url)") as any)
    .eq("from_user", user.id)
    .eq("status", "pending");

  return {
    incoming: (incoming ?? []) as RequestItem[],
    outgoing: (outgoing ?? []) as RequestItem[],
  };
}

export async function getBlocked(): Promise<BlockData[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await (supabase
    .from("blocks")
    .select("*, profiles:blocked_id(id, display_name, avatar_url)") as any)
    .eq("blocker_id", user.id);

  return (data ?? []) as BlockData[];
}

// ── Friend Mutations ─────────────────────────────────────────────────────

export async function sendFriendRequest(
  data: { toUserId: string }
): Promise<ActionResult> {
  const parsed = sendFriendRequestSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  if (user.id === parsed.data.toUserId) return { error: "You can't friend yourself" };

  // Check for existing block
  const { data: block } = await supabase
    .from("blocks")
    .select("blocker_id")
    .or(`blocker_id.eq.${user.id},blocked_id.eq.${user.id}`)
    .or(`blocker_id.eq.${parsed.data.toUserId},blocked_id.eq.${parsed.data.toUserId}`)
    .limit(1)
    .maybeSingle();

  if (block) return { error: "Unable to send request" };

  const { error } = await supabase.from("friend_requests").insert({
    from_user: user.id,
    to_user: parsed.data.toUserId,
  });

  if (error) {
    if (error.code === "23505") return { error: "Request already sent" };
    return { error: "Failed to send request" };
  }

  return { success: true, message: "Friend request sent" };
}

export async function acceptFriendRequest(
  data: { requestId: string }
): Promise<ActionResult> {
  const parsed = respondFriendRequestSchema.safeParse({ ...data, action: "accept" });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Get the request
  const { data: request } = await supabase
    .from("friend_requests")
    .select("*")
    .eq("id", parsed.data.requestId)
    .eq("to_user", user.id)
    .eq("status", "pending")
    .single();

  if (!request) return { error: "Request not found" };

  // Create friendship (user_a < user_b constraint)
  const [userA, userB] = request.from_user < user.id
    ? [request.from_user, user.id]
    : [user.id, request.from_user];

  const { error: friendError } = await supabase.from("friendships").insert({
    user_a: userA,
    user_b: userB,
  });

  if (friendError && friendError.code !== "23505") {
    return { error: "Failed to create friendship" };
  }

  // Update request status
  await supabase
    .from("friend_requests")
    .update({ status: "accepted" })
    .eq("id", parsed.data.requestId);

  return { success: true, message: "Friend request accepted" };
}

export async function declineFriendRequest(
  data: { requestId: string }
): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("friend_requests")
    .update({ status: "declined" })
    .eq("id", data.requestId)
    .eq("to_user", user.id);

  if (error) return { error: "Failed to decline request" };
  return { success: true };
}

export async function cancelFriendRequest(
  data: { requestId: string }
): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("friend_requests")
    .delete()
    .eq("id", data.requestId)
    .eq("from_user", user.id);

  if (error) return { error: "Failed to cancel request" };
  return { success: true };
}

export async function removeFriend(
  data: { friendshipId: string }
): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("friendships")
    .delete()
    .eq("id", data.friendshipId);

  if (error) return { error: "Failed to remove friend" };
  return { success: true, message: "Friend removed" };
}

export async function blockUser(
  data: { userId: string }
): Promise<ActionResult> {
  const parsed = blockUserSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Remove any existing friendship
  await supabase
    .from("friendships")
    .delete()
    .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
    .or(`user_a.eq.${parsed.data.userId},user_b.eq.${parsed.data.userId}`);

  // Remove any pending requests
  await supabase
    .from("friend_requests")
    .delete()
    .or(`from_user.eq.${user.id},to_user.eq.${user.id}`)
    .or(`from_user.eq.${parsed.data.userId},to_user.eq.${parsed.data.userId}`);

  const { error } = await supabase.from("blocks").insert({
    blocker_id: user.id,
    blocked_id: parsed.data.userId,
  });

  if (error && error.code !== "23505") return { error: "Failed to block user" };
  return { success: true, message: "User blocked" };
}

export async function unblockUser(
  data: { userId: string }
): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("blocks")
    .delete()
    .eq("blocker_id", user.id)
    .eq("blocked_id", data.userId);

  if (error) return { error: "Failed to unblock user" };
  return { success: true, message: "User unblocked" };
}

// ── Team Reads ───────────────────────────────────────────────────────────

export async function getTeams() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: memberships } = await supabase
    .from("team_members")
    .select("team_id, role")
    .eq("user_id", user.id);

  if (!memberships || memberships.length === 0) return [];

  const teamIds = memberships.map((m) => m.team_id);
  const { data: teams } = await supabase
    .from("teams")
    .select("*")
    .in("id", teamIds);

  // Get member counts
  const result = await Promise.all(
    (teams ?? []).map(async (team) => {
      const { count } = await supabase
        .from("team_members")
        .select("*", { count: "exact", head: true })
        .eq("team_id", team.id);

      const membership = memberships.find((m) => m.team_id === team.id);
      return { ...team, memberCount: count ?? 0, userRole: membership?.role ?? "member" };
    })
  );

  return result;
}

export async function getTeamById(teamId: string) {
  const supabase = await createClient();

  const { data: team } = await supabase
    .from("teams")
    .select("*")
    .eq("id", teamId)
    .single();

  if (!team) return null;

  const { data: members } = await (supabase
    .from("team_members")
    .select("*, profiles:user_id(id, display_name, avatar_url, role)") as any)
    .eq("team_id", teamId)
    .order("joined_at", { ascending: true });

  return { ...team, members: (members ?? []) as any[] };
}

// ── Team Mutations ───────────────────────────────────────────────────────

function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function createTeam(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const parsed = createTeamSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
  });

  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const inviteCode = generateInviteCode();

  const { data: team, error } = await supabase
    .from("teams")
    .insert({
      name: parsed.data.name,
      description: parsed.data.description,
      owner_id: user.id,
      invite_code: inviteCode,
    })
    .select()
    .single();

  if (error) return { error: "Failed to create team" };

  // Add creator as owner member
  await supabase.from("team_members").insert({
    team_id: team.id,
    user_id: user.id,
    role: "owner",
  });

  return { success: true, message: "Team created" };
}

export async function joinTeam(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const parsed = joinTeamSchema.safeParse({
    inviteCode: formData.get("inviteCode"),
  });

  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: team } = await supabase
    .from("teams")
    .select("id")
    .eq("invite_code", parsed.data.inviteCode.toUpperCase())
    .single();

  if (!team) return { error: "Invalid invite code" };

  const { error } = await supabase.from("team_members").insert({
    team_id: team.id,
    user_id: user.id,
    role: "member",
  });

  if (error) {
    if (error.code === "23505") return { error: "Already a member" };
    return { error: "Failed to join team" };
  }

  return { success: true, message: "Joined team" };
}

export async function leaveTeam(
  data: { teamId: string }
): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Check if owner
  const { data: team } = await supabase
    .from("teams")
    .select("owner_id")
    .eq("id", data.teamId)
    .single();

  if (team?.owner_id === user.id) {
    return { error: "Owners cannot leave. Transfer ownership or delete the team." };
  }

  const { error } = await supabase
    .from("team_members")
    .delete()
    .eq("team_id", data.teamId)
    .eq("user_id", user.id);

  if (error) return { error: "Failed to leave team" };
  return { success: true, message: "Left team" };
}

export async function updateTeam(
  data: { teamId: string; name?: string; description?: string }
): Promise<ActionResult> {
  const parsed = updateTeamSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const updates: Record<string, string> = {};
  if (parsed.data.name) updates.name = parsed.data.name;
  if (parsed.data.description !== undefined) updates.description = parsed.data.description;

  if (Object.keys(updates).length === 0) return { success: true };

  const { error } = await supabase
    .from("teams")
    .update(updates)
    .eq("id", parsed.data.teamId)
    .eq("owner_id", user.id);

  if (error) return { error: "Failed to update team" };
  return { success: true, message: "Team updated" };
}

// ── Team Quests ─────────────────────────────────────────────────────────────

export type TeamQuestProgress = {
  sidequest: {
    id: string;
    title: string;
    kind: string;
    difficulty: string | null;
    reward_eco: number;
    xp_reward: number;
    team_min_size: number | null;
    team_max_size: number | null;
    team_bonus_eco: number;
    hero_image: string | null;
    card_accent: string | null;
  };
  completions: number;   // how many members have submitted (approved)
  memberCount: number;   // total team members
  isCompleted: boolean;  // all members done (or team_min_size met)
  totalEco: number;      // eco earned by the team collectively so far
};

export async function getTeamQuests(teamId: string): Promise<TeamQuestProgress[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  // Verify user is a team member
  const { data: membership } = await supabase
    .from("team_members")
    .select("user_id")
    .eq("team_id", teamId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!membership) return [];

  // Get team size
  const { count: memberCount } = await supabase
    .from("team_members")
    .select("*", { count: "exact", head: true })
    .eq("team_id", teamId);

  // Get team-allowed sidequests
  const { data: quests } = await supabase
    .from("sidequests")
    .select("id, title, kind, difficulty, reward_eco, xp_reward, team_min_size, team_max_size, team_bonus_eco, hero_image, card_accent")
    .eq("status", "active")
    .eq("team_allowed", true)
    .order("reward_eco", { ascending: false })
    .limit(20);

  if (!quests || quests.length === 0) return [];

  // Get approved submissions for this team
  const questIds = quests.map((q) => q.id);
  const { data: submissions } = await supabase
    .from("submissions")
    .select("sidequest_id, user_id, final_eco")
    .eq("team_id", teamId)
    .eq("state", "approved")
    .in("sidequest_id", questIds);

  const submissionMap: Record<string, { count: number; totalEco: number }> = {};
  for (const sub of submissions ?? []) {
    if (!submissionMap[sub.sidequest_id]) {
      submissionMap[sub.sidequest_id] = { count: 0, totalEco: 0 };
    }
    submissionMap[sub.sidequest_id].count += 1;
    submissionMap[sub.sidequest_id].totalEco += sub.final_eco ?? 0;
  }

  const mc = memberCount ?? 1;

  return quests.map((q) => {
    const progress = submissionMap[q.id] ?? { count: 0, totalEco: 0 };
    const minRequired = q.team_min_size ?? mc;
    return {
      sidequest: {
        id: q.id,
        title: q.title,
        kind: q.kind,
        difficulty: q.difficulty,
        reward_eco: q.reward_eco ?? 0,
        xp_reward: q.xp_reward ?? 0,
        team_min_size: q.team_min_size,
        team_max_size: q.team_max_size,
        team_bonus_eco: q.team_bonus_eco ?? 0,
        hero_image: q.hero_image,
        card_accent: q.card_accent,
      },
      completions: progress.count,
      memberCount: mc,
      isCompleted: progress.count >= Math.min(minRequired, mc),
      totalEco: progress.totalEco,
    };
  });
}

export async function submitTeamQuest(
  teamId: string,
  sidequestId: string,
  mediaUrl: string,
  caption: string
): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Verify membership
  const { data: membership } = await supabase
    .from("team_members")
    .select("user_id")
    .eq("team_id", teamId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!membership) return { error: "Not a team member" };

  // Get the sidequest
  const { data: quest } = await supabase
    .from("sidequests")
    .select("id, team_allowed, reward_eco, xp_reward")
    .eq("id", sidequestId)
    .eq("status", "active")
    .eq("team_allowed", true)
    .single();

  if (!quest) return { error: "Quest not found or not available for teams" };

  // Check if already submitted by this user for this team
  const { data: existing } = await supabase
    .from("submissions")
    .select("id")
    .eq("sidequest_id", sidequestId)
    .eq("user_id", user.id)
    .eq("team_id", teamId)
    .maybeSingle();

  if (existing) return { error: "You already submitted this quest for your team" };

  const { error } = await supabase.from("submissions").insert({
    sidequest_id: sidequestId,
    user_id: user.id,
    team_id: teamId,
    method: "photo_upload",
    state: "pending",
    media_url: mediaUrl,
    caption,
    base_eco: quest.reward_eco,
    base_xp: quest.xp_reward,
  });

  if (error) return { error: "Failed to submit quest" };
  return { success: true, message: "Quest submitted for review!" };
}
