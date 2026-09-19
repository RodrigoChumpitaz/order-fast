import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose";

const loyaltyConfigSchema = new Schema(
  {
    pointsPerCurrencyUnit: { type: Number, default: 1, min: 0 },
  },
  { timestamps: true },
);

export type ILoyaltyConfig = InferSchemaType<typeof loyaltyConfigSchema>;
export type LoyaltyConfigDoc = HydratedDocument<ILoyaltyConfig>;

export const LoyaltyConfigModel = model("LoyaltyConfig", loyaltyConfigSchema);
