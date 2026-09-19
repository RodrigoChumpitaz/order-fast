import { Router } from "express";
import { requireAuth, requireRole } from "../auth/auth.middleware";
import { validate } from "../../shared/middlewares/validate";
import { idParamSchema } from "../../shared/validation/common.schemas";
import { updateRoleSchema } from "./user.schemas";
import * as userController from "./user.controller";

export const userRouter = Router();

userRouter.get("/me", requireAuth, userController.me);

userRouter.get("/", requireAuth, requireRole("ADMIN"), userController.list);

userRouter.patch(
  "/:id/role",
  requireAuth,
  requireRole("ADMIN"),
  validate(idParamSchema, "params"),
  validate(updateRoleSchema),
  userController.updateRole,
);
