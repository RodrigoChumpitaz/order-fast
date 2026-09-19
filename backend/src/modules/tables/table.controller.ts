import type { Request, Response } from "express";
import { asyncHandler } from "../../shared/utils/asyncHandler";
import { ok } from "../../shared/utils/apiResponse";
import * as tableService from "./table.service";

export const list = asyncHandler(async (_req: Request, res: Response) => {
  const tables = await tableService.listTables();
  ok(res, tables);
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const table = await tableService.getTableById(req.params.id);
  ok(res, table);
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const table = await tableService.createTable(req.body);
  ok(res, table, "Mesa creada", 201);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const table = await tableService.updateTable(req.params.id, req.body);
  ok(res, table, "Mesa actualizada");
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await tableService.deleteTable(req.params.id);
  ok(res, null, "Mesa eliminada");
});

export const getQr = asyncHandler(async (req: Request, res: Response) => {
  const table = await tableService.getTableById(req.params.id);
  const png = await tableService.generateTableQrPng(table);
  res.setHeader("Content-Type", "image/png");
  res.send(png);
});
