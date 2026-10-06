import mongoose, { Schema, Document, Model } from "mongoose";
import { PlanType } from "@/lib/config/plans";

export interface IUserCredits {
  balance: number;
  monthlyLimit: number;
  used: number;
  resetAt: Date;
}

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: "user" | "admin";
  plan: PlanType;
  credits: IUserCredits;
  createdAt: Date;
  updatedAt: Date;
}

const UserCreditsSchema = new Schema<IUserCredits>(
  {
    balance: {
      type: Number,
      required: true,
      default: 2,
      min: 0,
    },
    monthlyLimit: {
      type: Number,
      required: true,
      default: 2,
      min: 0,
    },
    used: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    resetAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  },
  { _id: false }
);

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: [true, "Password hash is required"],
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
      index: true,
    },
    plan: {
      type: String,
      enum: ["FREE", "PRO", "PREMIUM"],
      default: "FREE",
    },
    credits: {
      type: UserCreditsSchema,
      default: () => ({
        balance: 2,
        monthlyLimit: 2,
        used: 0,
        resetAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      }),
    },
  },
  {
    timestamps: true,
  }
);

if (process.env.NODE_ENV !== "production") {
  delete (mongoose.models as any).User;
}

export const UserModel: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
