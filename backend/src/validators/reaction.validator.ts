import { z } from "zod";

export const reactionSchema = z.object({
  reactionType: z.enum(["heart", "laugh", "cry", "fire", "dead", "respect"]),
});
