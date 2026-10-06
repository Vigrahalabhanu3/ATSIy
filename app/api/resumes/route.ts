import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/mongodb";
import { ResumeModel } from "@/lib/db/models/Resume";
import { AnalysisModel } from "@/lib/db/models/Analysis";
import { extractResumeText } from "@/lib/services/text-extractor";
import { parseResumeText } from "@/lib/services/resume-parser";
import { parseResumeWithGeminiAI } from "@/lib/services/gemini-ats";
import { uploadToCloudinary } from "@/lib/services/cloudinary";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthenticatedUser(req);
    if (!authUser) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "UNAUTHORIZED", message: "Please log in to upload a resume" },
        },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "NO_FILE_PROVIDED", message: "No file was uploaded" },
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FILE_TOO_LARGE",
            message: "File exceeds the 5MB maximum allowed limit",
          },
        },
        { status: 400 }
      );
    }

    const originalFileName = file.name || "resume.pdf";
    const extension = originalFileName.split(".").pop()?.toLowerCase();

    if (!extension || !["pdf", "docx"].includes(extension)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNSUPPORTED_FILE_TYPE",
            message: "Only PDF and DOCX files are supported",
          },
        },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 1. Extract text
    let extractedText = "";
    try {
      extractedText = await extractResumeText(buffer, extension);
    } catch (parseError: any) {
      console.error("Resume text extraction error:", parseError);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "EXTRACTION_FAILED",
            message: parseError.message || "Failed to extract text from the uploaded document",
          },
        },
        { status: 422 }
      );
    }

    if (!extractedText || extractedText.trim().length < 20) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "EMPTY_RESUME",
            message: "The uploaded file does not contain readable text or is empty",
          },
        },
        { status: 422 }
      );
    }

    // 2. Parse structured sections
    let parsedResume = parseResumeText(extractedText);
    try {
      const aiParsed = await parseResumeWithGeminiAI(extractedText);
      if (aiParsed) {
        parsedResume = {
          name: aiParsed.name || parsedResume.name,
          email: aiParsed.email || parsedResume.email,
          phone: aiParsed.phone || parsedResume.phone,
          location: aiParsed.location || parsedResume.location,
          summary: aiParsed.summary || parsedResume.summary,
          skills: Array.isArray(aiParsed.skills) && aiParsed.skills.length > 0 ? aiParsed.skills : parsedResume.skills,
          experience: Array.isArray(aiParsed.experience) && aiParsed.experience.length > 0 ? (aiParsed.experience as any) : parsedResume.experience,
          education: Array.isArray(aiParsed.education) && aiParsed.education.length > 0 ? (aiParsed.education as any) : parsedResume.education,
          projects: Array.isArray(aiParsed.projects) && aiParsed.projects.length > 0 ? (aiParsed.projects as any) : parsedResume.projects,
          certifications: Array.isArray(aiParsed.certifications) ? aiParsed.certifications : parsedResume.certifications,
          achievements: Array.isArray(aiParsed.achievements) ? aiParsed.achievements : parsedResume.achievements,
          links: {
            linkedin: aiParsed.links?.linkedin || parsedResume.links?.linkedin || null,
            github: aiParsed.links?.github || parsedResume.links?.github || null,
            portfolio: aiParsed.links?.portfolio || parsedResume.links?.portfolio || null,
          },
        };
      }
    } catch {
      // Fallback cleanly to regex parser
    }

    // 3. Upload original file to Cloudinary / storage
    const uploadResult = await uploadToCloudinary(
      buffer,
      originalFileName,
      `resumes/${authUser.id}`
    );

    // 4. Save to MongoDB
    await connectToDatabase();
    const newResume: any = await ResumeModel.create({
      userId: authUser.id,
      originalFileName,
      fileType: extension,
      fileSize: file.size,
      fileUrl: uploadResult.fileUrl,
      publicId: uploadResult.publicId,
      extractedText,
      parsedResume,
    });

    const resumeResponse = {
      id: newResume._id.toString(),
      originalFileName: newResume.originalFileName,
      fileType: newResume.fileType,
      fileSize: newResume.fileSize,
      fileUrl: newResume.fileUrl,
      extractedText: newResume.extractedText,
      parsedResume: newResume.parsedResume,
      createdAt: newResume.createdAt.toISOString(),
      updatedAt: newResume.updatedAt.toISOString(),
    };

    return NextResponse.json(
      {
        success: true,
        resume: resumeResponse,
        data: { resume: resumeResponse },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/resumes error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: error.message || "Failed to upload and process resume",
        },
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthenticatedUser(req);
    if (!authUser) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "UNAUTHORIZED", message: "Authentication required" },
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)));
    const search = (searchParams.get("search") || searchParams.get("query") || "").trim();

    await connectToDatabase();

    const query: any = { userId: authUser.id };
    if (search) {
      query.$or = [
        { originalFileName: { $regex: search, $options: "i" } },
        { "parsedResume.name": { $regex: search, $options: "i" } },
        { "parsedResume.skills": { $regex: search, $options: "i" } },
      ];
    }

    const total = await ResumeModel.countDocuments(query);
    const resumes = await ResumeModel.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Fetch analysis counts for each resume
    const resumeIds = resumes.map((r) => r._id.toString());
    const analysisCounts = await AnalysisModel.aggregate([
      { $match: { resumeId: { $in: resumeIds }, userId: authUser.id } },
      { $group: { _id: "$resumeId", count: { $sum: 1 }, latestScore: { $last: "$atsScore" } } },
    ]);

    const countsMap = new Map<string, { count: number; latestScore?: number }>();
    analysisCounts.forEach((c) => {
      countsMap.set(c._id, { count: c.count, latestScore: c.latestScore });
    });

    const formattedResumes = resumes.map((r) => {
      const stats = countsMap.get(r._id.toString()) || { count: 0 };
      return {
        id: r._id.toString(),
        originalFileName: r.originalFileName,
        fileType: r.fileType,
        fileSize: r.fileSize,
        fileUrl: r.fileUrl,
        extractedTextLength: r.extractedText?.length || 0,
        parsedResume: r.parsedResume,
        analysisCount: stats.count,
        latestScore: stats.latestScore ?? null,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        resumes: formattedResumes,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit) || 1,
        },
      },
      resumes: formattedResumes,
    });
  } catch (error) {
    console.error("GET /api/resumes error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to retrieve resumes" },
      },
      { status: 500 }
    );
  }
}
