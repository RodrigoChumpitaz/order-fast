import compression from "compression";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { pinoHttp } from "pino-http";
import mongoose from "mongoose";
import swaggerUi from "swagger-ui-express";
import { env } from "./config/env";
import { logger } from "./config/logger";
import { connectDB } from "./config/db";
import { errorHandler, notFoundHandler } from "./shared/middlewares/errorHandler";
import { ok } from "./shared/utils/apiResponse";
import { openApiDocument } from "./docs/openapi";
import { categoryRouter } from "./modules/categories/category.routes";
import { productRouter } from "./modules/products/product.routes";
import { userRouter } from "./modules/users/user.routes";
import { tableRouter } from "./modules/tables/table.routes";
import { orderRouter } from "./modules/orders/order.routes";
import { loyaltyRouter } from "./modules/loyalty/loyalty.routes";
import { notificationRouter } from "./modules/notifications/notification.routes";

export const app = express();

app.use(async (_req, _res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    next(error);
  }
});
app.use(pinoHttp({ logger }));
app.use((req, res, next) => {
  if (req.path.startsWith("/api/docs")) return next();
  helmet()(req, res, next);
});
app.use(
  cors({
    origin: env.ALLOWED_ORIGINS.length > 0 ? env.ALLOWED_ORIGINS : false,
    credentials: true,
  }),
);
app.use(compression());
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  ok(res, { mongo: mongoose.connection.readyState === 1 ? "up" : "down" }, "OrderFast API viva");
});

app.get("/api/docs", (req, res, next) => {
  if (req.accepts(["html", "json"]) === "json") {
    return res.json(openApiDocument);
  }
  next();
});
app.use(
  "/api/docs",
  helmet({ contentSecurityPolicy: false }),
  swaggerUi.serve,
  swaggerUi.setup(openApiDocument),
);

app.use("/api/v1/categories", categoryRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/tables", tableRouter);
app.use("/api/v1/orders", orderRouter);
app.use("/api/v1/loyalty", loyaltyRouter);
app.use("/api/v1/notifications", notificationRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
