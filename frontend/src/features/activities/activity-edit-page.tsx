import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

import { getActivity } from "@/api/activities";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { DashboardSkeleton } from "@/components/ui/dashboard-skeleton";
import { Modal } from "@/components/ui/modal";
import { useDashboardData } from "@/features/home/use-dashboard-data";
import { useSession } from "@/hooks/use-session";
import { AppShell } from "@/layouts/app-shell";
import type { Activity } from "@/types";

import { DashboardSections } from "../home/dashboard-sections";
import { ActivityEditModal } from "./activity-edit-modal";

function ActivityEditPage() {
  const navigate = useNavigate();
  const { activityId } = useParams();
  const { token, user } = useSession();
  const dashboardData = useDashboardData(token);
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loadingActivity, setLoadingActivity] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const backgroundIsLoading = dashboardData.loading && !dashboardData.error;
  const editModalIsLoading = loadingActivity || backgroundIsLoading;

  useEffect(() => {
    if (!token || !activityId || !user) {
      return;
    }

    let active = true;

    const loadActivity = async () => {
      setLoadingActivity(true);
      setError(null);

      try {
        const loadedActivity = await getActivity(token, activityId);

        if (!active) {
          return;
        }

        if (loadedActivity.creator.id !== user.id) {
          setActivity(null);
          setError("Apenas o organizador pode editar esta atividade.");
          return;
        }

        if (active) {
          setActivity(loadedActivity);
        }
      } catch (loadError) {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Não foi possível carregar a atividade.",
          );
        }
      } finally {
        if (active) {
          setLoadingActivity(false);
        }
      }
    };

    void loadActivity();

    return () => {
      active = false;
    };
  }, [activityId, token, user]);

  return (
    <AppShell>
      {dashboardData.error ? <Alert variant="error" description={dashboardData.error} /> : null}

      {dashboardData.loading ? (
        <DashboardSkeleton />
      ) : (
        <DashboardSections
          recommendedActivities={dashboardData.recommendedActivities}
          activityTypes={dashboardData.activityTypes}
          sections={dashboardData.sections}
        />
      )}

      {editModalIsLoading ? (
        <Modal
          open
          className="w-full max-w-[min(420px,calc(100vw-1.5rem))] rounded-[8px] p-8"
          overlayClassName="backdrop-blur-[8px] supports-[backdrop-filter]:bg-[rgb(23_23_23_/_0.28)]"
        >
          <div className="text-body text-[var(--color-text)]">Carregando atividade...</div>
        </Modal>
      ) : null}

      {!editModalIsLoading && error ? (
        <Modal
          open
          className="w-full max-w-[min(420px,calc(100vw-1.5rem))] rounded-[8px] p-8"
          overlayClassName="backdrop-blur-[8px] supports-[backdrop-filter]:bg-[rgb(23_23_23_/_0.28)]"
        >
          <div className="space-y-5">
            <Alert variant="error" description={error} />
            <Button onClick={() => navigate("/home")}>Voltar</Button>
          </div>
        </Modal>
      ) : null}

      {!editModalIsLoading && activity && token ? (
        <ActivityEditModal
          activity={activity}
          token={token}
          onClose={() => navigate("/home")}
          onSaved={(updatedActivity) => {
            navigate(`/atividades/detalhes/${updatedActivity.id}`, { replace: true });
          }}
          onCanceled={() => {
            navigate("/home", { replace: true });
          }}
        />
      ) : null}
    </AppShell>
  );
}

export { ActivityEditPage };
