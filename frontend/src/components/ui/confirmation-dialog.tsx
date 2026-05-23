import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { Button } from "./button";
import { Modal } from "./modal";

type ConfirmationDialogProps = {
  open: boolean;
  title: string;
  description: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
  loading?: boolean;
  className?: string;
  contentClassName?: string;
  textBoxClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  actionsClassName?: string;
  cancelButtonClassName?: string;
  confirmButtonClassName?: string;
  hideCloseButton?: boolean;
};

function ConfirmationDialog({
  open,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  destructive = false,
  onConfirm,
  onCancel,
  loading = false,
  className,
  contentClassName,
  textBoxClassName,
  titleClassName,
  descriptionClassName,
  actionsClassName,
  cancelButtonClassName,
  confirmButtonClassName,
  hideCloseButton = false,
}: ConfirmationDialogProps) {
  return (
    <Modal
      open={open}
      onClose={hideCloseButton ? undefined : onCancel}
      className={cn(
        "w-full min-w-0 max-w-[min(650px,calc(100vw-1.5rem))] rounded-[8px] px-5 py-8 shadow-[0_24px_80px_rgb(23_23_23_/_0.24)] sm:px-10 sm:py-12 lg:px-12 lg:py-14",
        className,
      )}
    >
      <div className={cn("min-w-0 space-y-8 sm:space-y-10", contentClassName)}>
        <div className={cn("space-y-4 sm:space-y-5", textBoxClassName)}>
          <h2 className={cn("break-words text-2xl text-[var(--color-title)] sm:text-title", titleClassName)}>
            {title}
          </h2>
          <div className={cn("break-words text-body text-[var(--color-text)]", descriptionClassName)}>
            {description}
          </div>
        </div>

        <div className={cn("flex min-w-0 flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3", actionsClassName)}>
          <Button
            variant="outline"
            className={cn(
              "w-full border-[#171717] text-[#171717] hover:border-[#171717] hover:text-[#171717] sm:w-auto",
              cancelButtonClassName,
            )}
            onClick={onCancel}
            disabled={loading}
          >
            {cancelLabel}
          </Button>

          <Button
            className={cn("w-full text-white sm:w-auto", confirmButtonClassName)}
            variant={destructive ? "danger" : "primary"}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Processando..." : confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export { ConfirmationDialog };
