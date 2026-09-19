import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose";

export const DISCOUNT_TYPES = ["PERCENTAGE", "FIXED_AMOUNT"] as const;
export type DiscountType = (typeof DISCOUNT_TYPES)[number];

const couponTemplateSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    pointsCost: { type: Number, required: true, min: 1 },
    discountType: { type: String, enum: DISCOUNT_TYPES, required: true },
    discountValue: { type: Number, required: true, min: 0 },
    validityDays: { type: Number, default: 30, min: 1 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export type ICouponTemplate = InferSchemaType<typeof couponTemplateSchema>;
export type CouponTemplateDoc = HydratedDocument<ICouponTemplate>;

export const CouponTemplateModel = model("CouponTemplate", couponTemplateSchema);
