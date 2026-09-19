export class AppError extends Error {
  readonly statusCode: number;
  readonly details?: unknown;

  constructor(message: string, statusCode = 400, details?: unknown) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.details = details;
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Recurso no encontrado") {
    super(message, 404);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "No autorizado para esta acción") {
    super(message, 403);
  }
}

export class BusinessRuleError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 422, details);
  }
}

export interface CampoError {
  campo: string;
  mensaje: string;
}

export class ValidationError extends AppError {
  constructor(errores: CampoError[]) {
    super("Datos de entrada inválidos", 422, errores);
  }
}
