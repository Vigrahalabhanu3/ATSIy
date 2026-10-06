import mongoose, { Schema, Document, Model } from "mongoose";
import { MakeScoreBreakdown } from "@/types/analysis";

export interface IAnalysis extends Document {
  userId: mongoose.Types.ObjectId;
  resumeId: mongoose.Types.ObjectId;
  resumeFileName?: string;
  jobTitle?: string;
  jobDescription: string;
  atsScore: number;
  scoreBreakdown: MakeScoreBreakdown;
  overallAssessment: string;
  matchedKeywords: string[];
  missingKeywords: string[];
  technicalSkills: {
    matching: string[];
    missing: string[];
  };
  experienceMatch: {
    strengths: string[];
    gaps: string[];
  };
  projectMatch: {
    relevantProjects: any[];
    gaps: string[];
  };
  educationMatch: string[];
  resumeStructure: {
    strengths: string[];
    problems: string[];
  };
  topResumeProblems: any[];
  improvements: any[];
  recommendedTechStack: string[];
  top5Changes: string[];
  finalVerdict: "Strong Match" | "Moderate Match" | "Weak Match";
  analysisDuration?: number;
  modelSource?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AnalysisSchema = new Schema<IAnalysis>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    resumeId: {
      type: Schema.Types.ObjectId,
      ref: "Resume",
      required: true,
      index: true,
    },
    resumeFileName: {
      type: String,
      default: "",
    },
    jobTitle: {
      type: String,
      default: "Custom Target Role",
    },
    jobDescription: {
      type: String,
      required: true,
    },
    atsScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    scoreBreakdown: {
      keywordMatch: { type: Number, required: true, min: 0, max: 25 },
      technicalSkillsMatch: { type: Number, required: true, min: 0, max: 20 },
      experienceMatch: { type: Number, required: true, min: 0, max: 20 },
      projectsMatch: { type: Number, required: true, min: 0, max: 15 },
      educationMatch: { type: Number, required: true, min: 0, max: 10 },
      resumeStructure: { type: Number, required: true, min: 0, max: 10 },
    },
    overallAssessment: {
      type: String,
      required: true,
    },
    matchedKeywords: {
      type: [String],
      default: [],
    },
    missingKeywords: {
      type: [String],
      default: [],
    },
    technicalSkills: {
      matching: { type: [String], default: [] },
      missing: { type: [String], default: [] },
    },
    experienceMatch: {
      strengths: { type: [String], default: [] },
      gaps: { type: [String], default: [] },
    },
    projectMatch: {
      relevantProjects: { type: Schema.Types.Mixed, default: [] },
      gaps: { type: [String], default: [] },
    },
    educationMatch: {
      type: [String],
      default: [],
    },
    resumeStructure: {
      strengths: { type: [String], default: [] },
      problems: { type: [String], default: [] },
    },
    topResumeProblems: {
      type: Schema.Types.Mixed,
      default: [],
    },
    improvements: {
      type: Schema.Types.Mixed,
      default: [],
    },
    recommendedTechStack: {
      type: [String],
      default: [],
    },
    top5Changes: {
      type: [String],
      default: [],
    },
    finalVerdict: {
      type: String,
      enum: ["Strong Match", "Moderate Match", "Weak Match"],
      required: true,
    },
    analysisDuration: {
      type: Number,
      default: 0,
    },
    modelSource: {
      type: String,
      default: "make.com-gemini",
    },
  },
  {
    timestamps: true,
  }
);

AnalysisSchema.index({ userId: 1, createdAt: -1 });
AnalysisSchema.index({ userId: 1, resumeId: 1 });

export const AnalysisModel: Model<IAnalysis> =
  mongoose.models.Analysis || mongoose.model<IAnalysis>("Analysis", AnalysisSchema);
