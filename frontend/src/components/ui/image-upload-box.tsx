import { Image as ImageIcon } from "lucide-react";
import { useId } from "react";

import { cn } from "@/lib/utils";

type ImageUploadBoxProps = {
  label?: string;
  required?: boolean;
  previewUrl?: string | null;
  onChange?: (file: File | null) => void;
  accept?: string;
  boxClassName?: string;
};

function ImageUploadBox({
  label = "Imagem",
  required = false,
  previewUrl,
  onChange,
  accept = "image/*",
  boxClassName,
}: ImageUploadBoxProps) {
  const inputId = useId();

  return (
    <div className="min-w-0 max-w-full space-y-2">
      <div className="text-label text-[var(--color-title)]">
        {label}
        {required ? <span className="ml-1 text-[var(--color-danger)]">*</span> : null}
      </div>

      <label
        htmlFor={inputId}
        className={cn(
          "flex min-h-32 w-full max-w-full cursor-pointer items-center justify-center overflow-hidden rounded-[8px] border border-[var(--color-border)] bg-white text-[#d4d4d4] transition-colors hover:border-[var(--color-border-focus)]",
          boxClassName,
        )}
      >
        {previewUrl ? (
          <img src={previewUrl} alt="Prévia da imagem" className="h-full w-full object-cover" />
        ) : (
          <ImageIcon size={40} strokeWidth={1.5} />
        )}
      </label>

      <input
        id={inputId}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(event) => onChange?.(event.target.files?.[0] ?? null)}
      />
    </div>
  );
}

export { ImageUploadBox };
