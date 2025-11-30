import mongoose from "mongoose";
import { getEnv } from "./env.js";

const { mongoUri } = getEnv();

export function connectDb() {
  return mongoose
    .connect(mongoUri, {
      autoIndex: true
    })
    .then(() => {
      console.log("MongoDB connected");
    })
    .catch((err) => {
      console.error("MongoDB connection error", err);
      process.exit(1);
    });
}


