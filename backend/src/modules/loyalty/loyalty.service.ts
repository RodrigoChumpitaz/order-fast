import mongoose, { type ClientSession } from "mongoose";
import { randomBytes } from "node:crypto";
import { LoyaltyConfigModel } from "./loyaltyConfig.model";
import { CouponTemplateModel, type DiscountType } from "./couponTemplate.model";
import { CouponModel } from "./coupon.model";
import { PointsLedgerModel, type PointsMovementType } from "./pointsLedger.model";
import { AppError, BusinessRuleError, NotFoundError } from "../../shared/errors/AppError";
import { isDuplicateKeyError, duplicateKeyField } from "../../shared/utils/mongoErrors";

interface CreateCouponTemplateInput {
  name: string;
  pointsCost: number;
  discountType: DiscountType;
  discountValue: number;
  validityDays?: number;
}

interface UpdateCouponTemplateInput extends Partial<CreateCouponTemplateInput> {
  isActive?: boolean;
}

export async function getLoyaltyConfig() {
  let config = await LoyaltyConfigModel.findOne();
  if (!config) config = await LoyaltyConfigModel.create({});
  return config;
}

export async function updateLoyaltyConfig(input: { pointsPerCurrencyUnit: number }) {
  const config = await getLoyaltyConfig();
  config.pointsPerCurrencyUnit = input.pointsPerCurrencyUnit;
  await config.save();
  return config;
}

async function getCurrentBalance(customerId: unknown, session?: ClientSession) {
  const last = await PointsLedgerModel.findOne({ customer: customerId })
    .sort({ createdAt: -1 })
    .session(session ?? null);
  return last?.resultingBalance ?? 0;
}

export async function insertPointsMovement(
  customerId: unknown,
  type: PointsMovementType,
  amount: number,
  opts: { order?: unknown; description?: string; session?: ClientSession } = {},
) {
  const currentBalance = await getCurrentBalance(customerId, opts.session);
  const resultingBalance = currentBalance + amount;
  if (resultingBalance < 0) {
    throw new BusinessRuleError("El saldo de puntos no puede quedar negativo.");
  }

  const [entry] = await PointsLedgerModel.create(
    [
      {
        customer: customerId,
        type,
        amount,
        resultingBalance,
        order: opts.order ?? null,
        description: opts.description ?? "",
      },
    ],
    { session: opts.session },
  );
  return entry;
}

export async function getMyPointsBalance(customerId: unknown) {
  return getCurrentBalance(customerId);
}

export async function getMyPointsHistory(customerId: unknown) {
  return PointsLedgerModel.find({ customer: customerId }).sort({ createdAt: -1 }).limit(50);
}

export async function adjustPoints(customerId: unknown, amount: number, description: string) {
  return insertPointsMovement(customerId, "ADMIN_ADJUSTMENT", amount, { description });
}

export async function listCouponTemplates() {
  return CouponTemplateModel.find({ isActive: true }).sort({ pointsCost: 1 });
}

export async function getCouponTemplateById(id: string) {
  const template = await CouponTemplateModel.findById(id);
  if (!template) throw new NotFoundError("Recompensa no encontrada.");
  return template;
}

export async function createCouponTemplate(input: CreateCouponTemplateInput) {
  return CouponTemplateModel.create({
    name: input.name,
    pointsCost: input.pointsCost,
    discountType: input.discountType,
    discountValue: input.discountValue,
    validityDays: input.validityDays ?? 30,
  });
}

export async function updateCouponTemplate(id: string, input: UpdateCouponTemplateInput) {
  const template = await getCouponTemplateById(id);
  if (input.name !== undefined) template.name = input.name;
  if (input.pointsCost !== undefined) template.pointsCost = input.pointsCost;
  if (input.discountType !== undefined) template.discountType = input.discountType;
  if (input.discountValue !== undefined) template.discountValue = input.discountValue;
  if (input.validityDays !== undefined) template.validityDays = input.validityDays;
  if (input.isActive !== undefined) template.isActive = input.isActive;
  await template.save();
  return template;
}

export async function deleteCouponTemplate(id: string) {
  const template = await getCouponTemplateById(id);
  template.isActive = false;
  await template.save();
  return template;
}

function generateUniqueCode(): string {
  return randomBytes(5).toString("hex").toUpperCase();
}

export async function listMyCoupons(customerId: unknown) {
  const coupons = await CouponModel.find({ customer: customerId }).populate("template").sort({ createdAt: -1 });
  const now = new Date();
  for (const coupon of coupons) {
    if (coupon.status === "AVAILABLE" && coupon.expiresAt <= now) {
      coupon.status = "EXPIRED";
      await coupon.save();
    }
  }
  return coupons;
}

export async function redeemCoupon(customerId: unknown, templateId: string) {
  const template = await getCouponTemplateById(templateId);
  if (!template.isActive) throw new NotFoundError("Recompensa no encontrada.");

  const expiresAt = new Date(Date.now() + template.validityDays * 24 * 60 * 60 * 1000);

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    await insertPointsMovement(customerId, "COUPON_REDEMPTION", -template.pointsCost, {
      description: `Canje: ${template.name}`,
      session,
    });

    let coupon = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const [created] = await CouponModel.create(
          [
            {
              customer: customerId,
              template: template._id,
              uniqueCode: generateUniqueCode(),
              status: "AVAILABLE",
              expiresAt,
            },
          ],
          { session },
        );
        coupon = created;
        break;
      } catch (error) {
        if (isDuplicateKeyError(error) && attempt < 2) continue;
        if (isDuplicateKeyError(error)) {
          throw new AppError(`El campo '${duplicateKeyField(error)}' ya está en uso.`, 409);
        }
        throw error;
      }
    }
    if (!coupon) throw new AppError("No se pudo generar un cupón único.", 500);

    await session.commitTransaction();
    return coupon;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}
