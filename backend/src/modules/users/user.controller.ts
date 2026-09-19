import type { Request, Response } from "express";
import { asyncHandler } from "../../shared/utils/asyncHandler";
import { ok } from "../../shared/utils/apiResponse";
import * as userService from "./user.service";

export const me = asyncHandler(async (req: Request, res: Response) => {
  ok(res, req.user);
});

export const list = asyncHandler(async (_req: Request, res: Response) => {
  const users = await userService.listUsers();
  ok(res, users);
});

export const updateRole = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.updateUserRole(req.params.id, req.body.role);
  ok(res, user, "Rol actualizado");
});
