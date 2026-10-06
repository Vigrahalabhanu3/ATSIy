import mongoose, { Schema, Document, Model } from "mongoose";

export interface IReport extends Document {
  userId: mongoose.Types.ObjectId;
  analysisId: mongoose.Types.ObjectId;
  resumeId: mongoose.Types.ObjectId;
  title: string;
  reportData: any;
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema = new Schema<IReport>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    analysisId: {
      type: Schema.Types.ObjectId,
      ref: "Analysis",
      required: true,
      index: true,
    },
    resumeId: {
      type: Schema.Types.ObjectId,
      ref: "Resume",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    reportData: {
      type: Schema.Types.Mixed,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

ReportSchema.index({ userId: 1, createdAt: -1 });

export const ReportModel: Model<IReport> =
  mongoose.models.Report || mongoose.model<IReport>("Report", ReportSchema);
