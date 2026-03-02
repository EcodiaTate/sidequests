import { z } from "zod";

export const sidequestFilterSchema = z.object({
  kind: z
    .enum(["core", "eco_action", "daily", "weekly", "tournament", "team", "chain"])
    .optional(),
  search: z.string().max(200).optional(),
  tags: z.array(z.string()).optional(),
  sort: z.enum(["newest", "reward_high", "reward_low", "difficulty"]).optional(),
  page: z.number().int().min(1).optional(),
});

export type SidequestFilterInput = z.infer<typeof sidequestFilterSchema>;

export const createSubmissionSchema = z.object({
  sidequestId: z.string().uuid("Invalid sidequest"),
  method: z.enum(["photo_upload", "instagram_link"]),
  caption: z.string().max(500, "Caption must be 500 characters or fewer").trim().optional().default(""),
  visibility: z.enum(["public", "friends", "private"]).optional().default("public"),
  instagramUrl: z.string().url("Please enter a valid URL").optional(),
});

export type CreateSubmissionInput = z.infer<typeof createSubmissionSchema>;

export const updateVisibilitySchema = z.object({
  submissionId: z.string().uuid("Invalid submission"),
  visibility: z.enum(["public", "friends", "private"]),
});

export type UpdateVisibilityInput = z.infer<typeof updateVisibilitySchema>;

export const hatchRewardSchema = z.object({
  submissionId: z.string().uuid("Invalid submission"),
});

export type HatchRewardInput = z.infer<typeof hatchRewardSchema>;
