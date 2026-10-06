import { ATSResult, ScanItem } from "./types";

export const mockATSResult: ATSResult = {
  atsScore: 82,
  matchLabel: "Strong Match",
  jobTitle: "Java Full Stack Developer",
  overallAssessment:
    "Your resume demonstrates exceptional proficiency in backend technologies and core frameworks. With minor adjustments to cloud deployment keywords and measurable metrics, your score could easily reach the 90+ threshold.",
  aiTip:
    'Add "Kubernetes" and "GraphQL" to your skills section to boost keyword match by 8%.',
  scoreBreakdown: {
    keywordMatch: { score: 21, max: 25 },
    technicalSkillsMatch: { score: 18, max: 20 },
    experienceMatch: { score: 16, max: 20 },
    projectsMatch: { score: 12, max: 15 },
    educationMatch: { score: 8, max: 10 },
    resumeStructure: { score: 7, max: 10 },
  },
  matchedKeywords: [
    "Java",
    "Spring Boot",
    "SQL",
    "React",
    "REST APIs",
    "Git",
  ],
  missingKeywords: [
    "Docker",
    "AWS",
    "Redis",
    "Microservices",
  ],
  technicalSkills: {
    matching: [
      "Java SE / EE",
      "Spring Framework",
      "Hibernate / JPA",
      "JavaScript / TypeScript",
      "PostgreSQL",
      "Maven / Gradle",
    ],
    missing: ["Kubernetes", "CI/CD Pipelines", "Apache Kafka"],
  },
  experienceMatch: {
    strengths: [
      "3+ years of professional Java development experience clearly outlined in employment history.",
      "Strong API design background with documented RESTful endpoints implementation.",
    ],
    gaps: [
      "Limited cloud deployment experience noted in enterprise environments.",
    ],
  },
  projectMatch: {
    projects: [
      {
        name: "E-Commerce Platform",
        technologies: ["Built using Java Spring Boot, React, and MySQL. Demonstrates full-stack capability."],
        matchStrength: "Strong Match",
      },
      {
        name: "Task Management System",
        technologies: ["React, Node.js, MongoDB. Good application logic, though lacks Java enterprise backend context."],
        matchStrength: "Moderate Match",
      },
    ],
  },
  educationMatch: [
    "Bachelor's degree in Computer Science",
    "Relevant coursework in algorithms and data structures",
    "GPA above 3.5",
  ],
  resumeStructure: {
    sections: [
      { name: "Professional Summary", status: "present" },
      { name: "Core Skills Section", status: "present" },
      { name: "Work Experience History", status: "present" },
      { name: "Projects Showcase", status: "present" },
      { name: "Education Credentials", status: "present" },
      { name: "Certifications", status: "warning" },
    ],
    atsReadability: 85,
  },
  topResumeProblems: [
    {
      title: "Missing Docker experience",
      description: "Containerization is a mandatory requirement for 90% of Java Full Stack openings parsed.",
    },
    {
      title: "Project descriptions lack measurable results",
      description: "Bullet points focus purely on tasks rather than quantitative performance boosts or scale handled.",
    },
    {
      title: "Absence of Cloud platforms keyword (AWS/GCP)",
      description: "Automated ATS scanners heavily weight cloud platform familiarity for senior engineering levels.",
    },
  ],
  recommendations: [
    {
      id: "1",
      title: "Add measurable achievements to work experience",
      impactLabel: "High Impact",
      priority: "high",
      description:
        "Recruiters and ATS algorithms favor quantified results. Include metrics showing latency improvements, transaction volumes, or team leadership scale.",
      currentText:
        '"Developed REST endpoints for the checkout system using Spring Boot."',
      recommendedRewrite:
        '"Engineered high-throughput RESTful endpoints using Spring Boot, processing 50k+ daily transactions while reducing API latency by 35%."',
    },
    {
      id: "2",
      title: "Integrate Docker & AWS into skills section",
      impactLabel: "Medium Impact",
      priority: "medium",
      description:
        "Since the target job description explicitly lists container management and cloud services as core requirements, explicit inclusion ensures exact keyword matching.",
      suggestedAddition:
        '"DevOps & Cloud: Docker, AWS (EC2, S3, RDS), CI/CD pipelines, Git Actions"',
    },
  ],
  top5Changes: [
    "Add Docker and AWS keywords to the Core Skills summary table.",
    "Quantify at least two job achievements with performance metrics or user scale.",
    "Include Microservices architecture terminology in your latest project description.",
    "Ensure standard single-column formatting for seamless machine parsing.",
    "Add a Professional Summary statement targeting enterprise Java development.",
  ],
  finalVerdict:
    "This resume is highly competitive for enterprise Java engineering positions. Address the 4 missing keywords to bypass automated filters successfully.",
};

export const mockScans: ScanItem[] = [
  {
    id: "1",
    role: "Senior UX Designer",
    company: "Stripe",
    location: "Remote",
    dateAnalyzed: "Oct 24, 2023",
    fileName: "Resume_Alex_UX_2023.pdf",
    score: 92,
    matchLabel: "92% Match",
    badgeStyle: "blue",
  },
  {
    id: "2",
    role: "Lead Product Designer",
    company: "Linear",
    location: "San Francisco, CA",
    dateAnalyzed: "Oct 18, 2023",
    fileName: "Alex_Rivera_Resume_v4.pdf",
    score: 85,
    matchLabel: "85% Match",
    badgeStyle: "blue",
  },
  {
    id: "3",
    role: "Principal Product Designer",
    company: "Figma",
    location: "New York, NY",
    dateAnalyzed: "Oct 12, 2023",
    fileName: "Resume_Alex_UX_2023.pdf",
    score: 68,
    matchLabel: "68% Match",
    badgeStyle: "gray",
  },
  {
    id: "4",
    role: "Staff Design Technologist",
    company: "Vercel",
    location: "Remote",
    dateAnalyzed: "Sep 30, 2023",
    fileName: "Alex_Rivera_Tech_2023.pdf",
    score: 94,
    matchLabel: "94% Match",
    badgeStyle: "purple",
  },
];

export const dashboardStats = [
  { value: "98%", label: "Parsing Accuracy" },
  { value: "120K+", label: "Resumes Optimized" },
  { value: "3.4x", label: "More Interviews" },
];

