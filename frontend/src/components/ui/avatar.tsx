import { cn } from "@/lib/utils";

type AvatarProps = {
  src?: string;
  alt?: string;
  name: string;
  role?: string;
  highlighted?: boolean;
  size?: "sm" | "md" | "lg";
};

const avatarSizeMap = {
  sm: "h-12 w-12 text-sm",
  md: "h-20 w-20 text-lg",
  lg: "h-[90px] w-[90px] text-xl",
};

function initialsFromName(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function Avatar({ src, alt, name, role, highlighted = false, size = "md" }: AvatarProps) {
  return (
    <div className="inline-flex items-center gap-6">
      <div
        className={cn(
          "inline-flex items-center justify-center overflow-hidden rounded-full bg-white",
          highlighted
            ? "border-[4px] border-[var(--color-primary-500)]"
            : "border border-[var(--color-border)]",
        )}
      >
        {src ? (
          <img
            src={src}
            alt={alt ?? name}
            className={cn("rounded-full object-cover", avatarSizeMap[size])}
          />
        ) : (
          <span
            className={cn(
              "inline-flex items-center justify-center rounded-full bg-[var(--color-primary-500)] font-semibold text-white",
              avatarSizeMap[size],
            )}
          >
            {initialsFromName(name)}
          </span>
        )}
      </div>
      <div className="flex flex-col">
        <span className="text-body text-[var(--color-title)]">{name}</span>
        {role ? <span className="text-sm text-[var(--color-text)]">{role}</span> : null}
      </div>
    </div>
  );
}

export { Avatar };
