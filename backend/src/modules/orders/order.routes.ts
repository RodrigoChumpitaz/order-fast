import { Router } from "express";
import { optionalAuth, requireAuth, requireRole } from "../auth/auth.middleware";
import { validate } from "../../shared/middlewares/validate";
import { idParamSchema } from "../../shared/validation/common.schemas";
import { createOrderSchema, listOrdersQuerySchema, updateOrderStatusSchema } from "./order.schemas";
import * as orderController from "./order.controller";

export const orderRouter = Router();

orderRouter.post("/", optionalAuth, validate(createOrderSchema), orderController.create);

orderRouter.get(
  "/",
  requireAuth,
  requireRole("STAFF", "ADMIN"),
  validate(listOrdersQuerySchema, "query"),
  orderController.list,
);

orderRouter.get("/wait-estimate", orderController.waitEstimate);

orderRouter.get("/:id", validate(idParamSchema, "params"), orderController.getById);

orderRouter.patch(
  "/:id/status",
  optionalAuth,
  validate(idParamSchema, "params"),
  validate(updateOrderStatusSchema),
  orderController.updateStatus,
);
