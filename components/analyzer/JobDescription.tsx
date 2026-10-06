"use client";

interface JobDescriptionProps {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
}

export default function JobDescription({
  value,
  onChange,
  maxLength = 5000,
}: JobDescriptionProps) {
  const charCount = value.length;
  const isUnderMin = charCount > 0 && charCount < 100;

  return (
    <div className="bg-white dark:bg-[#121528] border border-[#E5E3F2] dark:border-[#1E223D] rounded-xl p-5 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[#171725] dark:text-white font-bold text-[15px]">Job Description</h2>
        <span className="text-[11px] font-semibold text-[#8080A0] dark:text-[#94A3B8] bg-[#F8F7FF] dark:bg-[#181C33] border border-[#E5E3F2] dark:border-[#1E223D] px-2.5 py-1 rounded-full">
          Step 2 of 2
        </span>
      </div>

      <textarea
        id="job-description"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={maxLength}
        rows={9}
        placeholder="Paste the job description here..."
        aria-label="Job description"
        aria-describedby="jd-hint jd-count"
        className="w-full resize-none border border-[#E5E3F2] dark:border-[#1E223D] rounded-xl px-4 py-3 text-[14px] text-[#171725] dark:text-white placeholder:text-[#B0B0C0] dark:placeholder:text-[#64748B] bg-[#FAFAFF] dark:bg-[#0E1122] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:ring-offset-0 focus:border-[#4F46E5] transition-all duration-150"
      />

      <div className="flex items-center justify-between mt-2">
        <p
          id="jd-hint"
          className={`text-[12px] ${isUnderMin ? "text-[#F59E0B]" : "text-[#8080A0] dark:text-[#94A3B8]"}`}
        >
          Minimum 100 characters recommended
        </p>
        <p
          id="jd-count"
          className={`text-[12px] font-medium tabular-nums ${
            charCount > maxLength * 0.9 ? "text-[#F59E0B]" : "text-[#8080A0] dark:text-[#94A3B8]"
          }`}
        >
          {charCount.toLocaleString()} / {maxLength.toLocaleString()}
        </p>
      </div>
    </div>
  );
}
