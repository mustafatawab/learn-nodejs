import mongoose from "mongoose";
import { env } from "../config/env";

export const connectDB = async () => {
  try {
    await mongoose.connect(env?.MONGODB_URI!);
    console.log("MongoDB Connected");
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};


