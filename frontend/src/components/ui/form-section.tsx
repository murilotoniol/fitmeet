import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type FormSectionProps = {
  title?: string;
  className?: string;
  children: ReactNode;
};

function FormSection({ title, className, children }: FormSectionProps) {
  return (
    <section className={cn("min-w-0 space-y-4", className)}>
      {title ? (
        <h3 className="min-w-0 break-words text-label text-[var(--color-title)]">{title}</h3>
      ) : null}
      {children}
    </section>
  );
}

export { FormSection };
