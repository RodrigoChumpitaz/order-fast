import { Router } from "express";
import { requireAuth, requireRole } from "../auth/auth.middleware";
import { validate } from "../../shared/middlewares/validate";
import { idParamSchema } from "../../shared/validation/common.schemas";
import { createTableSchema, updateTableSchema } from "./table.schemas";
import * as tableController from "./table.controller";

export const tableRouter = Router();

tableRouter.get("/", requireAuth, requireRole("STAFF", "ADMIN"), tableController.list);

tableRouter.get("/:id", validate(idParamSchema, "params"), tableController.getById);

tableRouter.get(
  "/:id/qr",
  requireAuth,
  requireRole("ADMIN"),
  validate(idParamSchema, "params"),
  tableController.getQr,
);

tableRouter.post("/", requireAuth, requireRole("ADMIN"), validate(createTableSchema), tableController.create);

tableRouter.patch(
  "/:id",
  requireAuth,
  requireRole("ADMIN"),
  validate(idParamSchema, "params"),
  validate(updateTableSchema),
  tableController.update,
);

tableRouter.delete(
  "/:id",
  requireAuth,
  requireRole("ADMIN"),
  validate(idParamSchema, "params"),
  tableController.remove,
);
