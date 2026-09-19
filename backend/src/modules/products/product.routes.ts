import { Router } from "express";
import { requireAuth, requireRole } from "../auth/auth.middleware";
import { validate } from "../../shared/middlewares/validate";
import { idParamSchema } from "../../shared/validation/common.schemas";
import {
  createProductSchema,
  updateProductSchema,
  listProductsQuerySchema,
  setAvailabilitySchema,
} from "./product.schemas";
import * as productController from "./product.controller";

export const productRouter = Router();

productRouter.get("/", validate(listProductsQuerySchema, "query"), productController.list);

productRouter.get("/:id", validate(idParamSchema, "params"), productController.getById);

productRouter.post(
  "/",
  requireAuth,
  requireRole("ADMIN"),
  validate(createProductSchema),
  productController.create,
);

productRouter.patch(
  "/:id",
  requireAuth,
  requireRole("ADMIN"),
  validate(idParamSchema, "params"),
  validate(updateProductSchema),
  productController.update,
);

productRouter.patch(
  "/:id/availability",
  requireAuth,
  requireRole("STAFF", "ADMIN"),
  validate(idParamSchema, "params"),
  validate(setAvailabilitySchema),
  productController.updateAvailability,
);

productRouter.delete(
  "/:id",
  requireAuth,
  requireRole("ADMIN"),
  validate(idParamSchema, "params"),
  productController.remove,
);
