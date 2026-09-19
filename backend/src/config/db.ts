import mongoose from "mongoose";
import { env } from "./env";
import { logger } from "./logger";

declare global {
  // eslint-disable-next-line no-var
  var __orderfastMongooseConn: Promise<typeof mongoose> | undefined;
}

export function connectDB(): Promise<typeof mongoose> {
  if (!global.__orderfastMongooseConn) {
    mongoose.set("strictQuery", true);

    global.__orderfastMongooseConn = mongoose
      .connect(env.MONGODB_URI, {
        maxPoolSize: 10,
      })
      .then((conn) => {
        logger.info("MongoDB connected");
        return conn;
      })
      .catch((error) => {
        global.__orderfastMongooseConn = undefined;
        logger.error({ error }, "MongoDB connection error");
        throw error;
      });
  }

  return global.__orderfastMongooseConn;
}
