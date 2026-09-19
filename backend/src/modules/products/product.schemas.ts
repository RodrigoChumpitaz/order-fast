import { z } from "zod";
import { objectIdSchema } from "../../shared/validation/common.schemas";

export const createProductSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional().default(""),
  price: z.number().min(0),
  imageUrl: z.string().optional().default(""),
  category: objectIdSchema,
  stock: z.number().int().min(0).nullable().optional(),
});

export const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  price: z.number().min(0).optional(),
  imageUrl: z.string().optional(),
  category: objectIdSchema.optional(),
  stock: z.number().int().min(0).nullable().optional(),
  isActive: z.boolean().optional(),
});

export const listProductsQuerySchema = z.object({
  category: objectIdSchema.optional(),
});

export const setAvailabilitySchema = z.object({
  isAvailable: z.boolean(),
});
