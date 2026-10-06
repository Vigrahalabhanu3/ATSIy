import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/mongodb";
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

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const search = (searchParams.get("search") || "").trim();

    await connectToDatabase();

    const query: any = { userId: authUser.id };
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { "reportData.jobTitle": { $regex: search, $options: "i" } },
        { "reportData.resumeFileName": { $regex: search, $options: "i" } },
        { "reportData.finalVerdict": { $regex: search, $options: "i" } },
      ];
    }

    const total = await ReportModel.countDocuments(query);
    const reports = await ReportModel.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const formattedReports = reports.map((r) => ({
      id: r._id.toString(),
      analysisId: r.analysisId,
      resumeId: r.resumeId,
      title: r.title,
      resumeFileName: r.reportData?.resumeFileName || "Resume",
      jobTitle: r.reportData?.jobTitle || "Analyzed Role",
      atsScore: r.reportData?.atsScore ?? 0,
      finalVerdict: r.reportData?.finalVerdict || "Evaluated",
      scoreBreakdown: r.reportData?.scoreBreakdown,
      createdAt: r.createdAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data: {
        reports: formattedReports,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit) || 1,
        },
      },
      reports: formattedReports,
    });
  } catch (error) {
    console.error("GET /api/reports error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch reports" } },
      { status: 500 }
    );
  }
}
