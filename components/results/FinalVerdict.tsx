"use client";

import { useRouter } from "next/navigation";
import { ATSResult } from "@/lib/types";

interface FinalVerdictProps {
  result: ATSResult;
}

export default function FinalVerdict({ result }: FinalVerdictProps) {
  const router = useRouter();

  return (
    <div className="bg-[#4338CA] rounded-2xl p-6 lg:p-7 text-white flex flex-col justify-between shadow-card h-full">
      <div>
        <p className="text-white/70 text-[11px] font-bold tracking-widest uppercase mb-2">
          FINAL VERDICT
        </p>
        <h3 className="text-white font-extrabold text-[20px] mb-2.5 leading-snug">
          Strong Candidate Profile
        </h3>
        <p className="text-white/85 text-[13.5px] leading-relaxed mb-6">
          {result.finalVerdict}
        </p>
      </div>

      <button
        type="button"
        onClick={() => router.push("/analyze")}
        className="w-full bg-white hover:bg-[#F8F7FF] text-[#4338CA] font-bold text-[13.5px] py-3 px-5 rounded-xl transition-all duration-150 shadow-sm text-center"
      >
        Analyze Another Resume
      </button>
    </div>
  );
}
