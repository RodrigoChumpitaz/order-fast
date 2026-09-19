import type { Request, Response } from "express";
import { asyncHandler } from "../../shared/utils/asyncHandler";
import { ok } from "../../shared/utils/apiResponse";
import * as loyaltyService from "./loyalty.service";

export const getConfig = asyncHandler(async (_req: Request, res: Response) => {
  const config = await loyaltyService.getLoyaltyConfig();
  ok(res, config);
});

export const updateConfig = asyncHandler(async (req: Request, res: Response) => {
  const config = await loyaltyService.updateLoyaltyConfig(req.body);
  ok(res, config, "Configuración actualizada");
});

export const myPointsBalance = asyncHandler(async (req: Request, res: Response) => {
  const balance = await loyaltyService.getMyPointsBalance(req.user!._id);
  ok(res, { balance });
});

export const myPointsHistory = asyncHandler(async (req: Request, res: Response) => {
  const history = await loyaltyService.getMyPointsHistory(req.user!._id);
  ok(res, history);
});

export const adjustPoints = asyncHandler(async (req: Request, res: Response) => {
  const entry = await loyaltyService.adjustPoints(req.params.id, req.body.amount, req.body.description);
  ok(res, entry, "Ajuste registrado", 201);
});

export const listCouponTemplates = asyncHandler(async (_req: Request, res: Response) => {
  const templates = await loyaltyService.listCouponTemplates();
  ok(res, templates);
});

export const createCouponTemplate = asyncHandler(async (req: Request, res: Response) => {
  const template = await loyaltyService.createCouponTemplate(req.body);
  ok(res, template, "Recompensa creada", 201);
});

export const updateCouponTemplate = asyncHandler(async (req: Request, res: Response) => {
  const template = await loyaltyService.updateCouponTemplate(req.params.id, req.body);
  ok(res, template, "Recompensa actualizada");
});

export const deleteCouponTemplate = asyncHandler(async (req: Request, res: Response) => {
  await loyaltyService.deleteCouponTemplate(req.params.id);
  ok(res, null, "Recompensa eliminada");
});

export const listMyCoupons = asyncHandler(async (req: Request, res: Response) => {
  const coupons = await loyaltyService.listMyCoupons(req.user!._id);
  ok(res, coupons);
});

export const redeemCoupon = asyncHandler(async (req: Request, res: Response) => {
  const coupon = await loyaltyService.redeemCoupon(req.user!._id, req.body.templateId);
  ok(res, coupon, "Cupón canjeado", 201);
});
