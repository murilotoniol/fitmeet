import { CalendarDays, Lock, Users } from "lucide-react";

import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { ACTIVITY_PLACEHOLDER } from "@/utils/image-placeholders";

type ActivityCardProps = {
  title: string;
  image: string;
  date: string;
  participants: number;
  privateActivity?: boolean;
  horizontal?: boolean;
  onClick?: () => void;
};

function ActivityCard({
  title,
  image,
  date,
  participants,
  privateActivity = false,
  horizontal = false,
  onClick,
}: ActivityCardProps) {
  return (
    <article
      onClick={onClick}
      className={[
        "group relative overflow-hidden rounded-[8px] bg-white transition-transform hover:-translate-y-0.5",
        onClick ? "cursor-pointer" : "",
        horizontal ? "flex items-center gap-5 p-5" : "flex h-[228px] w-full flex-col gap-4 lg:w-[296px]",
      ].join(" ")}
    >
      <div
        className={
          horizontal
            ? "relative h-[116px] w-[116px] shrink-0 overflow-hidden rounded-[var(--radius-sm)] bg-[var(--color-highlight)]"
            : "relative h-[160px] w-full shrink-0 overflow-hidden rounded-[8px] bg-[#d9d9d9] lg:w-[296px]"
        }
      >
        <ImageWithFallback
          src={image}
          fallbackSrc={ACTIVITY_PLACEHOLDER}
          alt={title}
          className="h-full w-full object-cover"
        />
      </div>

      <div
        className={
          horizontal
            ? "flex min-w-0 flex-1 flex-col gap-4"
            : "flex h-[52px] min-w-0 flex-col gap-3"
        }
      >
        <h3 className="h-5 truncate text-body font-semibold leading-5 text-[var(--color-title)]">
          {title}
        </h3>
        <div className="flex h-5 items-center gap-x-4 overflow-hidden text-sm leading-5 text-[var(--color-text)]">
          <span className="inline-flex items-center gap-2">
            <CalendarDays size={18} className="text-[var(--color-primary-500)]" />
            {date}
          </span>
          <span className="hidden h-5 w-px bg-[var(--color-divider)]/50 sm:inline-block" />
          <span className="inline-flex items-center gap-2">
            <Users size={18} className="text-[var(--color-primary-500)]" />
            {participants}
          </span>
          {privateActivity ? (
            <span
              className="inline-flex items-center gap-2"
              aria-label="Mediante aprovação"
              title="Mediante aprovação"
            >
              <Lock size={18} className="text-[var(--color-primary-500)]" />
              <span className="sr-only">Mediante aprovação</span>
            </span>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export { ActivityCard };
