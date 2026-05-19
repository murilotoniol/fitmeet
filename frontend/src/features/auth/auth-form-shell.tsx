import type { ReactNode } from "react";

import { BrandLogo } from "@/components/ui/logo";

type AuthFormShellProps = {
  title: string;
  description: ReactNode;
  form: ReactNode;
  footer: ReactNode;
  contentClassName?: string;
};

function AuthFormShell({
  title,
  description,
  form,
  footer,
  contentClassName,
}: AuthFormShellProps) {
  return (
    <section className="flex w-full max-w-[320px] flex-col gap-12">
      <BrandLogo />

      <div className={contentClassName}>
        <div className="space-y-3">
          <h1 className="text-title text-[var(--color-title)]">{title}</h1>
          <p className="text-body text-[var(--color-text)]">{description}</p>
        </div>

        <div>{form}</div>

        <div className="text-center text-sm text-[var(--color-text)]">{footer}</div>
      </div>
    </section>
  );
}

export { AuthFormShell };
