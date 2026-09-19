import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware";
import { validate } from "../../shared/middlewares/validate";
import { idParamSchema } from "../../shared/validation/common.schemas";
import * as notificationController from "./notification.controller";

export const notificationRouter = Router();

notificationRouter.get("/me", requireAuth, notificationController.list);
notificationRouter.get("/me/unread-count", requireAuth, notificationController.unreadCount);
notificationRouter.patch(
  "/:id/read",
  requireAuth,
  validate(idParamSchema, "params"),
  notificationController.markAsRead,
);
notificationRouter.patch("/read-all", requireAuth, notificationController.markAllAsRead);
