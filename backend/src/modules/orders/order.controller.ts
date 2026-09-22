import type { Request, Response } from "express";
import { asyncHandler } from "../../shared/utils/asyncHandler";
import { ok } from "../../shared/utils/apiResponse";
import * as orderService from "./order.service";
import type { OrderStatus } from "./order.state-machine";

export const create = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.createOrder(req.body, req.user);
  ok(res, order, "Pedido creado", 201);
});

export const list = asyncHandler(async (req: Request, res: Response) => {
  const { orders, total, page, limit } = await orderService.listOrders({
    status: req.query.status as OrderStatus | undefined,
    page: req.query.page ? Number(req.query.page) : undefined,
    limit: req.query.limit ? Number(req.query.limit) : undefined,
  });
  ok(res, orders, "OK", 200, { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) });
});

export const waitEstimate = asyncHandler(async (_req: Request, res: Response) => {
  const estimate = await orderService.getWaitEstimate();
  ok(res, estimate);
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.getOrderById(req.params.id);
  ok(res, order);
});

export const updateStatus = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.updateOrderStatus(
    req.params.id,
    req.body.action,
    { user: req.user },
    req.body.comment,
  );
  ok(res, order, "Estado del pedido actualizado");
});
