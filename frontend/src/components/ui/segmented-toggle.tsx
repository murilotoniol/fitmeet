import { cn } from "@/lib/utils";

type Segment = {
  value: string;
  label: string;
};

type SegmentedToggleProps = {
  value: string;
  options: Segment[];
  className?: string;
  onChange?: (value: string) => void;
};

function SegmentedToggle({ value, options, className, onChange }: SegmentedToggleProps) {
  return (
    <div className={cn("grid w-full min-w-0 grid-cols-2 gap-2 sm:flex sm:w-auto sm:items-center", className)}>
      {options.map((option) => {
        const active = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange?.(option.value)}
            className={cn(
              "h-11 min-w-0 flex-1 rounded-[8px] border px-6 text-label transition-colors sm:w-[77px] sm:flex-none",
              active
                ? "border-[#424242] bg-[#424242] text-white"
                : "border-[var(--color-border)] bg-white text-[var(--color-title)]",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export { SegmentedToggle };
