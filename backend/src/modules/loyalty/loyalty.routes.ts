import { Router } from "express";
import { requireAuth, requireRole } from "../auth/auth.middleware";
import { validate } from "../../shared/middlewares/validate";
import { idParamSchema } from "../../shared/validation/common.schemas";
import {
  updateLoyaltyConfigSchema,
  createCouponTemplateSchema,
  updateCouponTemplateSchema,
  redeemCouponSchema,
  adjustPointsSchema,
} from "./loyalty.schemas";
import * as loyaltyController from "./loyalty.controller";

export const loyaltyRouter = Router();

loyaltyRouter.get("/config", loyaltyController.getConfig);
loyaltyRouter.patch(
  "/config",
  requireAuth,
  requireRole("ADMIN"),
  validate(updateLoyaltyConfigSchema),
  loyaltyController.updateConfig,
);

loyaltyRouter.get("/points/me", requireAuth, loyaltyController.myPointsBalance);
loyaltyRouter.get("/points/me/history", requireAuth, loyaltyController.myPointsHistory);
loyaltyRouter.post(
  "/points/:id/adjust",
  requireAuth,
  requireRole("ADMIN"),
  validate(idParamSchema, "params"),
  validate(adjustPointsSchema),
  loyaltyController.adjustPoints,
);

loyaltyRouter.get("/coupon-templates", requireAuth, loyaltyController.listCouponTemplates);
loyaltyRouter.post(
  "/coupon-templates",
  requireAuth,
  requireRole("ADMIN"),
  validate(createCouponTemplateSchema),
  loyaltyController.createCouponTemplate,
);
loyaltyRouter.patch(
  "/coupon-templates/:id",
  requireAuth,
  requireRole("ADMIN"),
  validate(idParamSchema, "params"),
  validate(updateCouponTemplateSchema),
  loyaltyController.updateCouponTemplate,
);
loyaltyRouter.delete(
  "/coupon-templates/:id",
  requireAuth,
  requireRole("ADMIN"),
  validate(idParamSchema, "params"),
  loyaltyController.deleteCouponTemplate,
);

loyaltyRouter.get("/coupons/me", requireAuth, loyaltyController.listMyCoupons);
loyaltyRouter.post(
  "/coupons/redeem",
  requireAuth,
  validate(redeemCouponSchema),
  loyaltyController.redeemCoupon,
);
