
import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = "" }) => {
  return (
    <div className={`animate-pulse bg-slate-200 rounded-md ${className}`}></div>
  );
};

export const CardSkeleton: React.FC = () => (
  <div className="bg-white rounded-[2rem] border border-rose-50 overflow-hidden shadow-sm p-4 h-full">
    <Skeleton className="aspect-square w-full rounded-2xl mb-4" />
    <Skeleton className="h-6 w-3/4 mb-2" />
    <Skeleton className="h-4 w-1/4 mb-4" />
    <Skeleton className="h-4 w-full mb-2" />
    <Skeleton className="h-4 w-5/6 mb-6" />
    <div className="flex justify-between items-center">
      <Skeleton className="h-8 w-16 rounded-lg" />
      <Skeleton className="h-10 w-24 rounded-2xl" />
    </div>
  </div>
);

export const OrderRowSkeleton: React.FC = () => (
  <div className="flex items-center gap-4 px-6 py-5 border-b border-rose-50">
    <Skeleton className="w-12 h-4" />
    <div className="flex-grow">
      <Skeleton className="h-5 w-32 mb-1" />
      <Skeleton className="h-3 w-20" />
    </div>
    <Skeleton className="h-4 w-24" />
    <Skeleton className="h-4 w-16" />
    <Skeleton className="h-8 w-24 rounded-full" />
    <Skeleton className="w-8 h-8 rounded-xl" />
  </div>
);
