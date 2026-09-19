import type { NextFunction, Request, Response } from "express";
import { jwtVerify } from "jose";
import { supabaseJWKS } from "../../config/jwks";
import { AppError, ForbiddenError } from "../../shared/errors/AppError";
import { UserModel, type Role, type UserDoc } from "../users/user.model";

async function verifyAndLoadUser(authorizationHeader: string): Promise<UserDoc | null> {
  const token = authorizationHeader.slice("Bearer ".length);
  const { payload } = await jwtVerify(token, supabaseJWKS);

  const supabaseUserId = payload.sub;
  if (!supabaseUserId) return null;
  const email = typeof payload.email === "string" ? payload.email : "";

  let user = await UserModel.findOne({ supabaseUserId });
  if (!user) {
    user = await UserModel.create({ supabaseUserId, email, role: "CUSTOMER" });
  }
  return user;
}

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      throw new AppError("No autenticado", 401);
    }

    const user = await verifyAndLoadUser(header);
    if (!user) {
      throw new AppError("Token inválido o expirado", 401);
    }
    if (!user.isActive) {
      throw new AppError("Cuenta deshabilitada", 403);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof AppError) return next(error);
    next(new AppError("Token inválido o expirado", 401));
  }
}

export async function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return next();
  }

  try {
    const user = await verifyAndLoadUser(header);
    if (user?.isActive) {
      req.user = user;
    }
  } catch {}
  next();
}

export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role as Role)) {
      return next(new ForbiddenError());
    }
    next();
  };
}
