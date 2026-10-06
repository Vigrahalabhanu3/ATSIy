import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/mongodb";
import { AnalysisModel } from "@/lib/db/models/Analysis";
import { ReportModel } from "@/lib/db/models/Report";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const authUser = await getAuthenticatedUser(req);
    if (!authUser) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 }
      );
    }

    const resolvedParams = await Promise.resolve(context.params);
    const analysisId = resolvedParams.id;

    await connectToDatabase();
    const analysis = await AnalysisModel.findOne({
      _id: analysisId,
      userId: authUser.id,
    }).lean();

    if (!analysis) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Analysis not found" } },
        { status: 404 }
      );
    }

    const formattedAnalysis = {
      id: analysis._id.toString(),
      userId: analysis.userId,
      resumeId: analysis.resumeId,
      resumeFileName: analysis.resumeFileName,
      jobTitle: analysis.jobTitle,
      jobDescription: analysis.jobDescription,
      atsScore: analysis.atsScore,
      scoreBreakdown: analysis.scoreBreakdown,
      overallAssessment: analysis.overallAssessment,
      matchedKeywords: analysis.matchedKeywords,
      missingKeywords: analysis.missingKeywords,
      technicalSkills: analysis.technicalSkills,
      experienceMatch: analysis.experienceMatch,
      projectMatch: analysis.projectMatch,
      educationMatch: analysis.educationMatch,
      resumeStructure: analysis.resumeStructure,
      topResumeProblems: analysis.topResumeProblems,
      improvements: analysis.improvements,
      recommendedTechStack: analysis.recommendedTechStack,
      top5Changes: analysis.top5Changes,
      finalVerdict: analysis.finalVerdict,
      analysisDuration: analysis.analysisDuration,
      createdAt: analysis.createdAt.toISOString(),
      updatedAt: analysis.updatedAt.toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: { analysis: formattedAnalysis },
      analysis: formattedAnalysis,
    });
  } catch (error) {
    console.error("GET /api/analyses/[id] error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch analysis" } },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const authUser = await getAuthenticatedUser(req);
    if (!authUser) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 }
      );
    }

    const resolvedParams = await Promise.resolve(context.params);
    const analysisId = resolvedParams.id;

    await connectToDatabase();
    const analysis = await AnalysisModel.findOne({
      _id: analysisId,
      userId: authUser.id,
    });

    if (!analysis) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Analysis not found" } },
        { status: 404 }
      );
    }

    await ReportModel.deleteMany({ analysisId: analysis._id.toString(), userId: authUser.id });
    await AnalysisModel.deleteOne({ _id: analysis._id });

    return NextResponse.json({
      success: true,
      data: { message: "Analysis and associated report deleted successfully" },
    });
  } catch (error) {
    console.error("DELETE /api/analyses/[id] error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to delete analysis" } },
      { status: 500 }
    );
  }
}
