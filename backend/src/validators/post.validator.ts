import { z } from "zod";
export const createPostSchema = z.object({
  classId: z.string().min(1, "Class ID is required"),
  photoPath: z.string().min(1, "Photo path is required"),
  promptId: z.string().optional().nullable(),
  caption: z.string().max(500).optional().nullable(),
});
export const updateCaptionSchema = z.object({
  caption: z.string().max(280).nullable().optional(),
});