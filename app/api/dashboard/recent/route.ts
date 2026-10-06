import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/mongodb";
import { AnalysisModel } from "@/lib/db/models/Analysis";

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthenticatedUser(req);
    if (!authUser) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const recentAnalyses = await AnalysisModel.find({ userId: authUser.id })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const formatted = recentAnalyses.map((a) => ({
      id: a._id.toString(),
      resumeId: a.resumeId,
      resumeFileName: a.resumeFileName,
      jobTitle: a.jobTitle,
      jobDescriptionPreview: a.jobDescription.slice(0, 120),
      atsScore: a.atsScore,
      scoreBreakdown: a.scoreBreakdown,
      finalVerdict: a.finalVerdict,
      createdAt: a.createdAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data: { recent: formatted },
      recent: formatted,
    });
  } catch (error) {
    console.error("GET /api/dashboard/recent error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch recent dashboard activity" } },
      { status: 500 }
    );
  }
}
