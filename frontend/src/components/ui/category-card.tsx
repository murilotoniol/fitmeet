import { cn } from "@/lib/utils";
import { CATEGORY_PLACEHOLDER } from "@/utils/image-placeholders";

import { ImageWithFallback } from "./image-with-fallback";

type CategoryCardProps = {
  title: string;
  image: string;
  selected?: boolean;
  className?: string;
  onClick?: () => void;
};

function CategoryCard({
  title,
  image,
  selected = false,
  className,
  onClick,
}: CategoryCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-[122px] w-[90px] shrink-0 flex-col items-center gap-2 text-left",
        onClick ? "cursor-pointer" : "cursor-default",
        className,
      )}
    >
      <div
        className={cn(
          "aspect-square h-[90px] w-[90px] min-w-[90px] shrink-0 overflow-hidden rounded-full bg-white",
          selected
            ? "border-[4px] border-[var(--color-primary-500)]"
            : "border border-[var(--color-border)]",
        )}
      >
        <ImageWithFallback
          src={image}
          fallbackSrc={CATEGORY_PLACEHOLDER}
          alt={title}
          className="h-full w-full object-cover"
        />
      </div>
      <span className="h-5 max-w-[90px] truncate text-center text-body leading-5 text-[var(--color-title)]">
        {title}
      </span>
    </button>
  );
}

export { CategoryCard };
