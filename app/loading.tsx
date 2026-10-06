import { Skeleton } from "@/components/ui/Skeleton";

export default function GlobalLoading() {
  return (
    <div className="min-h-screen bg-[#F6F7FD] dark:bg-[#0C0E17] flex flex-col">
      {/* Header Skeleton */}
      <div className="h-[64px] bg-white dark:bg-[#141724] border-b border-[#F0F1FA] dark:border-[#23273E] px-8 flex items-center justify-between">
        <Skeleton className="h-5 w-32" />
        <div className="flex gap-3">
          <Skeleton className="w-8 h-8 rounded-full" />
          <Skeleton className="w-8 h-8 rounded-full" />
        </div>
      </div>

      {/* Main Container Skeleton */}
      <div className="flex-1 max-w-[1340px] mx-auto w-full px-6 lg:px-10 py-8 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-7 w-60" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white dark:bg-[#141724] p-5 rounded-2xl border border-[#ECEFF8] dark:border-[#23273E] space-y-3">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-8 w-16" />
            </div>
          ))}
        </div>
        <div className="h-72 w-full bg-white dark:bg-[#141724] rounded-2xl border border-[#ECEFF8] dark:border-[#23273E] p-6 space-y-4">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    </div>
  );
}
