import mongoose, { Schema, Document, Model } from "mongoose";
import { CreditTransactionType, CreditReferenceType } from "@/types/credits";

export interface ICreditTransaction extends Document {
  userId: mongoose.Types.ObjectId;
  type: CreditTransactionType;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  referenceType: CreditReferenceType;
  referenceId?: string;
  description: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const CreditTransactionSchema = new Schema<ICreditTransaction>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        "ALLOCATED",
        "RESERVED",
        "CONSUMED",
        "REFUNDED",
        "EXPIRED",
        "ADJUSTED",
        "PLAN_UPGRADE",
      ],
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    balanceBefore: {
      type: Number,
      required: true,
      min: 0,
    },
    balanceAfter: {
      type: Number,
      required: true,
      min: 0,
    },
    referenceType: {
      type: String,
      enum: ["ATS_ANALYSIS", "PLAN", "ADMIN"],
      required: true,
    },
    referenceId: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

CreditTransactionSchema.index({ userId: 1, createdAt: -1 });
CreditTransactionSchema.index({ userId: 1, type: 1 });
CreditTransactionSchema.index({ referenceId: 1 });

if (process.env.NODE_ENV !== "production") {
  delete (mongoose.models as any).CreditTransaction;
}

export const CreditTransactionModel: Model<ICreditTransaction> =
  mongoose.models.CreditTransaction ||
  mongoose.model<ICreditTransaction>("CreditTransaction", CreditTransactionSchema);
