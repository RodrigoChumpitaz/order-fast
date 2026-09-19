import mongoose from "mongoose";
import { OrderModel, type OrderType } from "./order.model";
import { TableModel } from "../tables/table.model";
import { ProductModel } from "../products/product.model";
import { CouponModel } from "../loyalty/coupon.model";
import { CouponTemplateModel } from "../loyalty/couponTemplate.model";
import * as loyaltyService from "../loyalty/loyalty.service";
import * as notificationService from "../notifications/notification.service";
import type { Role, UserDoc } from "../users/user.model";
import { AppError, BusinessRuleError, ForbiddenError, NotFoundError } from "../../shared/errors/AppError";
import { round2 } from "../../shared/utils/money";
import { validateTransition, type OrderAction, type OrderStatus } from "./order.state-machine";
import { broadcastRealtimeEvent } from "../../config/realtime";
import { env } from "../../config/env";

const ORDERS_REALTIME_TOPIC = "orders";

interface CreateOrderItemInput {
  product: string;
  quantity: number;
}

interface CreateOrderInput {
  type: OrderType;
  table?: string;
  items: CreateOrderItemInput[];
  notes?: string;
  guestName?: string;
  guestPhone?: string;
  couponCode?: string;
}

const STATUS_MESSAGES: Record<OrderStatus, string> = {
  PENDING: "Tu pedido fue creado.",
  CONFIRMED: "Tu pago fue confirmado, tu pedido entra a la cola.",
  PREPARING: "Tu pedido está siendo preparado.",
  READY: "Tu pedido está listo.",
  DELIVERED: "Tu pedido fue entregado. ¡Gracias por tu compra!",
  CANCELLED: "Tu pedido fue cancelado.",
  REFUNDED: "Se procesó un reembolso de tu pedido.",
};

