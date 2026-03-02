import { z } from "zod";

export const addReactionSchema = z.object({
  feedItemId: z.string().uuid("Invalid feed item"),
  kind: z.enum(["eco", "wow", "cheer", "fire", "leaf"]),
});

export type AddReactionInput = z.infer<typeof addReactionSchema>;

export const removeReactionSchema = z.object({
  feedItemId: z.string().uuid("Invalid feed item"),
});

export type RemoveReactionInput = z.infer<typeof removeReactionSchema>;

export const addCommentSchema = z.object({
  feedItemId: z.string().uuid("Invalid feed item"),
  body: z
    .string()
    .min(1, "Comment cannot be empty")
    .max(1000, "Comment must be 1000 characters or fewer")
    .trim(),
});

export type AddCommentInput = z.infer<typeof addCommentSchema>;

export const deleteCommentSchema = z.object({
  commentId: z.string().uuid("Invalid comment"),
});

export type DeleteCommentInput = z.infer<typeof deleteCommentSchema>;

export const feedFilterSchema = z.object({
  scope: z.enum(["home", "friends", "local", "global"]).optional().default("global"),
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(50).optional().default(20),
});

export type FeedFilterInput = z.infer<typeof feedFilterSchema>;
