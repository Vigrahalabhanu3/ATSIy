import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/mongodb";
import { ResumeModel } from "@/lib/db/models/Resume";
import { AnalysisModel } from "@/lib/db/models/Analysis";
import { ReportModel } from "@/lib/db/models/Report";
import { sendToMakeWebhook } from "@/lib/services/make-ats";
import { analyzeResumeWithGemini } from "@/lib/services/gemini-ats";
import {
  reserveCredit,
  consumeCredit,
  refundCredit,
  getUserCreditState,
} from "@/lib/services/credits";

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  let authUser: any = null;
  let reservation: any = null;
  let creditConsumed = false;

  try {
    authUser = await getAuthenticatedUser(req);
    if (!authUser) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { resumeId, jobDescription } = body;

    if (!resumeId) {
      return NextResponse.json(
        { success: false, error: { code: "MISSING_RESUME", message: "Please select a resume to analyze" } },
        { status: 400 }
      );
    }

    if (!jobDescription || typeof jobDescription !== "string" || jobDescription.trim().length < 20) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_JOB_DESCRIPTION",
            message: "Job description is required and must be at least 20 characters long",
          },
        },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // 1. Find Resume and verify ownership
    const resume = await ResumeModel.findOne({
      _id: resumeId,
      userId: authUser.id,
    });

    if (!resume) {
      return NextResponse.json(
        { success: false, error: { code: "RESUME_NOT_FOUND", message: "Resume not found or does not belong to your account" } },
        { status: 404 }
      );
    }

    if (!resume.extractedText || resume.extractedText.trim().length < 10) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "EMPTY_RESUME_TEXT",
            message: "Resume contains no readable text to compare against the job description",
          },
        },
        { status: 422 }
      );
    }

    // 2. Atomic Credit Reservation (Prevents API abuse, protects Make/Gemini quota)
    reservation = await reserveCredit(authUser.id, "ATS_ANALYSIS", {
      resumeId: resume._id.toString(),
      resumeFileName: resume.originalFileName,
    });

    if (!reservation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "CREDITS_EXHAUSTED",
            message: "Your ATS credits are exhausted. Upgrade your plan to continue.",
          },
        },
        { status: 402 }
      );
    }

    // 3. Evaluate ATS Analysis (using Make.com webhook or Gemini API)
    let atsResult;
    try {
      if (process.env.MAKE_ATS_WEBHOOK_URL) {
        try {
          atsResult = await sendToMakeWebhook(resume.extractedText, jobDescription.trim());
        } catch (makeErr) {
          console.warn("Make webhook call failed, falling back to Gemini ATS engine:", makeErr);
          atsResult = await analyzeResumeWithGemini(resume.extractedText, jobDescription.trim());
        }
      } else if (process.env.GEMINI_API_KEY) {
        atsResult = await analyzeResumeWithGemini(resume.extractedText, jobDescription.trim());
      } else {
        atsResult = await analyzeResumeWithGemini(resume.extractedText, jobDescription.trim());
      }
    } catch (analysisError: any) {
      console.error("ATS evaluation error:", analysisError);

      // Refund the reserved credit immediately on failure
      if (reservation?.reservationId) {
        try {
          await refundCredit(
            authUser.id,
            reservation.reservationId,
            analysisError.message || "Make/Gemini ATS evaluation failure"
          );
        } catch (refundErr) {
          console.error("Failed to refund credit:", refundErr);
        }
      }

      return NextResponse.json(
        {
          success: false,
          error: {
            code: "ATS_ANALYSIS_FAILED",
            message: "We couldn't complete the analysis. Your credit has been restored. Please try again.",
          },
        },
        { status: 502 }
      );
    }

    const duration = Math.round((Date.now() - startTime) / 1000);

    // Extract approximate job title from first line of job description
    const firstLine = jobDescription.trim().split("\n")[0].trim().slice(0, 60);
    const estimatedJobTitle = firstLine.length > 5 ? firstLine : "Target Role";

    const modelSource = process.env.GEMINI_API_KEY
      ? "gemini-2.5-flash"
      : process.env.MAKE_ATS_WEBHOOK_URL
      ? "make.com-gemini"
      : "atsly-native-engine";

    // 4. Save Analysis document in MongoDB
    const analysisDoc: any = await AnalysisModel.create({
      userId: authUser.id,
      resumeId: resume._id.toString(),
      jobDescription: jobDescription.trim(),
      resumeFileName: resume.originalFileName,
      jobTitle: estimatedJobTitle,
      analysisDuration: duration,
      modelSource,

      atsScore: atsResult.atsScore,
      scoreBreakdown: atsResult.scoreBreakdown,
      overallAssessment: atsResult.overallAssessment,
      matchedKeywords: atsResult.matchedKeywords,
      missingKeywords: atsResult.missingKeywords,
      technicalSkills: atsResult.technicalSkills,
      experienceMatch: atsResult.experienceMatch,
      projectMatch: atsResult.projectMatch,
      educationMatch: atsResult.educationMatch,
      resumeStructure: atsResult.resumeStructure,
      topResumeProblems: atsResult.topResumeProblems,
      improvements: atsResult.improvements,
      recommendedTechStack: atsResult.recommendedTechStack,
      top5Changes: atsResult.top5Changes,
      finalVerdict: atsResult.finalVerdict,
    });

    // 5. Save Report document in MongoDB
    await ReportModel.create({
      userId: authUser.id,
      analysisId: analysisDoc._id.toString(),
      resumeId: resume._id.toString(),
      title: `${resume.originalFileName} - ${estimatedJobTitle}`,
      reportData: {
        ...atsResult,
        jobTitle: estimatedJobTitle,
        resumeFileName: resume.originalFileName,
        jobDescription: jobDescription.trim(),
        analyzedAt: analysisDoc.createdAt.toISOString(),
      },
    });

    // 6. Mark credit reservation as CONSUMED
    await consumeCredit(
      authUser.id,
      reservation.reservationId,
      analysisDoc._id.toString(),
      {
        resumeFileName: resume.originalFileName,
        jobTitle: estimatedJobTitle,
        atsScore: atsResult.atsScore,
      }
    );
    creditConsumed = true;

    // Fetch updated user credit status
    const currentCredits = await getUserCreditState(authUser.id);

    const formattedAnalysis = {
      id: analysisDoc._id.toString(),
      userId: analysisDoc.userId,
      resumeId: analysisDoc.resumeId,
      resumeFileName: analysisDoc.resumeFileName,
      jobTitle: analysisDoc.jobTitle,
      jobDescription: analysisDoc.jobDescription,
      atsScore: analysisDoc.atsScore,
      scoreBreakdown: analysisDoc.scoreBreakdown,
      overallAssessment: analysisDoc.overallAssessment,
      matchedKeywords: analysisDoc.matchedKeywords,
      missingKeywords: analysisDoc.missingKeywords,
      technicalSkills: analysisDoc.technicalSkills,
      experienceMatch: analysisDoc.experienceMatch,
      projectMatch: analysisDoc.projectMatch,
      educationMatch: analysisDoc.educationMatch,
      resumeStructure: analysisDoc.resumeStructure,
      topResumeProblems: analysisDoc.topResumeProblems,
      improvements: analysisDoc.improvements,
      recommendedTechStack: analysisDoc.recommendedTechStack,
      top5Changes: analysisDoc.top5Changes,
      finalVerdict: analysisDoc.finalVerdict,
      analysisDuration: analysisDoc.analysisDuration,
      createdAt: analysisDoc.createdAt.toISOString(),
      updatedAt: analysisDoc.updatedAt.toISOString(),
    };

    return NextResponse.json(
      {
        success: true,
        analysis: formattedAnalysis,
        data: {
          analysis: formattedAnalysis,
          credits: currentCredits,
        },
        credits: currentCredits,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/analyses error:", error);

    // Safeguard: refund reserved credit if unconsumed error occurred
    if (reservation?.reservationId && !creditConsumed) {
      try {
        await refundCredit(
          authUser.id,
          reservation.reservationId,
          error?.message || "Unexpected internal error"
        );
      } catch (refundErr) {
        console.error("Failed to refund credit on error:", refundErr);
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: error.message || "An unexpected error occurred during ATS analysis",
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
        { resumeFileName: { $regex: search, $options: "i" } },
        { jobTitle: { $regex: search, $options: "i" } },
        { finalVerdict: { $regex: search, $options: "i" } },
      ];
    }

    const total = await AnalysisModel.countDocuments(query);
    const analyses = await AnalysisModel.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const formattedList = analyses.map((a) => ({
      id: a._id.toString(),
      resumeId: a.resumeId,
      resumeFileName: a.resumeFileName,
      jobTitle: a.jobTitle,
      jobDescriptionPreview: a.jobDescription.slice(0, 150),
      atsScore: a.atsScore,
      scoreBreakdown: a.scoreBreakdown,
      finalVerdict: a.finalVerdict,
      analysisDuration: a.analysisDuration,
      createdAt: a.createdAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data: {
        analyses: formattedList,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit) || 1,
        },
      },
      analyses: formattedList,
    });
  } catch (error) {
    console.error("GET /api/analyses error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch analyses" } },
      { status: 500 }
    );
  }
}
