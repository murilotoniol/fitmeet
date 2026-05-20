import { Navigate } from "react-router";

import { Alert } from "@/components/ui/alert";
import { AppShell } from "@/layouts/app-shell";
import { useSession } from "@/hooks/use-session";
import { clearPreferencesSkipped, hasSkippedPreferences } from "@/utils/preferences";

import { DashboardSections } from "./dashboard-sections";
import { useDashboardData } from "./use-dashboard-data";

function HomePage() {
  const { token } = useSession();
  const {
    loading,
    error,
    preferences,
    activityTypes,
    recommendedActivities,
    sections,
  } = useDashboardData(token);

  if (!loading && !error && preferences.length > 0) {
    clearPreferencesSkipped();
  }

  if (!loading && !error && preferences.length === 0 && !hasSkippedPreferences()) {
    return <Navigate to="/preferencias" replace />;
  }

  return (
    <AppShell>
      {error ? <Alert variant="error" description={error} /> : null}

      {loading ? (
        <div className="py-16 text-body text-[var(--color-text)]">Carregando atividades...</div>
      ) : (
        <DashboardSections
          recommendedActivities={recommendedActivities}
          activityTypes={activityTypes}
          sections={sections}
        />
      )}
    </AppShell>
  );
}

export { HomePage };
