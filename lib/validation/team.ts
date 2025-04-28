import { z } from "zod";

export const inviteCodeSchema = z.object({
  teamId: z.string(),
  expiresAt: z.string().datetime(), // ISO string
  maxUses: z.number().min(1).max(1000),
  userId: z.string(),
});

export const joinCodeSchema = z.object({
  code: z.string().length(6),
  userId: z.string(),
});
