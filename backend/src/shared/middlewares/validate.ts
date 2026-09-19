import type { NextFunction, Request, Response } from "express";
import type { ZodSchema } from "zod";
import { ValidationError } from "../errors/AppError";
import { formatZodError } from "../utils/zodError";

type Source = "body" | "query" | "params";

export function validate(schema: ZodSchema, source: Source = "body") {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      return next(new ValidationError(formatZodError(result.error)));
    }

    if (source === "body") {
      req.body = result.data;
    } else {
      Object.assign(req[source], result.data);
    }
    next();
  };
}
