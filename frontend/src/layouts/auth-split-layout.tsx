import type { ReactNode } from "react";

import authHeroImage from "@/assets/hero.png";

type AuthSplitLayoutProps = {
  children: ReactNode;
};

function AuthSplitLayout({ children }: AuthSplitLayoutProps) {
  return (
    <main className="min-h-screen bg-white p-3">
      <div className="grid min-h-[calc(100dvh-24px)] min-w-0 grid-cols-1 bg-white lg:grid-cols-2">
        <div className="hidden min-h-0 p-0 pr-3 lg:block">
          <img
            src={authHeroImage}
            alt="Pessoas correndo ao ar livre"
            className="h-full min-h-[calc(100dvh-24px)] w-full rounded-[12px] object-cover"
          />
        </div>
        <div className="flex min-w-0 w-full max-w-full items-center justify-center px-4 py-10 sm:px-6 lg:px-0 lg:py-0">
          {children}
        </div>
      </div>
    </main>
  );
}

export { AuthSplitLayout };
