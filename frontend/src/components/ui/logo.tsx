import { PersonStanding } from "lucide-react";

import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
};

function BrandLogo({ className }: BrandLogoProps) {
  return (
    <div className={cn("inline-flex h-10 w-[119px] min-w-0 items-center gap-2", className)}>
      <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] bg-[linear-gradient(180deg,#00BC7D_0%,#009966_100%)] p-1 text-white">
        <PersonStanding size={32} strokeWidth={2} aria-hidden />
      </div>
      <span className="h-8 w-[71px] min-w-0 font-[family-name:var(--font-heading)] text-title uppercase leading-[var(--text-title-line)] tracking-[0.02em] text-[var(--color-primary-600)]">
        FITMEET
      </span>
    </div>
  );
}

export { BrandLogo };
