import { Skeleton } from "../ui";

export function NoteSkeleton() {
  return (
    <article className="flex h-[336px] w-[336px] flex-col overflow-hidden rounded-card border-[1.5px] border-transparent bg-[rgba(95,82,178,0.35)] p-6 backdrop-blur-glass">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-8 w-32" />
      </header>

      <div className="mt-4 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-full" />
      </div>
    </article>
  );
}
