interface DuplicateKeyError {
  code: number;
  keyPattern?: Record<string, unknown>;
}

export function isDuplicateKeyError(error: unknown): error is DuplicateKeyError {
  return typeof error === "object" && error !== null && "code" in error && (error as { code: unknown }).code === 11000;
}

export function duplicateKeyField(error: DuplicateKeyError): string {
  return error.keyPattern ? Object.keys(error.keyPattern)[0] ?? "valor" : "valor";
}
