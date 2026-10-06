export interface ScoreBreakdown {
  keywordMatch: { score: number; max: number };
  technicalSkillsMatch: { score: number; max: number };
  experienceMatch: { score: number; max: number };
  projectsMatch: { score: number; max: number };
  educationMatch: { score: number; max: number };
  resumeStructure: { score: number; max: number };
}

export interface Project {
  name: string;
  technologies: string[];
  matchStrength: "Strong Match" | "Moderate Match" | "Weak Match";
}

export interface ResumeStructureSection {
  name: string;
  status: "present" | "warning" | "missing";
}

export interface Recommendation {
  id: string;
  title: string;
  problem?: string;
  whyItMatters?: string;
  recommendedAction?: string;
  description: string;
  priority: "high" | "medium" | "low";
  impactLabel?: string;
  currentText?: string;
  recommendedRewrite?: string;
  suggestedAddition?: string;
}

export interface ScanItem {
  id: string;
  role: string;
  company: string;
  location: string;
  dateAnalyzed: string;
  fileName: string;
  score: number;
  matchLabel: string;
  badgeStyle?: "blue" | "gray" | "purple";
}

export interface ATSResult {
  atsScore: number;
  matchLabel: "Strong Match" | "Good Match" | "Moderate Match" | "Weak Match";
  scoreBreakdown: ScoreBreakdown;
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
    projects: Project[];
  };
  educationMatch: string[];
  resumeStructure: {
    sections: ResumeStructureSection[];
    atsReadability: number;
  };
  topResumeProblems: { title: string; description: string }[];
  recommendations: Recommendation[];
  top5Changes: string[];
  finalVerdict: string;
  aiTip: string;
  jobTitle: string;
}


export interface UploadedFile {
  name: string;
  size: string;
  status: "uploading" | "success" | "error";
}

export interface NavItem {
  label: string;
  href: string;
  icon: string;
}
