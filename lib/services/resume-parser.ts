import { ParsedResume, ExperienceItem, EducationItem, ProjectItem } from "@/types/resume";

export function parseResumeText(rawText: string): ParsedResume {
  const lines = rawText.split("\n").map((l) => l.trim()).filter(Boolean);

  const parsed: ParsedResume = {
    name: null,
    email: null,
    phone: null,
    location: null,
    summary: null,
    skills: [],
    experience: [],
    education: [],
    projects: [],
    certifications: [],
    achievements: [],
    links: {
      linkedin: null,
      github: null,
      portfolio: null,
    },
  };

  if (lines.length === 0) return parsed;

  // 1. Extract Email
  const emailMatch = rawText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if (emailMatch) {
    parsed.email = emailMatch[0];
  }

  // 2. Extract Phone
  const phoneMatch = rawText.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  if (phoneMatch) {
    parsed.phone = phoneMatch[0].trim();
  }

  // 3. Extract Links
  const linkedinMatch = rawText.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+/i);
  if (linkedinMatch) {
    parsed.links.linkedin = linkedinMatch[0];
  }

  const githubMatch = rawText.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/[a-zA-Z0-9_-]+/i);
  if (githubMatch) {
    parsed.links.github = githubMatch[0];
  }

  const portfolioMatch = rawText.match(/(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9-]+\.(?:me|dev|io|tech|app)(?:\/[^\s]*)?/i);
  if (portfolioMatch) {
    parsed.links.portfolio = portfolioMatch[0];
  }

  // 4. Candidate Name (usually the first non-empty line before emails or headers)
  if (lines.length > 0) {
    const firstLine = lines[0];
    if (
      firstLine.length < 50 &&
      !firstLine.includes("@") &&
      !firstLine.match(/^resume|curriculum|cv/i)
    ) {
      parsed.name = firstLine;
    }
  }

  // Section splitting using common headers
  const sectionHeaders: { [key: string]: RegExp } = {
    summary: /^(?:professional\s+summary|summary|profile|about\s+me|objective)\b/i,
    skills: /^(?:technical\s+skills|skills|core\s+competencies|technologies|tools)\b/i,
    experience: /^(?:work\s+experience|professional\s+experience|experience|employment\s+history)\b/i,
    education: /^(?:education|academic\s+background|academic\s+qualifications)\b/i,
    projects: /^(?:projects|personal\s+projects|selected\s+projects|key\s+projects)\b/i,
    certifications: /^(?:certifications|licenses\s+and\s+certifications|certificates)\b/i,
    achievements: /^(?:achievements|awards|honors|accomplishments)\b/i,
  };

  type SectionKey = "summary" | "skills" | "experience" | "education" | "projects" | "certifications" | "achievements";

  const sectionBlocks: Record<SectionKey, string[]> = {
    summary: [],
    skills: [],
    experience: [],
    education: [],
    projects: [],
    certifications: [],
    achievements: [],
  };

  let currentSection: SectionKey | null = null;

  for (const line of lines) {
    let matchedHeader: SectionKey | null = null;
    for (const [key, regex] of Object.entries(sectionHeaders)) {
      if (regex.test(line)) {
        matchedHeader = key as SectionKey;
        break;
      }
    }

    if (matchedHeader) {
      currentSection = matchedHeader;
      continue;
    }

    if (currentSection) {
      sectionBlocks[currentSection].push(line);
    }
  }

  // Parse Summary
  if (sectionBlocks.summary.length > 0) {
    parsed.summary = sectionBlocks.summary.join(" ");
  }

  // Parse Skills
  if (sectionBlocks.skills.length > 0) {
    const rawSkillsText = sectionBlocks.skills.join(", ");
    // Split on commas, bullets, pipes, or slashes
    const extractedSkills = rawSkillsText
      .split(/[,•|/;\n]+/)
      .map((s) => s.replace(/^[-*•]\s*/, "").trim())
      .filter((s) => s.length > 1 && s.length < 40);

    parsed.skills = Array.from(new Set(extractedSkills));
  }

  // Parse Experience
  if (sectionBlocks.experience.length > 0) {
    parsed.experience = parseExperienceBlock(sectionBlocks.experience);
  }

  // Parse Education
  if (sectionBlocks.education.length > 0) {
    parsed.education = parseEducationBlock(sectionBlocks.education);
  }

  // Parse Projects
  if (sectionBlocks.projects.length > 0) {
    parsed.projects = parseProjectsBlock(sectionBlocks.projects);
  }

  // Parse Certifications
  if (sectionBlocks.certifications.length > 0) {
    parsed.certifications = sectionBlocks.certifications
      .map((c) => c.replace(/^[•*-]\s*/, "").trim())
      .filter((c) => c.length > 2);
  }

  // Parse Achievements
  if (sectionBlocks.achievements.length > 0) {
    parsed.achievements = sectionBlocks.achievements
      .map((a) => a.replace(/^[•*-]\s*/, "").trim())
      .filter((a) => a.length > 2);
  }

  return parsed;
}

