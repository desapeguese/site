import { Skeleton } from "./skeleton";

export const MenuSkeleton = () => {
  return (
    <div className="bg-card border-b border-border w-full">
      <div className="mx-auto px-4 py-3 flex justify-between items-center max-w-[1440px]">
        <Skeleton className="h-10 w-10 xl:hidden" />

        <div className="hidden xl:flex gap-6 w-full justify-center">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-24" />
        </div>
      </div>
    </div>
  );
};