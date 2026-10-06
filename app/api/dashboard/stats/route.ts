import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/mongodb";
import { ResumeModel } from "@/lib/db/models/Resume";
import { AnalysisModel } from "@/lib/db/models/Analysis";
import { ReportModel } from "@/lib/db/models/Report";

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

    import("mongoose");
    const userObjectId = new (await import("mongoose")).default.Types.ObjectId(authUser.id);

    const [totalResumes, totalAnalyses, totalReports, analysisAgg, creditState] = await Promise.all([
      ResumeModel.countDocuments({ userId: authUser.id }),
      AnalysisModel.countDocuments({ userId: authUser.id }),
      ReportModel.countDocuments({ userId: authUser.id }),
      AnalysisModel.aggregate([
        { $match: { userId: { $in: [authUser.id, userObjectId] } } },
        {
          $group: {
            _id: null,
            avgScore: { $avg: "$atsScore" },
            maxScore: { $max: "$atsScore" },
            minScore: { $min: "$atsScore" },
          },
        },
      ]),
      import("@/lib/services/credits").then((m) => m.getUserCreditState(authUser.id)),
    ]);

    const statsData = {
      totalResumes,
      totalAnalyses,
      totalReports,
      averageAtsScore: analysisAgg.length > 0 ? Math.round(analysisAgg[0].avgScore) : 0,
      bestAtsScore: analysisAgg.length > 0 ? Math.round(analysisAgg[0].maxScore) : 0,
      lowestAtsScore: analysisAgg.length > 0 ? Math.round(analysisAgg[0].minScore) : 0,
      credits: creditState,
    };

    return NextResponse.json({
      success: true,
      data: statsData,
      stats: statsData,
    });
  } catch (error) {
    console.error("GET /api/dashboard/stats error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to compute dashboard stats" } },
      { status: 500 }
    );
  }
}
