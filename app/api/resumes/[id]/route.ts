import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/mongodb";
import { ResumeModel } from "@/lib/db/models/Resume";
import { AnalysisModel } from "@/lib/db/models/Analysis";
import { ReportModel } from "@/lib/db/models/Report";
import { deleteFromCloudinary } from "@/lib/services/cloudinary";

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
    const resumeId = resolvedParams.id;

    await connectToDatabase();
    const resume = await ResumeModel.findOne({
      _id: resumeId,
      userId: authUser.id,
    }).lean();

    if (!resume) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Resume not found" } },
        { status: 404 }
      );
    }

    const formattedResume = {
      id: resume._id.toString(),
      originalFileName: resume.originalFileName,
      fileType: resume.fileType,
      fileSize: resume.fileSize,
      fileUrl: resume.fileUrl,
      extractedText: resume.extractedText,
      parsedResume: resume.parsedResume,
      createdAt: resume.createdAt.toISOString(),
      updatedAt: resume.updatedAt.toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: { resume: formattedResume },
      resume: formattedResume,
    });
  } catch (error) {
    console.error("GET /api/resumes/[id] error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch resume" } },
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
    const resumeId = resolvedParams.id;

    await connectToDatabase();
    const resume = await ResumeModel.findOne({
      _id: resumeId,
      userId: authUser.id,
    });

    if (!resume) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Resume not found" } },
        { status: 404 }
      );
    }

    // 1. Delete file from Cloudinary if publicId exists
    if (resume.publicId) {
      try {
        await deleteFromCloudinary(resume.publicId);
      } catch (cloudErr) {
        console.warn("Could not delete file from Cloudinary:", cloudErr);
      }
    }

    // 2. Delete associated analyses and reports
    await AnalysisModel.deleteMany({ resumeId: resume._id.toString(), userId: authUser.id });
    await ReportModel.deleteMany({ resumeId: resume._id.toString(), userId: authUser.id });

    // 3. Delete resume record
    await ResumeModel.deleteOne({ _id: resume._id });

    return NextResponse.json({
      success: true,
      data: { message: "Resume and associated analyses deleted successfully" },
    });
  } catch (error) {
    console.error("DELETE /api/resumes/[id] error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to delete resume" } },
      { status: 500 }
    );
  }
}
