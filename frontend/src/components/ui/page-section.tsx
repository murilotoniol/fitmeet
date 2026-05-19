import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type PageSectionProps = {
  title: string;
  actionLabel?: string;
  onActionClick?: () => void;
  className?: string;
  children: ReactNode;
};

function PageSection({
  title,
  actionLabel,
  onActionClick,
  className,
  children,
}: PageSectionProps) {
  return (
    <section className={cn("min-w-0 space-y-4", className)}>
      <div className="flex min-w-0 items-center justify-between gap-3 sm:gap-4">
        <h2 className="min-w-0 flex-1 break-words text-subtitle text-[var(--color-title)]">{title}</h2>
        {actionLabel ? (
          <button
            type="button"
            onClick={onActionClick}
            className="shrink-0 rounded-[8px] px-1 py-1 text-label text-[var(--color-title)] transition-opacity hover:opacity-80"
          >
            {actionLabel}
          </button>
        ) : null}
      </div>
      {children}
    </section>
  );
}

export { PageSection };