function parseExperienceBlock(lines: string[]): ExperienceItem[] {
  const items: ExperienceItem[] = [];
  let currentItem: Partial<ExperienceItem> | null = null;
  const descLines: string[] = [];

  for (const line of lines) {
    // Check if line looks like a title/company (e.g. contains dates or common job keywords)
    const dateMatch = line.match(/\b(?:19|20)\d{2}\b/);
    const hasJobKeyword = /\b(engineer|developer|manager|lead|architect|analyst|designer|consultant|specialist|intern)\b/i.test(line);

    if ((dateMatch || hasJobKeyword) && !line.startsWith("•") && !line.startsWith("-")) {
      if (currentItem && currentItem.company) {
        currentItem.description = descLines.join(" ");
        items.push(currentItem as ExperienceItem);
        descLines.length = 0;
      }

      currentItem = {
        company: line.split(/[-–|,]/)[0]?.trim() || line,
        role: line.split(/[-–|,]/)[1]?.trim() || line,
        description: "",
        technologies: [],
      };
    } else {
      descLines.push(line.replace(/^[•*-]\s*/, ""));
    }
  }

  if (currentItem && currentItem.company) {
    currentItem.description = descLines.join(" ");
    items.push(currentItem as ExperienceItem);
  }

  return items;
}

function parseEducationBlock(lines: string[]): EducationItem[] {
  const items: EducationItem[] = [];
  let currentEdu: Partial<EducationItem> | null = null;

  for (const line of lines) {
    const isDegree = /\b(bachelor|master|phd|b\.?s\.?|b\.?a\.?|m\.?s\.?|m\.?a\.?|degree|diploma)\b/i.test(line);
    const isUniv = /\b(university|college|institute|academy|school)\b/i.test(line);

    if (isDegree || isUniv) {
      if (currentEdu && currentEdu.institution) {
        items.push(currentEdu as EducationItem);
      }
      currentEdu = {
        institution: isUniv ? line : "University / Institution",
        degree: isDegree ? line : "Degree",
        description: line,
      };
    }
  }

  if (currentEdu && currentEdu.institution) {
    items.push(currentEdu as EducationItem);
  }

  return items;
}

function parseProjectsBlock(lines: string[]): ProjectItem[] {
  const items: ProjectItem[] = [];
  let currentProject: Partial<ProjectItem> | null = null;
  const descLines: string[] = [];

  for (const line of lines) {
    if (!line.startsWith("•") && !line.startsWith("-") && line.length < 60) {
      if (currentProject && currentProject.name) {
        currentProject.description = descLines.join(" ");
        items.push(currentProject as ProjectItem);
        descLines.length = 0;
      }
      currentProject = {
        name: line,
        description: "",
        technologies: [],
      };
    } else {
      descLines.push(line.replace(/^[•*-]\s*/, ""));
    }
  }

  if (currentProject && currentProject.name) {
    currentProject.description = descLines.join(" ");
    items.push(currentProject as ProjectItem);
  }

  return items;
}
