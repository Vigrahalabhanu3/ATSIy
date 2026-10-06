import mongoose, { Schema, Document, Model } from "mongoose";
import { ParsedResume } from "@/types/resume";

export interface IResume extends Document {
  userId: mongoose.Types.ObjectId;
  originalFileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  publicId?: string;
  extractedText: string;
  parsedResume: ParsedResume;
  createdAt: Date;
  updatedAt: Date;
}

const ResumeSchema = new Schema<IResume>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    originalFileName: {
      type: String,
      required: true,
      trim: true,
    },
    fileType: {
      type: String,
      enum: ["PDF", "DOCX", "pdf", "docx"],
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
    },
    extractedText: {
      type: String,
      required: true,
    },
    parsedResume: {
      name: { type: String, default: null },
      email: { type: String, default: null },
      phone: { type: String, default: null },
      location: { type: String, default: null },
      summary: { type: String, default: null },
      skills: { type: [String], default: [] },
      experience: [
        {
          company: { type: String, default: "" },
          role: { type: String, default: "" },
          startDate: { type: String },
          endDate: { type: String },
          description: { type: String, default: "" },
          technologies: { type: [String], default: [] },
        },
      ],
      education: [
        {
          institution: { type: String, default: "" },
          degree: { type: String, default: "" },
          field: { type: String },
          startDate: { type: String },
          endDate: { type: String },
          description: { type: String },
        },
      ],
      projects: [
        {
          name: { type: String, default: "" },
          description: { type: String, default: "" },
          technologies: { type: [String], default: [] },
          url: { type: String },
        },
      ],
      certifications: { type: [String], default: [] },
      achievements: { type: [String], default: [] },
      links: {
        linkedin: { type: String, default: null },
        github: { type: String, default: null },
        portfolio: { type: String, default: null },
      },
    },
  },
  {
    timestamps: true,
  }
);

ResumeSchema.index({ userId: 1, createdAt: -1 });

export const ResumeModel: Model<IResume> =
  mongoose.models.Resume || mongoose.model<IResume>("Resume", ResumeSchema);
