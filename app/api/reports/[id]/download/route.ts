import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/mongodb";
import { ReportModel } from "@/lib/db/models/Report";
import { generateReportPDF } from "@/lib/services/pdf-report";

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

    // Generate real PDF
    const pdfBuffer = await generateReportPDF({
      ...report.reportData,
      analyzedAt: report.reportData?.analyzedAt || report.createdAt.toISOString(),
      jobTitle: report.reportData?.jobTitle || "Evaluated Role",
      resumeFileName: report.reportData?.resumeFileName || "Resume.pdf",
    });

    const safeFilename = (report.reportData?.resumeFileName || "Report")
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .replace(/\.pdf$/i, "");

    const response = new NextResponse(pdfBuffer as any);
    response.headers.set("Content-Type", "application/pdf");
    response.headers.set(
      "Content-Disposition",
      `attachment; filename="ATSly_Report_${safeFilename}.pdf"`
    );
    response.headers.set("Content-Length", pdfBuffer.length.toString());

    return response;
  } catch (error: any) {
    console.error("GET /api/reports/[id]/download error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "PDF_ERROR", message: error.message || "Failed to generate PDF report" },
      },
      { status: 500 }
    );
  }
}
