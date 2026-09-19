import type { NextFunction, Request, Response } from "express";
import { Error as MongooseError } from "mongoose";
import { ZodError } from "zod";
import { AppError } from "../errors/AppError";
import { formatZodError } from "../utils/zodError";
import { logger } from "../../config/logger";

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    success: false,
    error: { message: `Ruta no encontrada: ${req.method} ${req.originalUrl}` },
  });
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(422).json({
      success: false,
      error: { message: "Datos de entrada inválidos", details: formatZodError(err) },
    });
  }

  if (err instanceof MongooseError.ValidationError) {
    return res.status(422).json({
      success: false,
      error: {
        message: "Datos de entrada inválidos",
        details: Object.values(err.errors).map((e) => ({ campo: e.path, mensaje: e.message })),
      },
    });
  }

  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      logger.error({ err }, err.message);
    }
    return res.status(err.statusCode).json({
      success: false,
      error: { message: err.message, details: err.details },
    });
  }

  logger.error({ err }, "Error no controlado");
  return res.status(500).json({
    success: false,
    error: { message: "Error interno del servidor" },
  });
}
