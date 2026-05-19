import type { ReactNode } from "react";
import { useNavigate } from "react-router";

import { AppHeader } from "@/components/ui/app-header";
import { useSession } from "@/hooks/use-session";

type AppShellProps = {
  children: ReactNode;
  contentClassName?: string;
  profileImage?: string | null;
  hideAction?: boolean;
};

function AppShell({
  children,
  contentClassName = "",
  profileImage,
  hideAction = false,
}: AppShellProps) {
  const navigate = useNavigate();
  const { logout, user } = useSession();

  return (
    <main className="min-h-screen bg-white px-3 py-5 sm:px-6 sm:py-10 lg:px-12">
      <div className={`mx-auto min-w-0 max-w-[1220px] ${contentClassName}`}>
        <AppHeader
          className="mb-8 min-w-0 sm:mb-12"
          profileImage={profileImage ?? user?.avatar ?? undefined}
          profileName={user?.name}
          hideAction={hideAction}
          onActionClick={() => navigate("/atividades/nova")}
          onProfileClick={() => navigate("/perfil")}
          onLogoutClick={() => {
            logout();
            navigate("/login", { replace: true });
          }}
        />
        {children}
      </div>
    </main>
  );
}

export { AppShell };
