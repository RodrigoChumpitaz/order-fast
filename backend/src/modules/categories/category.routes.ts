import { Router } from "express";
import { requireAuth, requireRole } from "../auth/auth.middleware";
import { validate } from "../../shared/middlewares/validate";
import { idParamSchema } from "../../shared/validation/common.schemas";
import { createCategorySchema, updateCategorySchema } from "./category.schemas";
import * as categoryController from "./category.controller";

export const categoryRouter = Router();

categoryRouter.get("/", categoryController.list);

categoryRouter.get("/:id", validate(idParamSchema, "params"), categoryController.getById);

categoryRouter.post(
  "/",
  requireAuth,
  requireRole("ADMIN"),
  validate(createCategorySchema),
  categoryController.create,
);

categoryRouter.patch(
  "/:id",
  requireAuth,
  requireRole("ADMIN"),
  validate(idParamSchema, "params"),
  validate(updateCategorySchema),
  categoryController.update,
);

categoryRouter.delete(
  "/:id",
  requireAuth,
  requireRole("ADMIN"),
  validate(idParamSchema, "params"),
  categoryController.remove,
);
