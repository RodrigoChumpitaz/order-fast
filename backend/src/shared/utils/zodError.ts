import type { ZodError, ZodIssue } from "zod";
import type { CampoError } from "../errors/AppError";

function describirIssue(issue: ZodIssue): string {
  const campo = issue.path.length > 0 ? issue.path.join(".") : "valor";

  switch (issue.code) {
    case "invalid_type":
      return issue.received === "undefined"
        ? `El campo '${campo}' es obligatorio.`
        : `El campo '${campo}' tiene un tipo inválido.`;

    case "too_small":
      if (issue.type === "string" && issue.minimum === 1) {
        return `El campo '${campo}' es obligatorio.`;
      }
      if (issue.type === "array") {
        return `El campo '${campo}' debe tener al menos ${issue.minimum} elemento(s).`;
      }
      return `El campo '${campo}' debe ser mayor o igual a ${issue.minimum}.`;

    case "too_big":
      if (issue.type === "array") {
        return `El campo '${campo}' debe tener como máximo ${issue.maximum} elemento(s).`;
      }
      return `El campo '${campo}' debe ser menor o igual a ${issue.maximum}.`;

    case "invalid_string":
      if (issue.validation === "email") {
        return `El campo '${campo}' debe ser un correo válido.`;
      }
      if (issue.validation === "regex") {
        return `El campo '${campo}' no tiene un formato válido.`;
      }
      return `El campo '${campo}' tiene un formato inválido.`;

    case "invalid_enum_value":
      return `El campo '${campo}' debe ser uno de: ${issue.options.join(", ")}.`;

    default:
      return issue.message || `El campo '${campo}' es inválido.`;
  }
}

export function formatZodError(error: ZodError): CampoError[] {
  return error.issues.map((issue) => ({
    campo: issue.path.length > 0 ? issue.path.join(".") : "valor",
    mensaje: describirIssue(issue),
  }));
}
