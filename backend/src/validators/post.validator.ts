import { z } from "zod";

export const createPostSchema = z.object({
  classId: z.string().uuid("Invalid class ID"),
  photoPath: z.string().min(1, "Photo path is required"),
  promptId: z.string().uuid().optional().nullable(),
  caption: z.string().max(280).optional().nullable(),
});

export const updateCaptionSchema = z.object({
  caption: z.string().max(280).nullable().optional(),
});
