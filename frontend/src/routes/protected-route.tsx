import { Navigate } from "react-router";
import type { ReactNode } from "react";

import { useSession } from "@/hooks/use-session";

type ProtectedRouteProps = {
  children: ReactNode;
};

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { loading, isAuthenticated } = useSession();

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-body text-[var(--color-text)]">Carregando...</p>
      </main>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export { ProtectedRoute };
