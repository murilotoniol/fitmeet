import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-[var(--radius-xs)] border font-semibold whitespace-normal text-center leading-snug transition-all disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-55 sm:whitespace-nowrap sm:leading-normal [&_svg]:shrink-0 [&_svg]:transition-transform",
  {
    variants: {
      variant: {
        primary:
          "border-transparent bg-[var(--color-primary-500)] !text-white shadow-[0_10px_25px_rgb(0_188_125_/_0.22)] hover:bg-[var(--color-primary-600)] hover:!text-white hover:[&_svg]:scale-105",
        outline:
          "border-[var(--color-primary-500)] bg-white text-[var(--color-primary-600)] hover:border-[var(--color-primary-600)] hover:text-[var(--color-primary-600)]",
        ghost:
          "border-transparent bg-transparent text-[var(--color-title)] hover:bg-[#fafafa]",
        danger:
          "border-transparent bg-[var(--color-danger)] !text-white hover:bg-[#c90009] hover:!text-white",
      },
      size: {
        default: "h-12 px-5 text-label",
        sm: "h-10 px-4 text-label",
        icon: "h-12 w-12 rounded-full p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Button };
