import { connectDB } from "../src/config/db";
import { UserModel, ROLES, type Role } from "../src/modules/users/user.model";

async function main() {
  const [, , email, role] = process.argv;

  if (!email || !role) {
    console.error("Uso: npm run promote-user -- <email> <CUSTOMER|STAFF|ADMIN>");
    process.exit(1);
  }

  if (!ROLES.includes(role as Role)) {
    console.error(`Rol inválido "${role}". Usa uno de: ${ROLES.join(", ")}`);
    process.exit(1);
  }

  await connectDB();

  const user = await UserModel.findOneAndUpdate(
    { email: email.toLowerCase() },
    { role: role as Role },
    { new: true },
  );

  if (!user) {
    console.error(`No existe ningún usuario con email "${email}". Debe iniciar sesión al menos una vez antes.`);
    process.exit(1);
  }

  console.log(`OK: ${user.email} ahora tiene rol ${user.role}`);
  process.exit(0);
}

main();
