import React from 'react';

export const StatCardSkeleton: React.FC = () => (
  <div className="bg-[#F4F4F2] rounded-[22px] p-4 border border-black/5 animate-pulse">
    <div className="w-8 h-8 rounded-xl bg-black/10 mb-3" />
    <div className="w-16 h-2.5 rounded-full bg-black/10 mb-2" />
    <div className="w-24 h-6 rounded-full bg-black/15 mb-2" />
    <div className="w-14 h-4 rounded-full bg-black/10" />
  </div>
);

export const ExpenseCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-[22px] p-4 border border-black/5 shadow-2xs animate-pulse flex items-center justify-between gap-3">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-2xl bg-[#F4F4F2]" />
      <div className="space-y-1.5">
        <div className="w-28 h-3.5 rounded-full bg-black/15" />
        <div className="w-16 h-2.5 rounded-full bg-black/10" />
      </div>
    </div>
    <div className="space-y-1 text-right">
      <div className="w-16 h-4 rounded-full bg-black/15 ml-auto" />
      <div className="w-12 h-2.5 rounded-full bg-black/10 ml-auto" />
    </div>
  </div>
);

export const OverviewSkeleton: React.FC = () => (
  <div className="space-y-4 px-3 sm:px-4 pb-28">
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
      <div className="col-span-2 sm:col-span-1 bg-[#C4F96B]/50 rounded-[22px] p-4 border border-black/5 animate-pulse">
        <div className="w-8 h-8 rounded-xl bg-[#0B0B0B]/15 mb-3" />
        <div className="w-20 h-2.5 rounded-full bg-[#0B0B0B]/15 mb-2" />
        <div className="w-32 h-7 rounded-full bg-[#0B0B0B]/20" />
      </div>
      <StatCardSkeleton />
      <StatCardSkeleton />
    </div>

    {/* Chart Skeleton */}
    <div className="bg-white rounded-[24px] p-5 border border-black/5 animate-pulse space-y-3">
      <div className="w-36 h-3 rounded-full bg-black/15" />
      <div className="h-28 w-full bg-[#F4F4F2] rounded-2xl" />
    </div>

    {/* Category Breakdown Skeleton */}
    <div className="bg-white rounded-[24px] p-5 border border-black/5 animate-pulse space-y-3">
      <div className="w-40 h-3 rounded-full bg-black/15" />
      <div className="h-4 w-full bg-[#F4F4F2] rounded-full" />
      <div className="space-y-2 pt-2">
        <div className="h-3 w-full bg-[#F4F4F2] rounded-full" />
        <div className="h-3 w-5/6 bg-[#F4F4F2] rounded-full" />
      </div>
    </div>
  </div>
);

export const ExpensesSkeleton: React.FC = () => (
  <div className="space-y-4 px-3 sm:px-4 pb-28">
    {/* Search & Filter */}
    <div className="h-10 rounded-2xl bg-white border border-black/5 animate-pulse" />
    <div className="flex gap-2 overflow-hidden">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="w-16 h-7 rounded-full bg-[#F4F4F2] shrink-0 animate-pulse" />
      ))}
    </div>

    {/* Summary banner */}
    <div className="h-16 rounded-[22px] bg-[#F4F4F2] animate-pulse" />

    {/* Cards */}
    <div className="space-y-2">
      {[1, 2, 3, 4].map((i) => (
        <ExpenseCardSkeleton key={i} />
      ))}
    </div>
  </div>
);
