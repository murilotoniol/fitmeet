import { useEffect, useMemo, useState } from "react";
import { Calendar, X } from "lucide-react";

import { deleteActivity, getActivityTypes, updateActivity } from "@/api/activities";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CategoryCard } from "@/components/ui/category-card";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { FormSection } from "@/components/ui/form-section";
import { ImageUploadBox } from "@/components/ui/image-upload-box";
import { Input, Textarea } from "@/components/ui/input";
import { MapPreview } from "@/components/ui/map-preview";
import { Modal } from "@/components/ui/modal";
import { SegmentedToggle } from "@/components/ui/segmented-toggle";
import type { Activity, ActivityType } from "@/types";
import { ACTIVITY_TYPE_IMAGE } from "@/utils/image-placeholders";

type ActivityEditModalProps = {
  activity: Activity;
  token: string;
  onClose: () => void;
  onSaved: (activity: Activity) => void;
  onCanceled: () => void;
};

function normalizeCoordinate(value: string) {
  return Number(value.replace(",", "."));
}

function isValidLatitude(value: number) {
  return Number.isFinite(value) && value >= -90 && value <= 90;
}

function isValidLongitude(value: number) {
  return Number.isFinite(value) && value >= -180 && value <= 180;
}

function isFutureDate(value: string) {
  const parsedDate = new Date(value);
  return !Number.isNaN(parsedDate.getTime()) && parsedDate.getTime() > Date.now();
}

function toDateTimeInputValue(value: string) {
  return value.slice(0, 16);
}

