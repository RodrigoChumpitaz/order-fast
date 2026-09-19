import type { Request, Response } from "express";
import { asyncHandler } from "../../shared/utils/asyncHandler";
import { ok } from "../../shared/utils/apiResponse";
import * as categoryService from "./category.service";

export const list = asyncHandler(async (_req: Request, res: Response) => {
  const categories = await categoryService.listCategories();
  ok(res, categories);
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const category = await categoryService.getCategoryById(req.params.id);
  ok(res, category);
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const category = await categoryService.createCategory(req.body);
  ok(res, category, "Categoría creada", 201);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const category = await categoryService.updateCategory(req.params.id, req.body);
  ok(res, category, "Categoría actualizada");
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await categoryService.deleteCategory(req.params.id);
  ok(res, null, "Categoría eliminada");
});
