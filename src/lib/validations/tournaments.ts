import { z } from "zod";

export const createTournamentSchema = z.object({
  title: z.string().min(3, "Title is required").max(200).trim(),
  description: z.string().max(2000).trim().optional().default(""),
  status: z.enum(["upcoming", "active", "ended", "cancelled"]).default("upcoming"),
  start_at: z.string().optional().nullable(),
  end_at: z.string().optional().nullable(),
  config: z.record(z.string(), z.unknown()).optional().default({}),
});
export type CreateTournamentInput = z.infer<typeof createTournamentSchema>;

export const updateTournamentSchema = createTournamentSchema.partial().extend({
  tournamentId: z.string().uuid(),
});
export type UpdateTournamentInput = z.infer<typeof updateTournamentSchema>;
