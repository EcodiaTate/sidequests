import { z } from "zod";

export const walletFilterSchema = z.object({
  direction: z.enum(["all", "earned", "spent"]).optional().default("all"),
  kind: z
    .enum(["mint_action", "burn_reward", "contribute", "sponsor_deposit", "sponsor_payout"])
    .optional(),
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(50).optional().default(20),
});

export type WalletFilterInput = z.infer<typeof walletFilterSchema>;
