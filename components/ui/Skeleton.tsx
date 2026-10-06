import React from "react";
import { cn } from "@/lib/utils";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("skeleton-shimmer rounded-lg bg-gray-200/80 dark:bg-gray-800/80", className)}
      {...props}
    />
  );
}

/**
 * Skeleton for Dashboard 4 Top Stat Cards
 */
export function StatsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="bg-white rounded-2xl p-5 border border-[#ECEFF8] shadow-xs flex items-center justify-between"
        >
          <div className="space-y-2 flex-1">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-7 w-16" />
            <Skeleton className="h-2.5 w-28" />
          </div>
          <Skeleton className="w-11 h-11 rounded-xl shrink-0" />
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton for Table Rows
 */
export function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-[#ECEFF8] shadow-xs overflow-hidden">
      <div className="flex items-center justify-between mb-5">
        <div className="space-y-1.5">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-3 w-64" />
        </div>
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>

      <div className="space-y-3">
        {/* Table header */}
        <div className="flex gap-4 py-2 border-b border-gray-100 dark:border-gray-800">
          {Array.from({ length: cols }).map((_, i) => (
            <Skeleton key={i} className="h-3 flex-1" />
          ))}
        </div>

        {/* Table rows */}
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex gap-4 py-3.5 border-b border-gray-50 dark:border-gray-850 items-center">
            <div className="flex items-center gap-3 flex-1">
              <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
              <div className="space-y-1 flex-1">
                <Skeleton className="h-3.5 w-3/4" />
                <Skeleton className="h-2.5 w-1/2" />
              </div>
            </div>
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-3 w-24 hidden sm:block" />
            <Skeleton className="h-4 w-12 ml-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Full page skeleton for ATS Analysis / Results Details
 */
export function AnalysisDetailSkeleton() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-[1240px] mx-auto space-y-8 animate-pulse">
      {/* Top Banner Skeleton */}
      <div className="bg-white rounded-2xl p-6 border border-[#ECEFF8] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 w-28 rounded-xl" />
          <Skeleton className="h-10 w-36 rounded-xl" />
        </div>
      </div>

      {/* Score Grid & Verdict */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-[#ECEFF8] shadow-xs flex flex-col items-center justify-center min-h-[300px]">
          <Skeleton className="w-40 h-40 rounded-full mb-4" />
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>

        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-[#ECEFF8] shadow-xs space-y-4">
          <Skeleton className="h-5 w-44" />
          <div className="grid grid-cols-2 gap-4 pt-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-6 w-14" />
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Keywords and Skills Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-[#ECEFF8] shadow-xs space-y-4">
          <Skeleton className="h-5 w-40" />
          <div className="flex flex-wrap gap-2 pt-2">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((k) => (
              <Skeleton key={k} className="h-7 w-20 rounded-full" />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-[#ECEFF8] shadow-xs space-y-4">
          <Skeleton className="h-5 w-40" />
          <div className="flex flex-wrap gap-2 pt-2">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((k) => (
              <Skeleton key={k} className="h-7 w-24 rounded-full" />
            ))}
          </div>
        </div>
      </div>

      {/* Top Changes & Recommendations */}
      <div className="bg-white rounded-2xl p-6 border border-[#ECEFF8] shadow-xs space-y-4">
        <Skeleton className="h-5 w-52" />
        <div className="space-y-3 pt-2">
          {[1, 2, 3, 4, 5].map((c) => (
            <div key={c} className="flex gap-3 items-center p-3 rounded-xl border border-gray-100 dark:border-gray-800">
              <Skeleton className="w-6 h-6 rounded-full shrink-0" />
              <Skeleton className="h-4 flex-1" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton for Resume Cards (Library)
 */
export function ResumeCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="bg-white rounded-2xl p-5 border border-[#ECEFF8] shadow-xs space-y-4">
          <div className="flex items-start justify-between">
            <Skeleton className="w-10 h-10 rounded-xl" />
            <Skeleton className="w-6 h-6 rounded-md" />
          </div>
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <div className="pt-2 flex items-center justify-between border-t border-gray-100 dark:border-gray-800">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-7 w-20 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}
