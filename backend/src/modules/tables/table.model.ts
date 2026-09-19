import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose";

export const TABLE_STATUSES = ["FREE", "OCCUPIED"] as const;
export type TableStatus = (typeof TABLE_STATUSES)[number];

const tableSchema = new Schema(
  {
    number: { type: Number, required: true, unique: true },
    capacity: { type: Number, default: 4, min: 1 },
    status: { type: String, enum: TABLE_STATUSES, default: "FREE" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export type ITable = InferSchemaType<typeof tableSchema>;
export type TableDoc = HydratedDocument<ITable>;

export const TableModel = model("Table", tableSchema);
