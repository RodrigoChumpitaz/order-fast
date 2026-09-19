import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose";

export const ROLES = ["CUSTOMER", "STAFF", "ADMIN"] as const;
export type Role = (typeof ROLES)[number];

const userSchema = new Schema(
  {
    supabaseUserId: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    name: { type: String, trim: true, default: "" },
    phone: { type: String, trim: true, default: "" },
    role: { type: String, enum: ROLES, default: "CUSTOMER", required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export type IUser = InferSchemaType<typeof userSchema>;
export type UserDoc = HydratedDocument<IUser>;

export const UserModel = model("User", userSchema);
