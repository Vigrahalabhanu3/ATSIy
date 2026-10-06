import { ATSResult } from "@/lib/types";

export function formatAnalysisToATSResult(analysis: any): ATSResult {
  const sb = analysis.scoreBreakdown || {};

  const keywordScore = typeof sb.keywordMatch === "number" ? sb.keywordMatch : sb.keywordMatch?.score ?? 0;
  const techScore = typeof sb.technicalSkillsMatch === "number" ? sb.technicalSkillsMatch : sb.technicalSkillsMatch?.score ?? 0;
  const expScore = typeof sb.experienceMatch === "number" ? sb.experienceMatch : sb.experienceMatch?.score ?? 0;
  const projScore = typeof sb.projectsMatch === "number" ? sb.projectsMatch : sb.projectsMatch?.score ?? 0;
  const eduScore = typeof sb.educationMatch === "number" ? sb.educationMatch : sb.educationMatch?.score ?? 0;
  const structScore = typeof sb.resumeStructure === "number" ? sb.resumeStructure : sb.resumeStructure?.score ?? 0;

  const scoreBreakdown = {
    keywordMatch: { score: keywordScore, max: 25 },
    technicalSkillsMatch: { score: techScore, max: 20 },
    experienceMatch: { score: expScore, max: 20 },
    projectsMatch: { score: projScore, max: 15 },
    educationMatch: { score: eduScore, max: 10 },
    resumeStructure: { score: structScore, max: 10 },
  };

  // Convert project match
  const rawProjects = analysis.projectMatch?.relevantProjects || [];
  const projects = rawProjects.map((p: any, idx: number) => {
    if (typeof p === "string") {
      return {
        name: p.split(":")[0]?.trim() || `Project ${idx + 1}`,
        technologies: [p.split(":")[1]?.trim() || p],
        matchStrength: "Strong Match" as const,
      };
    }
    return {
      name: p.name || `Project ${idx + 1}`,
      technologies: Array.isArray(p.technologies) ? p.technologies : [p.description || "Portfolio project"],
      matchStrength: p.matchStrength || "Strong Match",
    };
  });

  // Convert resume structure
  const structureProblems = analysis.resumeStructure?.problems || [];
  const sections = [
    { name: "Contact & Header Information", status: structureProblems.some((p: string) => /contact|header|email/i.test(p)) ? ("warning" as const) : ("present" as const) },
    { name: "Professional Summary", status: structureProblems.some((p: string) => /summary|objective/i.test(p)) ? ("warning" as const) : ("present" as const) },
    { name: "Work Experience Section", status: structureProblems.some((p: string) => /experience|work/i.test(p)) ? ("warning" as const) : ("present" as const) },
    { name: "Technical & Core Skills", status: structureProblems.some((p: string) => /skill/i.test(p)) ? ("warning" as const) : ("present" as const) },
    { name: "Education & Credentials", status: structureProblems.some((p: string) => /education|degree/i.test(p)) ? ("warning" as const) : ("present" as const) },
  ];

  // Convert top problems
  const rawProblems = analysis.topResumeProblems || [];
  const topResumeProblems = rawProblems.map((prob: any, idx: number) => {
    if (typeof prob === "string") {
      return {
        title: prob.slice(0, 50),
        description: prob,
      };
    }
    return {
      title: prob.title || `Issue ${idx + 1}`,
      description: prob.description || prob.title,
    };
  });

  // Convert improvements to recommendations
  const rawImprovements = analysis.improvements || [];
  const recommendations = rawImprovements.map((imp: any, idx: number) => {
    if (typeof imp === "string") {
      return {
        id: `rec-${idx + 1}`,
        title: imp.split(".")[0] || `Improvement ${idx + 1}`,
        description: imp,
        priority: idx === 0 ? ("high" as const) : ("medium" as const),
        impactLabel: idx === 0 ? "High Impact" : "Recommended",
      };
    }
    return {
      id: imp.id || `rec-${idx + 1}`,
      title: imp.title || `Improvement ${idx + 1}`,
      description: imp.description || imp.title,
      priority: imp.priority || "high",
      impactLabel: imp.impactLabel || "High Impact",
      currentText: imp.currentText,
      recommendedRewrite: imp.recommendedRewrite,
      suggestedAddition: imp.suggestedAddition,
    };
  });

  const verdict = analysis.finalVerdict || "Moderate Match";
  const matchLabel: any = ["Strong Match", "Good Match", "Moderate Match", "Weak Match"].includes(verdict)
    ? verdict
    : "Moderate Match";

  return {
    atsScore: analysis.atsScore ?? 0,
    matchLabel,
    scoreBreakdown,
    overallAssessment: analysis.overallAssessment || "",
    matchedKeywords: analysis.matchedKeywords || [],
    missingKeywords: analysis.missingKeywords || [],
    technicalSkills: {
      matching: analysis.technicalSkills?.matching || [],
      missing: analysis.technicalSkills?.missing || [],
    },
    experienceMatch: {
      strengths: analysis.experienceMatch?.strengths || [],
      gaps: analysis.experienceMatch?.gaps || [],
    },
    projectMatch: {
      projects,
    },
    educationMatch: analysis.educationMatch || [],
    resumeStructure: {
      sections,
      atsReadability: Math.min(100, Math.max(20, structScore * 10)),
    },
    topResumeProblems,
    recommendations,
    top5Changes: analysis.top5Changes || [],
    finalVerdict: verdict,
    aiTip: "Tailor your project bullet points with metrics to boost your ATS match above 85%.",
    jobTitle: analysis.jobTitle || "Evaluated Role",
  };
}
