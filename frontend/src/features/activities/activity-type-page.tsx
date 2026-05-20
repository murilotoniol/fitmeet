import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";

import { getActivities, getActivityTypes } from "@/api/activities";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CategoryRow } from "@/components/ui/category-row";
import { EmptyState } from "@/components/ui/empty-state";
import { PageSection } from "@/components/ui/page-section";
import { useSession } from "@/hooks/use-session";
import { AppShell } from "@/layouts/app-shell";
import type { Activity, ActivityType } from "@/types";
import { formatDateTime } from "@/utils/formatters";

import { ActivityGridSection } from "./activity-grid-section";
import { ActivityListItem } from "./activity-list-item";

const INITIAL_VISIBLE_ACTIVITIES = 16;
const LOAD_MORE_STEP = 8;

function ActivityTypePage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { token } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activityTypes, setActivityTypes] = useState<ActivityType[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [nextPage, setNextPage] = useState<number | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  const selectedTypeId = searchParams.get("typeId");

  useEffect(() => {
    if (!token) {
      return;
    }

    let active = true;

    const loadActivities = async () => {
      setLoading(true);
      setError(null);

      try {
        const loadedTypes = await getActivityTypes(token);
        const resolvedTypeId = selectedTypeId ?? loadedTypes[0]?.id;
        const firstPage = resolvedTypeId
          ? await getActivities(token, {
              page: 1,
              pageSize: LOAD_MORE_STEP,
              typeId: resolvedTypeId,
            })
          : null;
        const secondPage = firstPage?.next
          ? await getActivities(token, {
              page: firstPage.next,
              pageSize: LOAD_MORE_STEP,
              typeId: resolvedTypeId,
            })
          : null;

        if (!active) {
          return;
        }

        setActivityTypes(loadedTypes);
        setActivities([...(firstPage?.activities ?? []), ...(secondPage?.activities ?? [])]);
        setNextPage(secondPage?.next ?? null);

        if (!selectedTypeId && resolvedTypeId) {
          setSearchParams({ typeId: resolvedTypeId }, { replace: true });
        }
      } catch (fetchError) {
        if (!active) {
          return;
        }

        const message =
          fetchError instanceof Error ? fetchError.message : "Não foi possível carregar as atividades.";
        setError(message);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadActivities();

    return () => {
      active = false;
    };
  }, [selectedTypeId, setSearchParams, token]);

  const selectedType = useMemo(
    () => activityTypes.find((type) => type.id === selectedTypeId) ?? activityTypes[0] ?? null,
    [activityTypes, selectedTypeId],
  );

  const gridActivities = activities.slice(0, 8);
  const listActivities = activities.slice(8);
  const canLoadMore = nextPage !== null && activities.length >= INITIAL_VISIBLE_ACTIVITIES;
  const otherTypes = selectedType
    ? activityTypes.filter((type) => type.id !== selectedType.id)
    : activityTypes;

  async function handleLoadMore() {
    if (!token || !selectedType || !nextPage) {
      return;
    }

    setLoadingMore(true);
    setError(null);

    try {
      const loadedPage = await getActivities(token, {
        page: nextPage,
        pageSize: LOAD_MORE_STEP,
        typeId: selectedType.id,
      });

      setActivities((current) => [...current, ...loadedPage.activities]);
      setNextPage(loadedPage.next);
    } catch (fetchError) {
      const message =
        fetchError instanceof Error
          ? fetchError.message
          : "Não foi possível carregar mais atividades.";
      setError(message);
    } finally {
      setLoadingMore(false);
    }
  }

  return (
    <AppShell>
      {error ? <Alert variant="error" description={error} /> : null}

      {loading ? (
        <div className="py-16 text-body text-[var(--color-text)]">Carregando atividades...</div>
      ) : selectedType ? (
        <div className="min-w-0 max-w-full space-y-14">
          <ActivityGridSection
            title={`POPULAR EM ${selectedType.name.toUpperCase()}`}
            items={gridActivities.map((activity) => ({
              id: activity.id,
              title: activity.title,
              image: activity.image,
              date: formatDateTime(activity.scheduledDate),
              participants: activity.participantCount,
              privateActivity: activity.isPrivate,
              onClick: () => navigate(`/atividades/detalhes/${activity.id}`),
            }))}
            emptyTitle={`Nada popular em ${selectedType.name.toLowerCase()} ainda`}
            emptyDescription="Quando novas atividades desse tipo forem publicadas, elas vao aparecer aqui."
          />

          <PageSection title="OUTROS TIPOS DE ATIVIDADE">
            {otherTypes.length === 0 ? (
              <EmptyState
                title="Nenhum outro tipo disponível"
                description="Assim que novos tipos forem cadastrados, eles aparecem aqui para navegação."
                className="min-h-[140px]"
              />
            ) : (
              <CategoryRow
                items={otherTypes.map((type) => ({
                  id: type.id,
                  title: type.name,
                  image: type.image,
                  onClick: () => {
                    setSearchParams({ typeId: type.id });
                  },
                }))}
              />
            )}
          </PageSection>

          {listActivities.length > 0 || canLoadMore ? (
            <PageSection title={`POPULAR EM ${selectedType.name.toUpperCase()}`}>
              <div className="grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-4">
                {listActivities.map((activity) => (
                  <ActivityListItem
                    key={activity.id}
                    title={activity.title}
                    image={activity.image}
                    date={formatDateTime(activity.scheduledDate)}
                    participants={activity.participantCount}
                    privateActivity={activity.isPrivate}
                    onClick={() => navigate(`/atividades/detalhes/${activity.id}`)}
                  />
                ))}
              </div>

              {canLoadMore ? (
                <div className="flex justify-center pt-6">
                  <Button size="sm" onClick={handleLoadMore} disabled={loadingMore}>
                    {loadingMore ? "Carregando..." : "Ver mais"}
                  </Button>
                </div>
              ) : null}
            </PageSection>
          ) : null}
        </div>
      ) : (
        <div className="py-16 text-body text-[var(--color-text)]">
          Nenhum tipo de atividade foi encontrado.
        </div>
      )}
    </AppShell>
  );
}

export { ActivityTypePage };