export async function createOrder(input: CreateOrderInput, user?: UserDoc) {
  if (!user && !input.guestName) {
    throw new BusinessRuleError("El campo 'guestName' es obligatorio para pedidos sin iniciar sesión.");
  }
  if (input.couponCode && !user) {
    throw new BusinessRuleError("Debes iniciar sesión para usar un cupón.");
  }

  let table = null;
  if (input.type === "DINE_IN") {
    table = await TableModel.findById(input.table);
    if (!table || !table.isActive) throw new NotFoundError("Mesa no encontrada.");
  }

  const productIds = input.items.map((item) => item.product);
  const products = await ProductModel.find({ _id: { $in: productIds }, isActive: true });
  const productMap = new Map(products.map((product) => [product.id, product]));

  const items = input.items.map((item) => {
    const product = productMap.get(item.product);
    if (!product) throw new NotFoundError(`Producto ${item.product} no encontrado.`);
    if (!product.isAvailable) throw new BusinessRuleError(`El producto '${product.name}' no está disponible.`);
    if (product.stock !== null && product.stock !== undefined && product.stock < item.quantity) {
      throw new BusinessRuleError(`Stock insuficiente para '${product.name}'.`);
    }
    return {
      product: product._id,
      productName: product.name,
      unitPrice: product.price,
      quantity: item.quantity,
      subtotal: round2(product.price * item.quantity),
    };
  });

  const subtotal = round2(items.reduce((sum, item) => sum + item.subtotal, 0));

  let coupon = null;
  let discount = 0;
  if (input.couponCode && user) {
    coupon = await CouponModel.findOne({ uniqueCode: input.couponCode, customer: user._id });
    if (!coupon || coupon.status !== "AVAILABLE" || coupon.expiresAt <= new Date()) {
      throw new BusinessRuleError("Cupón no válido o expirado.");
    }
    const template = await CouponTemplateModel.findById(coupon.template);
    if (!template) throw new NotFoundError("Recompensa del cupón no encontrada.");
    discount =
      template.discountType === "PERCENTAGE" ? round2(subtotal * (template.discountValue / 100)) : template.discountValue;
    discount = Math.min(discount, subtotal);
  }

  const total = round2(subtotal - discount);

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    for (const item of items) {
      const product = productMap.get(item.product.toString());
      if (product && product.stock !== null && product.stock !== undefined) {
        const updated = await ProductModel.findOneAndUpdate(
          { _id: product._id, stock: { $gte: item.quantity } },
          { $inc: { stock: -item.quantity } },
          { session, new: true },
        );
        if (!updated) throw new BusinessRuleError(`Stock insuficiente para '${product.name}'.`);
      }
    }

    const [order] = await OrderModel.create(
      [
        {
          customer: user?._id ?? null,
          guestName: user ? "" : input.guestName,
          guestPhone: user ? "" : (input.guestPhone ?? ""),
          type: input.type,
          table: table?._id ?? null,
          items,
          subtotal,
          discount,
          appliedCoupon: coupon?._id ?? null,
          total,
          status: "PENDING",
          statusHistory: [{ status: "PENDING", comment: "Pedido creado" }],
          notes: input.notes ?? "",
        },
      ],
      { session },
    );

    if (coupon) {
      coupon.status = "USED";
      coupon.usedAt = new Date();
      coupon.usedInOrder = order._id;
      await coupon.save({ session });
    }

    if (table) {
      table.status = "OCCUPIED";
      await table.save({ session });
    }

    await session.commitTransaction();

    try {
      await broadcastRealtimeEvent(ORDERS_REALTIME_TOPIC, "new_order", {
        orderId: order._id.toString(),
        type: order.type,
      });
    } catch {}

    return order;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

export async function listOrders(filters: { status?: OrderStatus }) {
  const query: Record<string, unknown> = {};
  if (filters.status) query.status = filters.status;
  return OrderModel.find(query)
    .populate("table")
    .populate("customer")
    .populate("items.product")
    .sort({ createdAt: -1 });
}

export async function getOrderById(id: string) {
  const order = await OrderModel.findById(id).populate("table").populate("customer").populate("items.product");
  if (!order) throw new NotFoundError("Pedido no encontrado.");
  return order;
}

export async function transitionOrder(
  id: string,
  action: OrderAction,
  opts: { comment?: string; updatedBy?: string },
) {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const order = await OrderModel.findById(id).session(session);
    if (!order) throw new NotFoundError("Pedido no encontrado.");

    const nextStatus = validateTransition(order.status as OrderStatus, action);

    if (action === "cancel") {
      for (const item of order.items) {
        await ProductModel.updateOne(
          { _id: item.product, stock: { $ne: null } },
          { $inc: { stock: item.quantity } },
          { session },
        );
      }
    }

    if (action === "deliver" && order.customer) {
      const config = await loyaltyService.getLoyaltyConfig();
      const points = Math.floor(order.total * config.pointsPerCurrencyUnit);
      if (points > 0) {
        await loyaltyService.insertPointsMovement(order.customer, "PURCHASE_ACCRUAL", points, {
          order: order._id,
          description: "Puntos por compra",
          session,
        });
        order.pointsEarned = points;
      }
    }

    if (action === "refund" && order.customer && order.pointsEarned > 0) {
      await loyaltyService.insertPointsMovement(order.customer, "ADMIN_ADJUSTMENT", -order.pointsEarned, {
        order: order._id,
        description: "Reverso de puntos por reembolso",
        session,
      });
    }

    order.status = nextStatus;
    order.statusHistory.push({
      status: nextStatus,
      comment: opts.comment ?? "",
      updatedBy: opts.updatedBy ? new mongoose.Types.ObjectId(opts.updatedBy) : null,
    });
    await order.save({ session });

    if ((nextStatus === "DELIVERED" || nextStatus === "CANCELLED" || nextStatus === "REFUNDED") && order.table) {
      const stillActive = await OrderModel.exists({
        table: order.table,
        _id: { $ne: order._id },
        status: { $nin: ["DELIVERED", "CANCELLED", "REFUNDED"] },
      }).session(session);
      if (!stillActive) {
        await TableModel.findByIdAndUpdate(order.table, { status: "FREE" }, { session });
      }
    }

    await session.commitTransaction();

    if (order.customer) {
      try {
        await notificationService.createNotification(
          order.customer,
          "ORDER_UPDATED",
          "Pedido actualizado",
          STATUS_MESSAGES[nextStatus],
          order._id,
        );
      } catch {}
    }

    try {
      await broadcastRealtimeEvent(ORDERS_REALTIME_TOPIC, "order_status_changed", {
        orderId: order._id.toString(),
        status: nextStatus,
      });
    } catch {}

    return order;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

export async function cancelOrder(id: string, actor: { user?: UserDoc }, comment?: string) {
  const order = await OrderModel.findById(id);
  if (!order) throw new NotFoundError("Pedido no encontrado.");

  const isStaff = actor.user?.role === "STAFF" || actor.user?.role === "ADMIN";
  const isOwner = !!actor.user && !!order.customer && order.customer.toString() === actor.user._id.toString();
  const isGuestOrder = !order.customer;

  const allowed = isStaff || isOwner || (isGuestOrder && !actor.user);
  if (!allowed) {
    throw new ForbiddenError("No puedes cancelar este pedido.");
  }
  if (!isStaff && order.status !== "PENDING") {
    throw new AppError("Solo se puede cancelar un pedido mientras está pendiente.", 422);
  }

  return transitionOrder(id, "cancel", { comment, updatedBy: actor.user?._id?.toString() });
}

const ACTION_ROLES: Partial<Record<OrderAction, Role[]>> = {
  confirm: ["STAFF", "ADMIN"],
  prepare: ["STAFF", "ADMIN"],
  markReady: ["STAFF", "ADMIN"],
  deliver: ["STAFF", "ADMIN"],
  refund: ["ADMIN"],
};

export async function updateOrderStatus(
  id: string,
  action: OrderAction,
  actor: { user?: UserDoc },
  comment?: string,
) {
  if (action === "cancel") {
    return cancelOrder(id, actor, comment);
  }

  const allowedRoles = ACTION_ROLES[action];
  if (!allowedRoles || !actor.user || !allowedRoles.includes(actor.user.role as Role)) {
    throw new ForbiddenError();
  }

  return transitionOrder(id, action, { comment, updatedBy: actor.user._id.toString() });
}

export async function getWaitEstimate() {
  const activeOrders = await OrderModel.countDocuments({ status: { $in: ["CONFIRMED", "PREPARING"] } });
  const estimatedMinutes = activeOrders * env.AVERAGE_PREP_MINUTES;
  return { activeOrders, estimatedMinutes };
}
