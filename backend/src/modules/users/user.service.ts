import { UserModel, type Role } from "./user.model";
import { NotFoundError } from "../../shared/errors/AppError";

export async function listUsers() {
  return UserModel.find().sort({ createdAt: -1 });
}

export async function getUserById(id: string) {
  const user = await UserModel.findById(id);
  if (!user) throw new NotFoundError("Usuario no encontrado.");
  return user;
}

export async function updateUserRole(id: string, role: Role) {
  const user = await getUserById(id);
  user.role = role;
  await user.save();
  return user;
}
