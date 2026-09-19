import type { UserDoc } from "../../modules/users/user.model";

declare global {
  namespace Express {
    interface Request {
      user?: UserDoc;
    }
  }
}

export {};
