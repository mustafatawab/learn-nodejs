import mongoose from "mongoose";
import type { IUser } from "./user.interface";
import { string } from "zod";

const userSchema = new mongoose.Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password : {
      type: String,
      required: true,
    },

    age: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export const UserModel = mongoose.model<IUser>("User", userSchema);
