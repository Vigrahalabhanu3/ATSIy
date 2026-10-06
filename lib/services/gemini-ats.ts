import { GoogleGenAI } from "@google/genai";
import { MakeATSResponse } from "@/types/analysis";
import { ParsedResume } from "@/types/resume";
import { validateMakeResponse } from "./make-ats";
import { generateNativeATSEvaluation } from "./make-ats";

// Candidate models in preference order
const GEMINI_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-1.5-flash",
];

/**
 * Safely extracts and parses JSON from Gemini text response
 */
function extractAndParseJSON(rawText: string): any {
  if (!rawText || !rawText.trim()) {
    throw new Error("Empty response received from Gemini API");
  }

  // 1. Remove Markdown code blocks
  let cleaned = rawText
    .replace(/^```json\s*/im, "")
    .replace(/^```\s*/im, "")
    .replace(/\s*```$/im, "")
    .trim();

  // 2. Direct JSON parse attempt
  try {
    return JSON.parse(cleaned);
  } catch {
    // 3. Fallback: find outermost curly braces
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      const extracted = cleaned.substring(firstBrace, lastBrace + 1);
      return JSON.parse(extracted);
    }
    throw new Error("Could not extract valid JSON from Gemini output");
  }
}

/**
 * Normalizes and clamps ATS response to adhere strictly to schema
 */
function normalizeATSResponse(parsed: any): MakeATSResponse {
  const atsScore = Math.min(100, Math.max(0, Math.round(Number(parsed.atsScore) || 50)));

  const rawBreakdown = parsed.scoreBreakdown || {};
  const scoreBreakdown = {
    keywordMatch: Math.min(25, Math.max(0, Math.round(Number(rawBreakdown.keywordMatch) || 12))),
    technicalSkillsMatch: Math.min(20, Math.max(0, Math.round(Number(rawBreakdown.technicalSkillsMatch) || 10))),
    experienceMatch: Math.min(20, Math.max(0, Math.round(Number(rawBreakdown.experienceMatch) || 10))),
    projectsMatch: Math.min(15, Math.max(0, Math.round(Number(rawBreakdown.projectsMatch) || 8))),
    educationMatch: Math.min(10, Math.max(0, Math.round(Number(rawBreakdown.educationMatch) || 5))),
    resumeStructure: Math.min(10, Math.max(0, Math.round(Number(rawBreakdown.resumeStructure) || 5))),
  };

  let finalVerdict: "Strong Match" | "Moderate Match" | "Weak Match" = "Moderate Match";
  if (parsed.finalVerdict === "Strong Match" || parsed.finalVerdict === "Moderate Match" || parsed.finalVerdict === "Weak Match") {
    finalVerdict = parsed.finalVerdict;
  } else {
    finalVerdict = atsScore >= 80 ? "Strong Match" : atsScore >= 60 ? "Moderate Match" : "Weak Match";
  }

  const toStringArray = (arr: any): string[] => {
    if (!Array.isArray(arr)) return [];
    return arr.map((item) => (typeof item === "string" ? item.trim() : String(item || ""))).filter(Boolean);
  };

  return {
    atsScore,
    scoreBreakdown,
    overallAssessment: typeof parsed.overallAssessment === "string" && parsed.overallAssessment.trim()
      ? parsed.overallAssessment.trim()
      : `The candidate demonstrates relevant foundational capabilities with an ATS compatibility score of ${atsScore}%.`,
    matchedKeywords: toStringArray(parsed.matchedKeywords),
    missingKeywords: toStringArray(parsed.missingKeywords),
    technicalSkills: {
      matching: toStringArray(parsed.technicalSkills?.matching),
      missing: toStringArray(parsed.technicalSkills?.missing),
    },
    experienceMatch: {
      strengths: toStringArray(parsed.experienceMatch?.strengths),
      gaps: toStringArray(parsed.experienceMatch?.gaps),
    },
    projectMatch: {
      relevantProjects: toStringArray(parsed.projectMatch?.relevantProjects),
      gaps: toStringArray(parsed.projectMatch?.gaps),
    },
    educationMatch: toStringArray(parsed.educationMatch),
    resumeStructure: {
      strengths: toStringArray(parsed.resumeStructure?.strengths),
      problems: toStringArray(parsed.resumeStructure?.problems),
    },
    topResumeProblems: toStringArray(parsed.topResumeProblems),
    improvements: toStringArray(parsed.improvements),
    recommendedTechStack: toStringArray(parsed.recommendedTechStack),
    top5Changes: toStringArray(parsed.top5Changes).slice(0, 5),
    finalVerdict,
  };
}

/**
 * Analyzes resume against job description using Google Gemini API
 */
export async function analyzeResumeWithGemini(
  resumeText: string,
  jobDescription: string
): Promise<MakeATSResponse> {
  const apiKey = (process.env.GEMINI_API_KEY || "").trim();

  if (!apiKey) {
    console.warn("GEMINI_API_KEY not configured, using native ATS evaluation engine");
    return generateNativeATSEvaluation(resumeText, jobDescription);
  }

  const ai = new GoogleGenAI({ apiKey });

  const systemInstruction = `You are ATSly, an expert Applicant Tracking System (ATS) evaluation engine and hiring intelligence platform.
Analyze the provided candidate resume text strictly against the job description.
Return a valid JSON object matching the exact structure below.

RULES:
1. "atsScore": integer 0 to 100 representing the overall match percentage.
2. "scoreBreakdown": must have:
   - "keywordMatch": number 0 to 25
   - "technicalSkillsMatch": number 0 to 20
   - "experienceMatch": number 0 to 20
   - "projectsMatch": number 0 to 15
   - "educationMatch": number 0 to 10
   - "resumeStructure": number 0 to 10
   The sum of these 6 components should equal or approximate "atsScore".
3. "overallAssessment": a concise 2-3 sentence executive evaluation of candidate fit.
4. "matchedKeywords": array of strings found in both resume and job description.
5. "missingKeywords": array of key skills/technologies mentioned in the job description but absent from the resume.
6. "technicalSkills": object with:
   - "matching": array of string technical skills present
   - "missing": array of string technical skills required but missing
7. "experienceMatch": object with:
   - "strengths": array of experience points matching the role
   - "gaps": array of experience deficiencies
8. "projectMatch": object with:
   - "relevantProjects": array of relevant projects or key achievements identified
   - "gaps": array of missing project depth or domain areas
9. "educationMatch": array of strings evaluating degree/education alignment.
10. "resumeStructure": object with:
    - "strengths": formatting and structural strengths
    - "problems": formatting, layout, or structural issues
11. "topResumeProblems": array of 3-5 specific problems found in the resume.
12. "improvements": array of actionable recommendations to improve the ATS score.
13. "recommendedTechStack": array of technologies candidate should highlight or learn.
14. "top5Changes": array of exactly 5 immediate edits candidate should make to their resume.
15. "finalVerdict": must be exactly one of: "Strong Match", "Moderate Match", or "Weak Match" (based on score: >=80 is Strong Match, 60-79 is Moderate Match, <60 is Weak Match).

DO NOT wrap the response in markdown code blocks or triple backticks. Return raw JSON.`;

  const prompt = `RESUME TEXT:
${resumeText}

JOB DESCRIPTION:
${jobDescription}`;

  let lastError: Error | null = null;

  // Try available Gemini flash models
  for (const model of GEMINI_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
        },
      });

      const rawText = response.text || "";
      const parsed = extractAndParseJSON(rawText);
      const normalized = normalizeATSResponse(parsed);

      const validation = validateMakeResponse(normalized);
      if (validation.isValid) {
        return normalized;
      } else {
        console.warn(`Validation warning for model ${model}:`, validation.error);
        return normalized;
      }
    } catch (err: any) {
      console.warn(`Gemini API attempt with ${model} failed:`, err.message);
      lastError = err;
    }
  }

  console.error("All Gemini API models failed, falling back to ATS rule engine:", lastError?.message);
  return generateNativeATSEvaluation(resumeText, jobDescription);
}

/**
 * Extracts structured candidate profile from resume text using Gemini
 */
export async function parseResumeWithGeminiAI(rawText: string): Promise<Partial<ParsedResume> | null> {
  const apiKey = (process.env.GEMINI_API_KEY || "").trim();
  if (!apiKey) return null;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Extract the structured candidate data from the following resume text into JSON:
{
  "name": string or null,
  "email": string or null,
  "phone": string or null,
  "location": string or null,
  "summary": string or null,
  "skills": string[],
  "experience": [
    { "company": string, "role": string, "startDate": string, "endDate": string, "description": string, "technologies": string[] }
  ],
  "education": [
    { "institution": string, "degree": string, "fieldOfStudy": string, "startDate": string, "endDate": string, "grade": string }
  ],
  "projects": [
    { "name": string, "description": string, "technologies": string[], "link": string }
  ],
  "certifications": string[],
  "achievements": string[],
  "links": { "linkedin": string or null, "github": string or null, "portfolio": string or null }
}

RESUME TEXT:
${rawText.slice(0, 8000)}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsed = extractAndParseJSON(response.text || "");
    return parsed;
  } catch (err: any) {
    console.warn("Gemini resume parsing failed, using rule-based parser:", err.message);
    return null;
  }
}
