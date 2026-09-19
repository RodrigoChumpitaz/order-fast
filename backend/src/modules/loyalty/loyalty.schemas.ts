import { z } from "zod";
import { objectIdSchema } from "../../shared/validation/common.schemas";
import { DISCOUNT_TYPES } from "./couponTemplate.model";

export const updateLoyaltyConfigSchema = z.object({
  pointsPerCurrencyUnit: z.number().min(0),
});

export const createCouponTemplateSchema = z.object({
  name: z.string().min(1),
  pointsCost: z.number().int().min(1),
  discountType: z.enum(DISCOUNT_TYPES),
  discountValue: z.number().min(0),
  validityDays: z.number().int().min(1).optional(),
});

export const updateCouponTemplateSchema = z.object({
  name: z.string().min(1).optional(),
  pointsCost: z.number().int().min(1).optional(),
  discountType: z.enum(DISCOUNT_TYPES).optional(),
  discountValue: z.number().min(0).optional(),
  validityDays: z.number().int().min(1).optional(),
  isActive: z.boolean().optional(),
});

export const redeemCouponSchema = z.object({
  templateId: objectIdSchema,
});

export const adjustPointsSchema = z.object({
  amount: z.number().int(),
  description: z.string().min(1),
});
