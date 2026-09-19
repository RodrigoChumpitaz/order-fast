import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose";

export const POINTS_MOVEMENT_TYPES = ["PURCHASE_ACCRUAL", "COUPON_REDEMPTION", "ADMIN_ADJUSTMENT"] as const;
export type PointsMovementType = (typeof POINTS_MOVEMENT_TYPES)[number];

const pointsLedgerSchema = new Schema(
  {
    customer: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, enum: POINTS_MOVEMENT_TYPES, required: true },
    amount: { type: Number, required: true },
    resultingBalance: { type: Number, required: true, min: 0 },
    order: { type: Schema.Types.ObjectId, ref: "Order", default: null },
    description: { type: String, trim: true, default: "" },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export type IPointsLedger = InferSchemaType<typeof pointsLedgerSchema>;
export type PointsLedgerDoc = HydratedDocument<IPointsLedger>;

export const PointsLedgerModel = model("PointsLedger", pointsLedgerSchema);
