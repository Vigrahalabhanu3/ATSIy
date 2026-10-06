import { MakeATSResponse } from "./analysis";

export interface ReportDocument {
  id: string;
  userId: string;
  analysisId: string;
  resumeId: string;
  title: string;
  reportData: MakeATSResponse & {
    resumeFileName?: string;
    jobTitle?: string;
    jobDescription?: string;
  };
  createdAt: string;
}
