export interface ExperienceItem {
  company: string;
  role: string;
  startDate?: string;
  endDate?: string;
  description: string;
  technologies: string[];
}

export interface EducationItem {
  institution: string;
  degree: string;
  field?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

export interface ProjectItem {
  name: string;
  description: string;
  technologies: string[];
  url?: string;
}

export interface ParsedResume {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  location?: string | null;
  summary?: string | null;
  skills: string[];
  experience: ExperienceItem[];
  education: EducationItem[];
  projects: ProjectItem[];
  certifications: string[];
  achievements: string[];
  links: {
    linkedin?: string | null;
    github?: string | null;
    portfolio?: string | null;
  };
}

export interface ResumeDocument {
  id: string;
  userId: string;
  originalFileName: string;
  fileType: "PDF" | "DOCX";
  fileSize: number;
  fileUrl: string;
  publicId?: string;
  extractedText: string;
  parsedResume: ParsedResume;
  createdAt: string;
  updatedAt: string;
  analysesCount?: number;
}
