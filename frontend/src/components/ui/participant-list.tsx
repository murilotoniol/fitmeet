import { Check, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { AVATAR_PLACEHOLDER } from "@/utils/image-placeholders";

import { EmptyState } from "./empty-state";
import { ImageWithFallback } from "./image-with-fallback";

type ParticipantItem = {
  id: string | number;
  name: string;
  role?: string;
  image: string;
  showApproveActions?: boolean;
  onApprove?: () => void;
  onReject?: () => void;
};

type ParticipantListProps = {
  title?: string;
  items: ParticipantItem[];
  className?: string;
};

function ParticipantList({
  title = "PARTICIPANTES",
  items,
  className,
}: ParticipantListProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <h3 className="text-subtitle text-[var(--color-title)]">{title}</h3>

      {items.length === 0 ? (
        <EmptyState
          title="Nenhum participante por enquanto"
          description="Quando alguem entrar na atividade, a lista vai aparecer aqui."
          className="min-h-[160px]"
        />
      ) : (
        <div className="max-h-[300px] space-y-4 overflow-y-auto pr-2">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <ImageWithFallback
                src={item.image}
                fallbackSrc={AVATAR_PLACEHOLDER}
                alt={item.name}
                className="h-14 w-14 rounded-full border-[3px] border-[var(--color-primary-500)] object-cover"
              />

              <div className="space-y-0.5">
                <div className="text-body font-semibold text-[var(--color-title)]">
                  {item.name}
                </div>
                {item.role ? (
                  <div className="text-sm text-[var(--color-text)]">{item.role}</div>
                ) : null}
              </div>
            </div>

            {item.showApproveActions ? (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={item.onApprove}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-primary-500)] text-white"
                  aria-label="Aprovar"
                >
                  <Check size={18} />
                </button>

                <button
                  type="button"
                  onClick={item.onReject}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-danger)] text-white"
                  aria-label="Recusar"
                >
                  <X size={18} />
                </button>
              </div>
            ) : null}
          </div>
        ))}
        </div>
      )}
    </div>
  );
}

export { ParticipantList };
