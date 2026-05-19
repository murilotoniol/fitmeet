import { AlertCircle, CheckCircle2 } from "lucide-react";
import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

type AlertProps = HTMLAttributes<HTMLDivElement> & {
  title?: string;
  description: ReactNode;
  variant?: "error" | "success" | "neutral";
};

const variantMap = {
  error: {
    wrapper: "border-[rgb(231_0_11_/_0.18)] bg-[rgb(231_0_11_/_0.06)] text-[var(--color-danger)]",
    icon: AlertCircle,
  },
  success: {
    wrapper: "border-[rgb(0_188_125_/_0.18)] bg-[rgb(0_188_125_/_0.06)] text-[var(--color-primary-600)]",
    icon: CheckCircle2,
  },
  neutral: {
    wrapper: "border-[var(--color-border)] bg-[#fafafa] text-[var(--color-text)]",
    icon: AlertCircle,
  },
};

function Alert({ className, title, description, variant = "neutral", ...props }: AlertProps) {
  const Icon = variantMap[variant].icon;

  return (
    <div
      className={cn(
        "flex min-w-0 max-w-full items-start gap-3 rounded-[var(--radius-md)] border px-4 py-3",
        variantMap[variant].wrapper,
        className,
      )}
      role={variant === "error" ? "alert" : "status"}
      {...props}
    >
      <Icon size={18} className="mt-0.5 shrink-0" />
      <div className="min-w-0 flex-1 space-y-1">
        {title ? <p className="text-label">{title}</p> : null}
        <div className="break-words text-sm leading-5">{description}</div>
      </div>
    </div>
  );
}

export { Alert };
