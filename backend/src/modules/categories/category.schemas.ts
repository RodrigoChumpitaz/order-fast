import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().min(1),
  order: z.number().int().min(0).optional(),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1).optional(),
  order: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});
