import type { Request, Response } from "express";
import { asyncHandler } from "../../shared/utils/asyncHandler";
import { ok } from "../../shared/utils/apiResponse";
import * as notificationService from "./notification.service";

export const list = asyncHandler(async (req: Request, res: Response) => {
  const notifications = await notificationService.listMyNotifications(req.user!._id);
  ok(res, notifications);
});

export const unreadCount = asyncHandler(async (req: Request, res: Response) => {
  const count = await notificationService.getUnreadCount(req.user!._id);
  ok(res, { count });
});

export const markAsRead = asyncHandler(async (req: Request, res: Response) => {
  const notification = await notificationService.markAsRead(req.user!._id, req.params.id);
  ok(res, notification, "Notificación marcada como leída");
});

export const markAllAsRead = asyncHandler(async (req: Request, res: Response) => {
  await notificationService.markAllAsRead(req.user!._id);
  ok(res, null, "Notificaciones marcadas como leídas");
});
