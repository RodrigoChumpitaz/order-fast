import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose";
import { ORDER_STATUSES } from "./order.state-machine";

export const ORDER_TYPES = ["DINE_IN", "TAKEAWAY"] as const;
export type OrderType = (typeof ORDER_TYPES)[number];

const orderItemSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    productName: { type: String, required: true },
    unitPrice: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    subtotal: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const orderHistoryEntrySchema = new Schema(
  {
    status: { type: String, enum: ORDER_STATUSES, required: true },
    date: { type: Date, default: Date.now },
    comment: { type: String, trim: true, default: "" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  { _id: false },
);

const orderSchema = new Schema(
  {
    customer: { type: Schema.Types.ObjectId, ref: "User", default: null, index: true },
    guestName: { type: String, trim: true, default: "" },
    guestPhone: { type: String, trim: true, default: "" },

    type: { type: String, enum: ORDER_TYPES, required: true },
    table: { type: Schema.Types.ObjectId, ref: "Table", default: null },

    items: { type: [orderItemSchema], required: true, validate: (v: unknown[]) => v.length > 0 },

    subtotal: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    appliedCoupon: { type: Schema.Types.ObjectId, ref: "Coupon", default: null },
    total: { type: Number, required: true, min: 0 },

    pointsEarned: { type: Number, default: 0, min: 0 },

    status: { type: String, enum: ORDER_STATUSES, default: "PENDING", required: true, index: true },
    statusHistory: { type: [orderHistoryEntrySchema], default: [] },

    notes: { type: String, trim: true, default: "" },
  },
  { timestamps: true },
);

orderSchema.pre("validate", function validateOrder(next) {
  if (this.type === "DINE_IN" && !this.table) {
    next(new Error("Un pedido de tipo DINE_IN requiere una mesa asignada"));
    return;
  }
  if (!this.customer && !this.guestName) {
    next(new Error("Un pedido sin cliente autenticado requiere un guestName"));
    return;
  }
  next();
});

export type IOrder = InferSchemaType<typeof orderSchema>;
export type OrderDoc = HydratedDocument<IOrder>;

export const OrderModel = model("Order", orderSchema);
