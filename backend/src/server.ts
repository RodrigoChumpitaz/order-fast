import mongoose from "mongoose";
import { app } from "./app";
import { env } from "./config/env";
import { connectDB } from "./config/db";
import { logger } from "./config/logger";

async function main() {
  await connectDB();
  const server = app.listen(env.PORT, () => {
    logger.info(`OrderFast API escuchando en http://localhost:${env.PORT}`);
  });

  const shutdown = () => {
    logger.info("Cerrando servidor...");
    server.close(() => {
      mongoose.connection.close(false).finally(() => process.exit(0));
    });
    setTimeout(() => process.exit(1), 5000).unref();
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((error) => {
  logger.error({ error }, "No se pudo iniciar el servidor");
  process.exit(1);
});
