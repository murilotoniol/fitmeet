import { CalendarDays, Lock, Users } from "lucide-react";

import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { ACTIVITY_PLACEHOLDER } from "@/utils/image-placeholders";

type ActivityListItemProps = {
  title: string;
  image: string;
  date: string;
  participants: number;
  privateActivity?: boolean;
  onClick?: () => void;
};

function ActivityListItem({
  title,
  image,
  date,
  participants,
  privateActivity = false,
  onClick,
}: ActivityListItemProps) {
  return (
    <article
      onClick={onClick}
      className={`flex h-[88px] min-w-0 items-start gap-3 ${onClick ? "cursor-pointer" : ""}`}
    >
      <div className="relative h-[88px] w-[88px] shrink-0 overflow-hidden rounded-[8px] bg-[var(--color-highlight)]">
        <ImageWithFallback
          src={image}
          fallbackSrc={ACTIVITY_PLACEHOLDER}
          alt={title}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="min-w-0 flex-1 space-y-3 pt-1">
        <h3 className="text-body font-semibold text-[var(--color-title)]">{title}</h3>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[var(--color-text)]">
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

export { ActivityListItem };
