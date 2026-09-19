import { z } from "zod";
import { ROLES } from "./user.model";

export const updateRoleSchema = z.object({
  role: z.enum(ROLES),
});
