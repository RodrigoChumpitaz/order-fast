import { NotificationModel, type NotificationType } from "./notification.model";
import { NotFoundError } from "../../shared/errors/AppError";

export async function createNotification(
  userId: unknown,
  type: NotificationType,
  title: string,
  message: string,
  orderId?: unknown,
) {
  return NotificationModel.create({ user: userId, type, title, message, order: orderId ?? null });
}

export async function listMyNotifications(userId: unknown) {
  return NotificationModel.find({ user: userId }).sort({ createdAt: -1 }).limit(50);
}

export async function getUnreadCount(userId: unknown) {
  return NotificationModel.countDocuments({ user: userId, isRead: false });
}

export async function markAsRead(userId: unknown, id: string) {
  const notification = await NotificationModel.findOne({ _id: id, user: userId });
  if (!notification) throw new NotFoundError("Notificación no encontrada.");
  notification.isRead = true;
  await notification.save();
  return notification;
}

export async function markAllAsRead(userId: unknown) {
  await NotificationModel.updateMany({ user: userId, isRead: false }, { isRead: true });
}