function ActivityEditModal({ activity, token, onClose, onSaved, onCanceled }: ActivityEditModalProps) {
  const [activityTypes, setActivityTypes] = useState<ActivityType[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(true);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [title, setTitle] = useState(activity.title);
  const [description, setDescription] = useState(activity.description);
  const [scheduledDate, setScheduledDate] = useState(toDateTimeInputValue(activity.scheduledDate));
  const [selectedTypeId, setSelectedTypeId] = useState("");
  const [requiresApproval, setRequiresApproval] = useState(activity.isPrivate ? "sim" : "nao");
  const [latitude, setLatitude] = useState(String(activity.address.latitude));
  const [longitude, setLongitude] = useState(String(activity.address.longitude));

  useEffect(() => {
    let active = true;

    const loadTypes = async () => {
      setLoadingTypes(true);

      try {
        const loadedTypes = await getActivityTypes(token);

        if (!active) {
          return;
        }

        setActivityTypes(loadedTypes);
        setSelectedTypeId(
          loadedTypes.find((type) => type.name === activity.type)?.id ?? loadedTypes[0]?.id ?? "",
        );
      } catch (fetchError) {
        if (active) {
          const message =
            fetchError instanceof Error
              ? fetchError.message
              : "Não foi possível carregar os tipos de atividade.";
          setSubmitError(message);
        }
      } finally {
        if (active) {
          setLoadingTypes(false);
        }
      }
    };

    void loadTypes();

    return () => {
      active = false;
    };
  }, [activity.type, token]);

  const imagePreviewUrl = useMemo(() => (image ? URL.createObjectURL(image) : activity.image), [
    activity.image,
    image,
  ]);
  const parsedLatitude = useMemo(() => normalizeCoordinate(latitude), [latitude]);
  const parsedLongitude = useMemo(() => normalizeCoordinate(longitude), [longitude]);
  const coordinatesAreValid =
    isValidLatitude(parsedLatitude) && isValidLongitude(parsedLongitude);

  useEffect(() => {
    return () => {
      if (image && imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [image, imagePreviewUrl]);

  async function handleSubmit() {
    if (!title.trim() || !description.trim()) {
      setSubmitError("Preencha titulo e descricao da atividade.");
      return;
    }

    if (!selectedTypeId) {
      setSubmitError("Selecione um tipo de atividade.");
      return;
    }

    if (!scheduledDate || !isFutureDate(scheduledDate)) {
      setSubmitError("Escolha uma data futura para a atividade.");
      return;
    }

    if (!coordinatesAreValid) {
      setSubmitError("Selecione um ponto válido no mapa.");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const updatedActivity = await updateActivity(token, activity.id, {
        title: title.trim(),
        description: description.trim(),
        typeId: selectedTypeId,
        image: image ?? undefined,
        scheduledDate,
        isPrivate: requiresApproval === "sim",
        address: {
          latitude: parsedLatitude,
          longitude: parsedLongitude,
        },
      });

      onSaved(updatedActivity);
    } catch (updateError) {
      const message =
        updateError instanceof Error
          ? updateError.message
          : "Não foi possível editar a atividade.";
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCancelActivity() {
    setCanceling(true);
    setSubmitError(null);

    try {
      await deleteActivity(token, activity.id);
      setCancelDialogOpen(false);
      onCanceled();
    } catch (cancelError) {
      const message =
        cancelError instanceof Error
          ? cancelError.message
          : "Não foi possível cancelar a atividade.";
      setSubmitError(message);
    } finally {
      setCanceling(false);
    }
  }

  return (
    <>
    <Modal
      open
      className="flex h-auto max-h-[calc(100dvh-2rem)] w-full min-w-0 max-w-[min(784px,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-[8px] p-6 shadow-[0_24px_80px_rgb(23_23_23_/_0.24)] sm:p-12 lg:h-[790px]"
      overlayClassName="backdrop-blur-[8px] supports-[backdrop-filter]:bg-[rgb(23_23_23_/_0.28)]"
    >
      <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-12">
        <div className="flex h-9 shrink-0 items-center justify-between gap-3 sm:gap-4 lg:w-[688px]">
          <h1 className="min-w-0 flex-1 text-2xl uppercase leading-tight tracking-[0.02em] text-[var(--color-title)] sm:text-title sm:leading-[var(--text-title-line)]">
            EDITAR ATIVIDADE
          </h1>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[var(--color-text)] transition-colors hover:bg-[#fafafa] hover:text-[var(--color-title)]"
            aria-label="Fechar modal"
          >
            <X size={26} strokeWidth={1.75} />
          </button>
        </div>

        <div className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
          {submitError ? (
            <div className="mb-5">
              <Alert variant="error" description={submitError} />
            </div>
          ) : null}

          <div className="flex min-h-full min-w-0 flex-col gap-9 lg:w-[688px]">
          <div className="grid min-w-0 gap-8 lg:grid-cols-[320px_320px] lg:gap-10">
          <div className="min-w-0 space-y-4">
            <ImageUploadBox
              label="Imagem"
              previewUrl={imagePreviewUrl}
              onChange={setImage}
              boxClassName="h-[148px] min-h-0"
            />

            <Input
              label="Titulo"
              required
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />

            <Textarea
              label="Descrição"
              required
              className="min-h-[110px] rounded-[8px] px-5 py-4"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />

            <Input
              label="Data"
              required
              type="datetime-local"
              value={scheduledDate}
              onChange={(event) => setScheduledDate(event.target.value)}
              trailingIcon={<Calendar size={20} strokeWidth={1.5} aria-hidden />}
            />
          </div>

          <div className="min-w-0 space-y-6">
            <FormSection title="Tipo da atividade *" className="space-y-1.5">
              {loadingTypes ? (
                <div className="text-sm text-[var(--color-text)]">Carregando tipos...</div>
              ) : activityTypes.length === 0 ? (
                <EmptyState
                  title="Nenhum tipo encontrado"
                  description="Cadastre tipos de atividade no backend para editar a atividade."
                  className="min-h-[170px]"
                />
              ) : (
                <div className="flex h-[122px] max-w-full min-w-0 gap-2 overflow-x-auto overflow-y-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {activityTypes.map((type) => (
                    <CategoryCard
                      key={type.id}
                      title={type.name}
                      image={ACTIVITY_TYPE_IMAGE}
                      selected={selectedTypeId === type.id}
                      onClick={() => setSelectedTypeId(type.id)}
                    />
                  ))}
                </div>
              )}
              </FormSection>

            <MapPreview
              label="Ponto de encontro"
              required
              heightClassName="h-[196px]"
              latitude={isValidLatitude(parsedLatitude) ? parsedLatitude : undefined}
              longitude={isValidLongitude(parsedLongitude) ? parsedLongitude : undefined}
              interactive
              showInteractiveHint={false}
              onChange={({ latitude: nextLatitude, longitude: nextLongitude }) => {
                setLatitude(String(nextLatitude));
                setLongitude(String(nextLongitude));
              }}
            />

            <FormSection title="Requer aprovação para participar? *">
              <SegmentedToggle
                value={requiresApproval}
                onChange={setRequiresApproval}
                options={[
                  { value: "sim", label: "Sim" },
                  { value: "nao", label: "Não" },
                ]}
              />
            </FormSection>

          </div>
          </div>

          <div className="mt-auto grid min-w-0 gap-2 sm:ml-auto sm:w-[430px] sm:grid-cols-2">
            <Button
              className="h-12 rounded-[4px] border-[#E7000B] bg-white px-6 text-[#E7000B] shadow-none hover:border-[#E7000B] hover:bg-white hover:text-[#E7000B]"
              variant="outline"
              onClick={() => setCancelDialogOpen(true)}
              disabled={submitting || canceling}
            >
              Cancelar
            </Button>
            <Button
              className="h-12 rounded-[4px] px-6 text-white"
              onClick={handleSubmit}
              disabled={submitting || loadingTypes}
            >
              {submitting ? "Confirmando..." : "Confirmar"}
            </Button>
          </div>
        </div>
        </div>
      </div>
    </Modal>
    <ConfirmationDialog
      open={cancelDialogOpen}
      title="TEM CERTEZA QUE DESEJA CANCELAR ESTA ATIVIDADE?"
      description="Ao cancelar, a atividade será removida das listagens e os participantes não poderão mais interagir com ela."
      confirmLabel="Cancelar atividade"
      destructive
      loading={canceling}
      onCancel={() => setCancelDialogOpen(false)}
      onConfirm={handleCancelActivity}
    />
    </>
  );
}

export { ActivityEditModal };
