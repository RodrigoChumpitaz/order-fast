import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose";

export const COUPON_STATUSES = ["AVAILABLE", "USED", "EXPIRED"] as const;
export type CouponStatus = (typeof COUPON_STATUSES)[number];

const couponSchema = new Schema(
  {
    customer: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    template: { type: Schema.Types.ObjectId, ref: "CouponTemplate", required: true },
    uniqueCode: { type: String, required: true, unique: true },
    status: { type: String, enum: COUPON_STATUSES, default: "AVAILABLE", required: true, index: true },
    expiresAt: { type: Date, required: true, index: true },
    usedAt: { type: Date, default: null },
    usedInOrder: { type: Schema.Types.ObjectId, ref: "Order", default: null },
  },
  { timestamps: true },
);

export type ICoupon = InferSchemaType<typeof couponSchema>;
export type CouponDoc = HydratedDocument<ICoupon>;

export const CouponModel = model("Coupon", couponSchema);
