"use client";

import { useState } from "react";
import { ATSResult } from "@/lib/types";

interface TopChangesProps {
  result: ATSResult;
}

export default function TopChanges({ result }: TopChangesProps) {
  const { top5Changes } = result;
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});

  const toggleCheck = (idx: number) => {
    setCheckedItems((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="bg-white dark:bg-[#121528] border border-[#E5E3F2] dark:border-[#1E223D] rounded-2xl p-6 lg:p-7 shadow-card transition-colors">
      <h3 className="text-[#171725] dark:text-white font-extrabold text-[18px] mb-5">
        Top 5 Changes Checklist
      </h3>
      <div className="space-y-4">
        {top5Changes.map((change, index) => {
          const isChecked = !!checkedItems[index];
          return (
            <label
              key={index}
              className="flex items-start gap-3.5 cursor-pointer group select-none"
            >
              <div
                onClick={() => toggleCheck(index)}
                className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-all duration-150 ${
                  isChecked
                    ? "bg-[#4F46E5] border-[#4F46E5] text-white"
                    : "border-[#C5BDFF] dark:border-[#3E4578] bg-white dark:bg-[#1A1E36] group-hover:border-[#4F46E5]"
                }`}
              >
                {isChecked && (
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
              <span
                className={`text-[14px] leading-relaxed transition-colors ${
                  isChecked
                    ? "line-through text-[#8080A0] dark:text-gray-500"
                    : "text-[#33334A] dark:text-gray-200 group-hover:text-[#171725] dark:group-hover:text-white"
                }`}
              >
                {index + 1}. {change}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
