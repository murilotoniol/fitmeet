import type { ReactNode } from "react";

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
}: ConfirmationDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      className="w-full min-w-0 max-w-[min(650px,calc(100vw-1.5rem))] rounded-[8px] px-5 py-8 shadow-[0_24px_80px_rgb(23_23_23_/_0.24)] sm:px-10 sm:py-12 lg:px-12 lg:py-14"
    >
      <div className="min-w-0 space-y-8 sm:space-y-10">
        <div className="space-y-4 sm:space-y-5">
          <h2 className="break-words text-2xl text-[var(--color-title)] sm:text-title">{title}</h2>
          <div className="break-words text-body text-[var(--color-text)]">{description}</div>
        </div>

        <div className="flex min-w-0 flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
          <Button
            variant="outline"
            className="w-full border-[#171717] text-[#171717] hover:border-[#171717] hover:text-[#171717] sm:w-auto"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelLabel}
          </Button>

          <Button
            className="w-full text-white sm:w-auto"
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
