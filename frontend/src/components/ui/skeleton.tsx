import { cn } from "@/lib/utils";

type SkeletonProps = {
  className?: string;
};

function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-[var(--radius-md)] bg-[linear-gradient(90deg,#f1f1f1_25%,#f8f8f8_50%,#f1f1f1_75%)] bg-[length:200%_100%]",
        className,
      )}
    />
  );
}

export { Skeleton };
