import { X } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type ModalProps = {
  open: boolean;
  onClose?: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
  overlayClassName?: string;
};

function Modal({ open, onClose, title, children, className, overlayClassName }: ModalProps) {
  if (!open) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex max-h-[100dvh] min-h-0 flex-col items-center overflow-x-hidden overflow-y-auto overscroll-y-contain bg-[rgb(23_23_23_/_0.35)] px-3 py-4 sm:justify-center sm:px-4 sm:py-6",
        overlayClassName,
      )}
    >
      <div
        className={cn(
          "my-auto w-full min-w-0 max-w-[min(36rem,calc(100vw-1.5rem))] rounded-[24px] bg-white p-4 shadow-[0_24px_80px_rgb(23_23_23_/_0.24)] sm:p-6",
          className,
        )}
      >
        {title || onClose ? (
          <div className="mb-4 flex min-w-0 items-start justify-between gap-4">
            {title ? <h2 className="min-w-0 flex-1 break-words text-subtitle text-[var(--color-title)]">{title}</h2> : <div />}
            {onClose ? (
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border)] text-[var(--color-text)] transition-colors hover:border-[var(--color-border-focus)] hover:text-[var(--color-title)]"
                aria-label="Fechar modal"
              >
                <X size={18} />
              </button>
            ) : null}
          </div>
        ) : null}
        {children}
      </div>
    </div>
  );
}

export { Modal };
