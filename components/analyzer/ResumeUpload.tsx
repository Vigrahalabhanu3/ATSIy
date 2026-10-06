"use client";

import { useRef, useState, useCallback } from "react";
import { UploadCloudIcon, FileIcon, XIcon, CheckCircleIcon } from "@/components/icons/Icons";
import { cn } from "@/lib/utils";

interface UploadedFileInfo {
  name: string;
  size: string;
}

interface ResumeUploadProps {
  uploadedFile: UploadedFileInfo | null;
  onFileUpload: (file: File) => void;
  onRemoveFile: () => void;
}

export default function ResumeUpload({
  uploadedFile,
  onFileUpload,
  onRemoveFile,
}: ResumeUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (
        file.type === "application/pdf" ||
        file.type ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        onFileUpload(file);
      }
    },
    [onFileUpload]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="bg-white dark:bg-[#121528] border border-[#E5E3F2] dark:border-[#1E223D] rounded-xl p-5 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[#171725] dark:text-white font-bold text-[15px]">Resume Upload</h2>
        <span className="text-[11px] font-semibold text-[#8080A0] dark:text-[#94A3B8] bg-[#F8F7FF] dark:bg-[#181C33] border border-[#E5E3F2] dark:border-[#1E223D] px-2.5 py-1 rounded-full">
          Step 1 of 2
        </span>
      </div>

      {/* Drop zone */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload resume file"
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-150",
          isDragging
            ? "border-[#4F46E5] bg-[#EFEDFF] dark:bg-[#4F46E5]/10"
            : "border-[#C5BDFF] dark:border-[#3730A3] bg-[#FAFAFF] dark:bg-[#0E1122] hover:border-[#4F46E5] hover:bg-[#F4F2FF] dark:hover:bg-[#181C33]"
        )}
      >
        <div className="w-14 h-14 bg-[#EFEDFF] dark:bg-[#4F46E5]/20 rounded-full flex items-center justify-center mx-auto mb-3">
          <UploadCloudIcon size={26} className="text-[#4F46E5] dark:text-[#818CF8]" />
        </div>
        <p className="text-[#171725] dark:text-white font-semibold text-[14px] mb-1">
          Upload your resume
        </p>
        <p className="text-[#8080A0] dark:text-[#94A3B8] text-[13px] mb-3">
          Drag and drop your file here or browse
        </p>
        <span className="inline-block bg-white dark:bg-[#121528] border border-[#E5E3F2] dark:border-[#1E223D] text-[#8080A0] dark:text-[#94A3B8] text-[11px] font-medium px-3 py-1 rounded-full">
          PDF or DOCX • Maximum 5MB
        </span>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx"
          className="hidden"
          onChange={handleInputChange}
          aria-label="Select resume file"
        />
      </div>

      {/* Uploaded file */}
      {uploadedFile && (
        <div className="mt-3 flex items-center gap-3 bg-[#F8F7FF] dark:bg-[#181C33] border border-[#E5E3F2] dark:border-[#1E223D] rounded-xl px-4 py-3">
          <div className="w-9 h-9 bg-[#EFEDFF] dark:bg-[#4F46E5]/20 rounded-lg flex items-center justify-center shrink-0">
            <FileIcon size={18} className="text-[#4F46E5] dark:text-[#818CF8]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[#171725] dark:text-white font-semibold text-[13px] truncate">
              {uploadedFile.name}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <CheckCircleIcon size={12} className="text-[#16A34A] dark:text-[#34D399]" />
              <p className="text-[#55556A] dark:text-[#94A3B8] text-[12px]">
                {uploadedFile.size} • Uploaded successfully
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onRemoveFile}
            aria-label="Remove uploaded file"
            className="w-7 h-7 flex items-center justify-center text-[#8080A0] dark:text-[#94A3B8] hover:text-[#DC2626] dark:hover:text-[#EF4444] hover:bg-[#FEF2F2] dark:hover:bg-[#EF4444]/10 rounded-lg transition-colors duration-150"
          >
            <XIcon size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
