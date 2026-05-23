import { useNavigate } from "react-router";

import { CategoryRow } from "@/components/ui/category-row";
import { EmptyState } from "@/components/ui/empty-state";
import { PageSection } from "@/components/ui/page-section";
import type { Activity, ActivityType } from "@/types";
import { formatDateTime } from "@/utils/formatters";
import { ACTIVITY_TYPE_IMAGE } from "@/utils/image-placeholders";

import { ActivityGridSection } from "../activities/activity-grid-section";
import { ActivityListItem } from "../activities/activity-list-item";

type DashboardSectionsProps = {
  recommendedActivities: Activity[];
  activityTypes: ActivityType[];
  sections: Array<{
    typeId: string;
    title: string;
    activities: Activity[];
  }>;
};

function DashboardSections({
  recommendedActivities,
  activityTypes,
  sections,
}: DashboardSectionsProps) {
  const navigate = useNavigate();

  return (
    <div className="min-w-0 max-w-full space-y-10">
      <ActivityGridSection
        title="RECOMENDADO PARA VOCE"
        items={recommendedActivities.map((activity) => ({
          id: activity.id,
          title: activity.title,
          image: activity.image,
          date: formatDateTime(activity.scheduledDate),
          participants: activity.participantCount,
          privateActivity: activity.isPrivate,
          onClick: () => navigate(`/atividades/detalhes/${activity.id}`),
        }))}
        emptyTitle="Nada recomendado por enquanto"
        emptyDescription="Crie atividades ou ajuste suas preferências para receber sugestões aqui."
      />

      <PageSection title="TIPOS DE ATIVIDADE">
        {activityTypes.length === 0 ? (
          <EmptyState
            title="Nenhum tipo disponível"
            description="Os tipos de atividade vão aparecer aqui assim que estiverem cadastrados."
          />
        ) : (
          <CategoryRow
            items={activityTypes.map((type) => ({
              id: type.id,
              title: type.name,
              image: ACTIVITY_TYPE_IMAGE,
              onClick: () => navigate(`/atividades?typeId=${type.id}`),
            }))}
          />
        )}
      </PageSection>

      {sections.length === 0 ? (
        <EmptyState
          title="Nenhuma atividade publicada ainda"
          description="Assim que novas atividades forem criadas, elas vão aparecer organizadas por tipo aqui."
        />
      ) : (
        <section className="grid min-w-0 gap-10 lg:grid-cols-2">
          {sections.map((section) => (
            <PageSection
              key={section.typeId}
              title={section.title}
              actionLabel="Ver mais"
              onActionClick={() => navigate(`/atividades?typeId=${section.typeId}`)}
            >
              <div className="grid min-w-0 gap-6 md:grid-cols-2">
                {section.activities.slice(0, 6).map((activity) => (
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
            </PageSection>
          ))}
        </section>
      )}
    </div>
  );
}

export { DashboardSections };
