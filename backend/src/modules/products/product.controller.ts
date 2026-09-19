import type { Request, Response } from "express";
import { asyncHandler } from "../../shared/utils/asyncHandler";
import { ok } from "../../shared/utils/apiResponse";
import * as productService from "./product.service";

export const list = asyncHandler(async (req: Request, res: Response) => {
  const products = await productService.listProducts({ category: req.query.category as string | undefined });
  ok(res, products);
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const product = await productService.getProductById(req.params.id);
  ok(res, product);
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const product = await productService.createProduct(req.body);
  ok(res, product, "Producto creado", 201);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const product = await productService.updateProduct(req.params.id, req.body);
  ok(res, product, "Producto actualizado");
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await productService.deleteProduct(req.params.id);
  ok(res, null, "Producto eliminado");
});

export const updateAvailability = asyncHandler(async (req: Request, res: Response) => {
  const product = await productService.setAvailability(req.params.id, req.body.isAvailable);
  ok(res, product, "Disponibilidad actualizada");
});
