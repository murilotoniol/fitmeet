import { PageSection } from "@/components/ui/page-section";
import { EmptyState } from "@/components/ui/empty-state";

import { ActivityCard } from "./activity-card";

type ActivityGridItem = {
  id: string | number;
  title: string;
  image: string;
  date: string;
  participants: number;
  privateActivity?: boolean;
  onClick?: () => void;
};

type ActivityGridSectionProps = {
  title: string;
  items: ActivityGridItem[];
  actionLabel?: string;
  emptyTitle?: string;
  emptyDescription?: string;
};

function ActivityGridSection({
  title,
  items,
  actionLabel,
  emptyTitle = "Nenhuma atividade encontrada",
  emptyDescription = "Assim que novas atividades aparecerem, elas serão exibidas aqui.",
}: ActivityGridSectionProps) {
  return (
    <PageSection title={title} actionLabel={actionLabel}>
      {items.length === 0 ? (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      ) : (
        <div className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <ActivityCard
              key={item.id}
              title={item.title}
              image={item.image}
              date={item.date}
              participants={item.participants}
              privateActivity={item.privateActivity}
              onClick={item.onClick}
            />
          ))}
        </div>
      )}
    </PageSection>
  );
}

export { ActivityGridSection };
