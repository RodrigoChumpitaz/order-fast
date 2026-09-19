import { Schema, model, Types, type InferSchemaType, type HydratedDocument } from "mongoose";

const productSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: "" },
    price: { type: Number, required: true, min: 0 },
    imageUrl: { type: String, trim: true, default: "" },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true, index: true },
    stock: { type: Number, default: null, min: 0 },
    isAvailable: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

productSchema.index({ name: "text", description: "text" });

export type IProduct = InferSchemaType<typeof productSchema>;
export type ProductDoc = HydratedDocument<IProduct>;

export const ProductModel = model("Product", productSchema);
export type ProductId = Types.ObjectId;
