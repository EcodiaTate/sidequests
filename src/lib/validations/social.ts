import { z } from "zod";

export const sendFriendRequestSchema = z.object({
  toUserId: z.string().uuid("Invalid user"),
});

export type SendFriendRequestInput = z.infer<typeof sendFriendRequestSchema>;

export const respondFriendRequestSchema = z.object({
  requestId: z.string().uuid("Invalid request"),
  action: z.enum(["accept", "decline"]),
});

export type RespondFriendRequestInput = z.infer<typeof respondFriendRequestSchema>;

export const blockUserSchema = z.object({
  userId: z.string().uuid("Invalid user"),
});

export type BlockUserInput = z.infer<typeof blockUserSchema>;

export const createTeamSchema = z.object({
  name: z
    .string()
    .min(2, "Team name must be at least 2 characters")
    .max(50, "Team name must be 50 characters or fewer")
    .trim(),
  description: z
    .string()
    .max(300, "Description must be 300 characters or fewer")
    .trim()
    .optional()
    .default(""),
});

export type CreateTeamInput = z.infer<typeof createTeamSchema>;

export const joinTeamSchema = z.object({
  inviteCode: z
    .string()
    .min(1, "Invite code is required")
    .max(20, "Invalid invite code")
    .trim(),
});

export type JoinTeamInput = z.infer<typeof joinTeamSchema>;

export const updateTeamSchema = z.object({
  teamId: z.string().uuid("Invalid team"),
  name: z
    .string()
    .min(2, "Team name must be at least 2 characters")
    .max(50, "Team name must be 50 characters or fewer")
    .trim()
    .optional(),
  description: z
    .string()
    .max(300, "Description must be 300 characters or fewer")
    .trim()
    .optional(),
});

export type UpdateTeamInput = z.infer<typeof updateTeamSchema>;
