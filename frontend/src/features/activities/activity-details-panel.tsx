import { CalendarDays, Lock, Users } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { ACTIVITY_PLACEHOLDER } from "@/utils/image-placeholders";

type ActivityDetailsPanelProps = {
  title: string;
  image: string;
  description: string;
  date: string;
  participants: number;
  approvalRequired?: boolean;
  actionIcon?: ReactNode;
  actionLabel?: string;
  actionDisabled?: boolean;
  actionVariant?: "primary" | "outline" | "ghost" | "danger";
  actionClassName?: string;
  onActionClick?: () => void;
  children?: ReactNode;
};

function ActivityDetailsPanel({
  title,
  image,
  description,
  date,
  participants,
  approvalRequired = false,
  actionIcon,
  actionLabel,
  actionDisabled = false,
  actionVariant = "primary",
  actionClassName,
  onActionClick,
  children,
}: ActivityDetailsPanelProps) {
  return (
    <div className="flex h-full min-w-0 flex-col gap-8">
      <div className="space-y-8">
        <ImageWithFallback
          src={image}
          fallbackSrc={ACTIVITY_PLACEHOLDER}
          alt={title}
          className="h-[168px] w-full rounded-[4px] object-cover"
        />

        <div className="space-y-5">
          <h2 className="break-words text-title text-[var(--color-title)]">{title}</h2>
          <p className="break-words text-body text-[var(--color-text)]">{description}</p>
        </div>
      </div>

      <div className="mt-auto space-y-8">
        <div className="flex flex-col gap-4 text-body text-[var(--color-text)]">
          <div className="flex items-center gap-3">
            <CalendarDays size={22} className="text-[var(--color-primary-500)]" />
            {date}
          </div>

          <div className="flex items-center gap-3">
            <Users size={22} className="text-[var(--color-primary-500)]" />
            {participants} participantes
          </div>

          {approvalRequired ? (
            <div className="flex items-center gap-3">
              <Lock size={28} strokeWidth={1.75} className="text-[var(--color-primary-500)]" />
              Mediante aprovação
            </div>
          ) : null}
        </div>

        {children}

        {actionLabel ? (
          <Button
            className={`h-12 w-full max-w-full min-w-0 gap-1.5 rounded-[4px] px-3 sm:max-w-[224px] ${
              actionVariant === "primary" || actionVariant === "danger" ? "text-white" : ""
            } ${!onActionClick ? "pointer-events-none" : ""} ${actionClassName ?? ""}`}
            variant={actionVariant}
            disabled={Boolean(onActionClick) && actionDisabled}
            aria-disabled={actionDisabled || !onActionClick}
            onClick={onActionClick}
          >
            {actionIcon}
            {actionLabel}
          </Button>
        ) : null}
      </div>
    </div>
  );
}

export { ActivityDetailsPanel };
