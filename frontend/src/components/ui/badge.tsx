import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold tracking-[0.02em]",
  {
    variants: {
      variant: {
        default:
          "border-[var(--color-border)] bg-white text-[var(--color-title)]",
        success:
          "border-transparent bg-[rgb(0_188_125_/_0.14)] text-[var(--color-primary-600)]",
        danger:
          "border-transparent bg-[rgb(231_0_11_/_0.12)] text-[var(--color-danger)]",
        neutral:
          "border-transparent bg-[#f5f5f5] text-[var(--color-text)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

type BadgeProps = HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>;

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge };
