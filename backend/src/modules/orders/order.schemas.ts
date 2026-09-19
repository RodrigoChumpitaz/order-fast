import { z } from "zod";
import { objectIdSchema } from "../../shared/validation/common.schemas";
import { ORDER_TYPES } from "./order.model";
import { ORDER_ACTIONS, ORDER_STATUSES } from "./order.state-machine";

const orderItemInputSchema = z.object({
  product: objectIdSchema,
  quantity: z.number().int().min(1),
});

export const createOrderSchema = z
  .object({
    type: z.enum(ORDER_TYPES),
    table: objectIdSchema.optional(),
    items: z.array(orderItemInputSchema).min(1),
    notes: z.string().optional().default(""),
    guestName: z.string().min(1).optional(),
    guestPhone: z.string().optional(),
    couponCode: z.string().min(1).optional(),
  })
  .refine((data) => data.type !== "DINE_IN" || !!data.table, {
    message: "El campo 'table' es obligatorio para pedidos de tipo DINE_IN.",
    path: ["table"],
  });

export const listOrdersQuerySchema = z.object({
  status: z.enum(ORDER_STATUSES).optional(),
});

export const updateOrderStatusSchema = z.object({
  action: z.enum(ORDER_ACTIONS),
  comment: z.string().optional().default(""),
});
