import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type EmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
};

function EmptyState({ title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[180px] flex-col items-center justify-center rounded-[var(--radius-md)] border border-dashed border-[var(--color-border)] bg-white px-6 py-10 text-center",
        className,
      )}
    >
      <div className="max-w-[420px] space-y-3">
        <h3 className="text-body font-semibold text-[var(--color-title)]">{title}</h3>
        <p className="text-sm text-[var(--color-text)]">{description}</p>
      </div>

      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export { EmptyState };
