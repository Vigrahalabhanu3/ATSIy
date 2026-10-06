import { uploadResumeFile } from "./resumes";
import { createAnalysis, fetchAnalysisById } from "./analyses";

export async function analyzeResume(resumeFile: File, jobDescription: string) {
  // 1. Upload file
  const uploadRes = await uploadResumeFile(resumeFile);
  if (!uploadRes.success) {
    throw new Error(uploadRes.error?.message || "Failed to upload resume file");
  }

  const resumeId = uploadRes.data?.resume?.id || uploadRes.resume?.id;

  // 2. Perform analysis
  const analysisRes = await createAnalysis({
    resumeId,
    jobDescription,
  });

  if (!analysisRes.success) {
    throw new Error(analysisRes.error?.message || "Failed to analyze resume");
  }

  return analysisRes.data?.analysis || analysisRes.analysis;
}

export { fetchAnalysisById };
