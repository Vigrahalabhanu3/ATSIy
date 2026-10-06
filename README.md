# ATSly - AI-Powered ATS Resume Intelligence Platform

ATSly is an enterprise-grade AI Resume Analyzer and Job Matcher that evaluates resumes against job descriptions, identifies missing keywords, checks ATS formatting compliance, and provides actionable recommendations to maximize interview callbacks.

## Key Features

- **Automated Resume Parsing**: High-fidelity PDF and DOCX text extraction and section structuring.
- **Side-by-Side ATS Evaluation**: Compares resume skills and experience directly against target job descriptions.
- **Comprehensive Score Breakdown**:
  - Keyword Match (25 pts)
  - Technical Skills Match (20 pts)
  - Experience Match (20 pts)
  - Project Match (15 pts)
  - Education Match (10 pts)
  - Resume Structure & Readability (10 pts)
- **Actionable AI Rewrites**: Recruiter-approved bullet point suggestions with quantitative metrics.
- **Credit & Usage Limit System**: Real MongoDB-backed credit allocation (Free tier with 2 scans, Admin unlimited mode).
- **PDF & Multi-Format Reports**: Downloadable reports and evaluation history.
- **Light & Dark Theme Engine**: Adaptive styling with full theme toggling.
- **Enterprise Security Hardening**: Rate limiting, strict HTTP headers, prototype pollution protection, and Desktop-Only viewport guard.

## Tech Stack

- **Framework**: Next.js 16 (Turbopack) & React 19
- **Database**: MongoDB Atlas with Mongoose
- **Styling**: Tailwind CSS v4 & Lucide Icons
- **AI Engine**: Google Gemini API & Make.com ATS webhook integration
- **Authentication**: JWT session tokens with bcryptjs hashing

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
Copy `.env.example` to `.env.local` and add your database and API keys:
```bash
cp .env.example .env.local
```

Configure:
- `MONGODB_URI`: Your MongoDB connection string
- `AUTH_SECRET`: Secret key for JWT signing
- `GEMINI_API_KEY`: Google Gemini API key

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) on your desktop browser.

### 4. Admin Setup
To promote an account to Admin with unlimited credits:
```bash
npm run make-admin <email> <password>
```

## License
MIT
