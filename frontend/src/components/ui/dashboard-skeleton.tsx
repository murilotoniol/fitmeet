import { Skeleton } from "./skeleton";

function DashboardSkeleton() {
  return (
    <div className="min-w-0 max-w-full space-y-10" aria-label="Carregando atividades">
      <section className="space-y-5">
        <Skeleton className="h-8 w-56 rounded-[4px]" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="space-y-4">
              <Skeleton className="h-40 rounded-[8px]" />
              <Skeleton className="h-5 w-3/4 rounded-[4px]" />
              <Skeleton className="h-4 w-1/2 rounded-[4px]" />
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <Skeleton className="h-8 w-48 rounded-[4px]" />
        <div className="flex gap-6 overflow-hidden">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="shrink-0 space-y-2">
              <Skeleton className="h-[90px] w-[90px] rounded-full" />
              <Skeleton className="mx-auto h-4 w-16 rounded-[4px]" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export { DashboardSkeleton };
