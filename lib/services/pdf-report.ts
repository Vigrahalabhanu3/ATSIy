import { jsPDF } from "jspdf";
import { MakeATSResponse } from "@/types/analysis";

export function generateReportPDF(
  analysis: MakeATSResponse & {
    resumeFileName?: string;
    jobTitle?: string;
    createdAt?: string | Date;
  }
): Buffer {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let y = 18;

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - 15) {
      doc.addPage();
      y = 18;
    }
  };

  // Header Bar Branding
  doc.setFillColor(69, 61, 224); // #453DE0
  doc.rect(14, y, 10, 10, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("A", 17.5, y + 7);

  doc.setTextColor(21, 23, 58);
  doc.setFontSize(18);
  doc.text("ATSly", 28, y + 7.5);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text("AI-Powered ATS Resume Analysis Report", 50, y + 7);

  // Date on right
  const dateStr = analysis.createdAt
    ? new Date(analysis.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : new Date().toLocaleDateString("en-US");
  doc.text(dateStr, pageWidth - 14, y + 7, { align: "right" });

  y += 16;
  doc.setDrawColor(230, 235, 245);
  doc.line(14, y, pageWidth - 14, y);
  y += 8;

  // Title Box
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(17, 24, 39);
  doc.text(analysis.jobTitle || "Custom Job Target", 14, y);
  y += 5;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text(`Resume File: ${analysis.resumeFileName || "Uploaded Resume"}`, 14, y);
  y += 10;

  // Score Banner Card
  doc.setFillColor(246, 247, 253);
  doc.roundedRect(14, y, pageWidth - 28, 26, 3, 3, "F");
  doc.setDrawColor(220, 226, 242);
  doc.roundedRect(14, y, pageWidth - 28, 26, 3, 3, "S");

  // Score Box
  doc.setFillColor(69, 61, 224);
  doc.roundedRect(18, y + 3, 20, 20, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(`${analysis.atsScore}`, 28, y + 14, { align: "center" });
  doc.setFontSize(7);
  doc.text("/100", 28, y + 19, { align: "center" });

  // Score Details
  doc.setTextColor(17, 24, 39);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`Overall ATS Score: ${analysis.atsScore}%`, 44, y + 9);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(69, 61, 224);
  doc.text(`Final Verdict: ${analysis.finalVerdict}`, 44, y + 15);

  doc.setTextColor(100, 116, 139);
  doc.text(
    `Keywords: ${analysis.scoreBreakdown?.keywordMatch || 0}/25 | Tech: ${
      analysis.scoreBreakdown?.technicalSkillsMatch || 0
    }/20 | Exp: ${analysis.scoreBreakdown?.experienceMatch || 0}/20 | Projects: ${
      analysis.scoreBreakdown?.projectsMatch || 0
    }/15`,
    44,
    y + 21
  );

  y += 33;

  // Overall Assessment
  checkPageBreak(25);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(17, 24, 39);
  doc.text("Overall Assessment", 14, y);
  y += 5;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(75, 85, 99);
  const assessmentLines = doc.splitTextToSize(analysis.overallAssessment || "", pageWidth - 28);
  doc.text(assessmentLines, 14, y);
  y += assessmentLines.length * 4.5 + 4;

  // Matched Keywords vs Missing Keywords
  checkPageBreak(30);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(17, 24, 39);
  doc.text("Keyword Analysis", 14, y);
  y += 5;

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(16, 185, 129);
  doc.text(`Matched Keywords (${analysis.matchedKeywords?.length || 0}):`, 14, y);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(55, 65, 81);
  const matchedText = doc.splitTextToSize(
    analysis.matchedKeywords?.join(", ") || "None detected",
    pageWidth - 28
  );
  doc.text(matchedText, 14, y + 4.5);
  y += matchedText.length * 4.5 + 7;

  checkPageBreak(20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(220, 38, 38);
  doc.text(`Missing Keywords (${analysis.missingKeywords?.length || 0}):`, 14, y);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(55, 65, 81);
  const missingText = doc.splitTextToSize(
    analysis.missingKeywords?.join(", ") || "None",
    pageWidth - 28
  );
  doc.text(missingText, 14, y + 4.5);
  y += missingText.length * 4.5 + 8;

  // Top 5 Changes
  if (analysis.top5Changes && analysis.top5Changes.length > 0) {
    checkPageBreak(35);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(17, 24, 39);
    doc.text("Top Recommended Changes", 14, y);
    y += 5;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(55, 65, 81);
    analysis.top5Changes.slice(0, 5).forEach((change, i) => {
      checkPageBreak(10);
      const changeText = doc.splitTextToSize(`${i + 1}. ${change}`, pageWidth - 28);
      doc.text(changeText, 14, y);
      y += changeText.length * 4.5 + 2;
    });
    y += 4;
  }

  // Footer Note
  checkPageBreak(15);
  doc.setDrawColor(230, 235, 245);
  doc.line(14, y, pageWidth - 14, y);
  y += 5;
  doc.setFontSize(8);
  doc.setTextColor(156, 163, 175);
  doc.text("Generated by ATSly AI Resume Optimization Platform • Confidential", 14, y);

  return Buffer.from(doc.output("arraybuffer"));
}
