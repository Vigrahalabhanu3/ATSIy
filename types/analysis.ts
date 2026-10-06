export interface MakeScoreBreakdown {
  keywordMatch: number; // 0-25
  technicalSkillsMatch: number; // 0-20
  experienceMatch: number; // 0-20
  projectsMatch: number; // 0-15
  educationMatch: number; // 0-10
  resumeStructure: number; // 0-10
}

export interface MakeATSResponse {
  atsScore: number; // 0-100
  scoreBreakdown: MakeScoreBreakdown;
  overallAssessment: string;
  matchedKeywords: string[];
  missingKeywords: string[];
  technicalSkills: {
    matching: string[];
    missing: string[];
  };
  experienceMatch: {
    strengths: string[];
    gaps: string[];
  };
  projectMatch: {
    relevantProjects: (string | { name?: string; technologies?: string[]; description?: string })[];
    gaps: string[];
  };
  educationMatch: string[];
  resumeStructure: {
    strengths: string[];
    problems: string[];
  };
  topResumeProblems: (string | { title: string; description: string })[];
  improvements: (string | { id?: string; title?: string; description?: string })[];
  recommendedTechStack: string[];
  top5Changes: string[];
  finalVerdict: "Strong Match" | "Moderate Match" | "Weak Match";
}

export interface AnalysisDocument extends MakeATSResponse {
  id: string;
  userId: string;
  resumeId: string;
  resumeFileName?: string;
  jobDescription: string;
  jobTitle?: string;
  createdAt: string;
  updatedAt: string;
  analysisDuration?: number;
}
