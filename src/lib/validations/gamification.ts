import { z } from "zod";

export const selectTitleSchema = z.object({
  titleId: z.string().min(1, "Please select a title"),
});

export type SelectTitleInput = z.infer<typeof selectTitleSchema>;

export const updateBadgeDisplaySchema = z.object({
  badgeIds: z.array(z.string()).max(6, "You can display up to 6 badges"),
});

export type UpdateBadgeDisplayInput = z.infer<typeof updateBadgeDisplaySchema>;

export const leaderboardFilterSchema = z.object({
  period: z.enum(["weekly", "monthly", "total"]).optional().default("weekly"),
});

export type LeaderboardFilterInput = z.infer<typeof leaderboardFilterSchema>;
