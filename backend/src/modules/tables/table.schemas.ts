import { z } from "zod";
import { TABLE_STATUSES } from "./table.model";

export const createTableSchema = z.object({
  number: z.number().int().min(1),
  capacity: z.number().int().min(1).optional(),
});

export const updateTableSchema = z.object({
  number: z.number().int().min(1).optional(),
  capacity: z.number().int().min(1).optional(),
  status: z.enum(TABLE_STATUSES).optional(),
  isActive: z.boolean().optional(),
});
