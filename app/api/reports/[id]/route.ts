import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/mongodb";
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
    const reportId = resolvedParams.id;

    await connectToDatabase();
    const report = await ReportModel.findOne({
      _id: reportId,
      userId: authUser.id,
    }).lean();

    if (!report) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Report not found" } },
        { status: 404 }
      );
    }

    const formattedReport = {
      id: report._id.toString(),
      analysisId: report.analysisId,
      resumeId: report.resumeId,
      title: report.title,
      reportData: report.reportData,
      createdAt: report.createdAt.toISOString(),
      updatedAt: report.updatedAt.toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: { report: formattedReport },
      report: formattedReport,
    });
  } catch (error) {
    console.error("GET /api/reports/[id] error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch report" } },
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
    const reportId = resolvedParams.id;

    await connectToDatabase();
    const report = await ReportModel.findOne({
      _id: reportId,
      userId: authUser.id,
    });

    if (!report) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Report not found" } },
        { status: 404 }
      );
    }

    await ReportModel.deleteOne({ _id: report._id });

    return NextResponse.json({
      success: true,
      data: { message: "Report deleted successfully" },
    });
  } catch (error) {
    console.error("DELETE /api/reports/[id] error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to delete report" } },
      { status: 500 }
    );
  }
}
