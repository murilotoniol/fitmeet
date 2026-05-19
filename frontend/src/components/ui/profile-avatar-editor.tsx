import { Camera } from "lucide-react";
import { useId } from "react";

import { AVATAR_PLACEHOLDER } from "@/utils/image-placeholders";

import { ImageWithFallback } from "./image-with-fallback";

type ProfileAvatarEditorProps = {
  image: string;
  alt?: string;
  onChange?: (file: File | null) => void;
};

function ProfileAvatarEditor({
  image,
  alt = "Avatar do perfil",
  onChange,
}: ProfileAvatarEditorProps) {
  const inputId = useId();

  return (
    <div className="relative h-[192px] w-[192px]">
      <ImageWithFallback
        src={image}
        fallbackSrc={AVATAR_PLACEHOLDER}
        alt={alt}
        className="h-full w-full rounded-full object-cover"
      />

      <label
        htmlFor={inputId}
        className="absolute bottom-2 right-0 inline-flex h-14 w-14 cursor-pointer items-center justify-center rounded-full border border-[var(--color-border)] bg-white text-[var(--color-text)] shadow-[0_8px_20px_rgb(23_23_23_/_0.12)] transition-colors hover:text-[var(--color-title)]"
      >
        <Camera size={26} />
      </label>

      <input
        id={inputId}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => onChange?.(event.target.files?.[0] ?? null)}
      />
    </div>
  );
}

export { ProfileAvatarEditor };
