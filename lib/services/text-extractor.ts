import mammoth from "mammoth";

function ensureDOMMatrix() {
  if (typeof (global as any).DOMMatrix === "undefined") {
    const FakeDOMMatrix = class DOMMatrix {
      a = 1;
      b = 0;
      c = 0;
      d = 1;
      e = 0;
      f = 0;
      constructor() {}
    };
    (global as any).DOMMatrix = FakeDOMMatrix;
    (globalThis as any).DOMMatrix = FakeDOMMatrix;
  }
}

ensureDOMMatrix();

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  ensureDOMMatrix();
  try {
    // pdf-parse v2 supports PDFParse class
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfLib = require("pdf-parse");
    if (pdfLib.PDFParse) {
      const parser = new pdfLib.PDFParse({ data: buffer });
      const res = await parser.getText();
      await parser.destroy();
      return cleanExtractedText(res.text || "");
    } else if (typeof pdfLib === "function") {
      const data = await pdfLib(buffer);
      return cleanExtractedText(data.text || "");
    } else if (typeof pdfLib.default === "function") {
      const data = await pdfLib.default(buffer);
      return cleanExtractedText(data.text || "");
    }
    throw new Error("PDF parser engine not initialized");
  } catch (error: any) {
    throw new Error(`Failed to extract text from PDF: ${error.message || "Invalid PDF document"}`);
  }
}

export async function extractTextFromDOCX(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return cleanExtractedText(result.value || "");
  } catch (error: any) {
    throw new Error(`Failed to extract text from DOCX: ${error.message || "Invalid DOCX document"}`);
  }
}

export async function extractResumeText(
  buffer: Buffer,
  fileType: string
): Promise<string> {
  const normType = fileType.trim().toUpperCase();
  if (normType === "PDF") {
    return extractTextFromPDF(buffer);
  } else if (normType === "DOCX" || normType === "DOC") {
    return extractTextFromDOCX(buffer);
  }
  throw new Error(`Unsupported resume file format: ${fileType}. Only PDF and DOCX are supported.`);
}

export function cleanExtractedText(rawText: string): string {
  if (!rawText) return "";

  return (
    rawText
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
      .replace(/[ \t]+/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim()
  );
}
