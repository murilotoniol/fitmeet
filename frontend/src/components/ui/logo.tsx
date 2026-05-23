import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
};

function BrandLogo({ className }: BrandLogoProps) {
  return (
    <div className={cn("inline-flex h-10 min-w-0 items-center gap-2", className)}>
      <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] bg-[linear-gradient(180deg,#00BC7D_0%,#009966_100%)] p-1 text-white">
        <svg
          width="32"
          height="32"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          focusable="false"
        >
          <circle cx="19.5" cy="7" r="4" stroke="currentColor" strokeWidth="2.8" />
          <path
            d="M4.5 29C11.7 29 15.4 25.3 16.3 17.9"
            stroke="currentColor"
            strokeWidth="2.8"
            strokeLinecap="round"
          />
          <path
            d="M8.4 13.7C12.7 11.7 16.8 11.8 20 14.1C23 16.2 25.4 17.1 28 16.6"
            stroke="currentColor"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M16.2 18C21.9 20.2 25.1 24.1 25.6 30"
            stroke="currentColor"
            strokeWidth="2.8"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <span className="h-8 min-w-0 bg-[linear-gradient(180deg,#00BC7D_0%,#009966_70%)] bg-clip-text font-[family-name:var(--font-heading)] text-title uppercase leading-[var(--text-title-line)] tracking-[0.02em] text-transparent">
        FITMEET
      </span>
    </div>
  );
}

export { BrandLogo };
