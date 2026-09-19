import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose";

const categorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    slug: { type: String, required: true, trim: true, unique: true, lowercase: true },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export type ICategory = InferSchemaType<typeof categorySchema>;
export type CategoryDoc = HydratedDocument<ICategory>;

export const CategoryModel = model("Category", categorySchema);
