import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose";

export const NOTIFICATION_TYPES = ["ORDER_UPDATED", "NEW_ORDER", "COUPON_EARNED", "SYSTEM"] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

const notificationSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, enum: NOTIFICATION_TYPES, required: true },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    order: { type: Schema.Types.ObjectId, ref: "Order", default: null },
    isRead: { type: Boolean, default: false, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export type INotification = InferSchemaType<typeof notificationSchema>;
export type NotificationDoc = HydratedDocument<INotification>;

export const NotificationModel = model("Notification", notificationSchema);
