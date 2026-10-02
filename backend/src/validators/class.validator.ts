import { z } from "zod";

export const createClassSchema = z.object({
  name: z.string().min(2, "Class name must be at least 2 characters").max(80),
  schoolName: z.string().max(120).optional(),
  academicYear: z.number().int().min(2000).max(2100),
});

export const joinClassSchema = z.object({
  joinCode: z
    .string()
    .min(4)
    .max(16)
    .transform((val) => val.toUpperCase().trim()),
});
