import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  padded?: boolean;
};

function Card({ className, padded = true, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--gradient-surface)] shadow-[var(--shadow-card)]",
        padded ? "p-6" : "",
        className,
      )}
      {...props}
    />
  );
}

export { Card };
