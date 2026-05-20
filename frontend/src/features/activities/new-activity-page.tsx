import { Calendar, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";

import { createActivity, getActivityTypes } from "@/api/activities";
import { DashboardSections } from "@/features/home/dashboard-sections";
import { useDashboardData } from "@/features/home/use-dashboard-data";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CategoryCard } from "@/components/ui/category-card";
import { EmptyState } from "@/components/ui/empty-state";
import { FormSection } from "@/components/ui/form-section";
import { ImageUploadBox } from "@/components/ui/image-upload-box";
import { Input, Textarea } from "@/components/ui/input";
import { MapPreview } from "@/components/ui/map-preview";
import { Modal } from "@/components/ui/modal";
import { SegmentedToggle } from "@/components/ui/segmented-toggle";
import { useSession } from "@/hooks/use-session";
import { AppShell } from "@/layouts/app-shell";
import type { ActivityType } from "@/types";

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

function NewActivityPage() {
  const navigate = useNavigate();
  const { token } = useSession();
  const dashboardData = useDashboardData(token);
  const [activityTypes, setActivityTypes] = useState<ActivityType[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(true);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [selectedTypeId, setSelectedTypeId] = useState("");
  const [requiresApproval, setRequiresApproval] = useState("nao");
  const [latitude, setLatitude] = useState("-23.588197");
  const [longitude, setLongitude] = useState("-46.657634");

  useEffect(() => {
    if (!token) {
      return;
    }

    let active = true;

    const loadTypes = async () => {
      setLoadingTypes(true);

      try {
        const loadedTypes = await getActivityTypes(token);

        if (!active) {
          return;
        }

        setActivityTypes(loadedTypes);
        setSelectedTypeId((current) => current || loadedTypes[0]?.id || "");
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
  }, [token]);

  const imagePreviewUrl = useMemo(() => (image ? URL.createObjectURL(image) : null), [image]);
  const parsedLatitude = useMemo(() => normalizeCoordinate(latitude), [latitude]);
  const parsedLongitude = useMemo(() => normalizeCoordinate(longitude), [longitude]);
  const coordinatesAreValid =
    isValidLatitude(parsedLatitude) && isValidLongitude(parsedLongitude);

  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  async function handleSubmit() {
    if (!token) {
      return;
    }

    if (!image) {
      setSubmitError("Selecione uma imagem para a atividade.");
      return;
    }

    if (!title.trim() || !description.trim()) {
      setSubmitError("Preencha titulo e descricao da atividade.");
      return;
    }

    if (!selectedTypeId) {
      setSubmitError("Selecione um tipo de atividade.");
      return;
    }

    if (!scheduledDate) {
      setSubmitError("Informe a data da atividade.");
      return;
    }

    if (!isFutureDate(scheduledDate)) {
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
      const createdActivity = await createActivity(token, {
        title: title.trim(),
        description: description.trim(),
        typeId: selectedTypeId,
        image,
        scheduledDate,
        isPrivate: requiresApproval === "sim",
        address: {
          latitude: parsedLatitude,
          longitude: parsedLongitude,
        },
      });

      navigate(`/atividades/detalhes/${createdActivity.id}`, { replace: true });
    } catch (createError) {
      const message =
        createError instanceof Error ? createError.message : "Não foi possível criar a atividade.";
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppShell>
      {dashboardData.loading ? (
        <div className="py-16 text-body text-[var(--color-text)]">Carregando atividades...</div>
      ) : (
        <DashboardSections
          recommendedActivities={dashboardData.recommendedActivities}
          activityTypes={dashboardData.activityTypes}
          sections={dashboardData.sections}
        />
      )}

      <Modal
        open
        className="flex h-auto max-h-[calc(100dvh-2rem)] w-full min-w-0 max-w-[min(784px,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-[8px] p-6 shadow-[0_24px_80px_rgb(23_23_23_/_0.24)] sm:p-12 lg:h-[770px]"
        overlayClassName="backdrop-blur-[8px] supports-[backdrop-filter]:bg-[rgb(23_23_23_/_0.28)]"
      >
        <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-12">
          <div className="flex h-9 w-full shrink-0 items-center justify-between gap-3 sm:gap-4 lg:w-[688px]">
            <h1 className="min-w-0 flex-1 text-2xl uppercase leading-tight tracking-[0.02em] text-[var(--color-title)] sm:text-title sm:leading-[var(--text-title-line)]">
              NOVA ATIVIDADE
            </h1>
            <button
              type="button"
              onClick={() => navigate("/home")}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[var(--color-text)] transition-colors hover:bg-[#fafafa] hover:text-[var(--color-title)]"
              aria-label="Fechar modal"
            >
              <X size={24} strokeWidth={1.75} />
            </button>
          </div>

          <div className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden lg:h-[590px] lg:w-[688px] lg:flex-none">
            {submitError ? (
              <div className="mb-5">
                <Alert variant="error" description={submitError} />
              </div>
            ) : null}

            <div className="grid min-w-0 gap-8 lg:h-[590px] lg:w-[688px] lg:grid-cols-[320px_320px] lg:gap-10">
              <div className="flex min-w-0 flex-col gap-4">
                <ImageUploadBox
                  label="Imagem"
                  required
                  previewUrl={imagePreviewUrl}
                  onChange={setImage}
                  boxClassName="h-32 min-h-0"
                />

                <Input
                  label="Titulo"
                  required
                  placeholder="Ex.: Aula de Ioga"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                />

                <Textarea
                  label="Descrição"
                  required
                  placeholder="Como será a atividade? Quais as regras? O que é necessário para participar?"
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

              <div className="flex min-w-0 flex-col gap-6 lg:pt-0">
                <FormSection
                  title="Tipo da atividade *"
                  className="h-[148px] w-full max-w-[320px] space-y-1.5"
                >
                  {loadingTypes ? (
                    <div className="text-sm text-[var(--color-text)]">Carregando tipos...</div>
                  ) : activityTypes.length === 0 ? (
                    <EmptyState
                      title="Nenhum tipo encontrado"
                      description="Cadastre tipos de atividade no backend para conseguir criar uma nova atividade."
                      className="min-h-[140px] py-6"
                    />
                  ) : (
                    <div className="flex h-[122px] w-full min-w-0 gap-2 overflow-x-auto overflow-y-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                      {activityTypes.map((type) => (
                        <CategoryCard
                          key={type.id}
                          title={type.name}
                          image={type.image}
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
                  heightClassName="h-[208px]"
                  latitude={isValidLatitude(parsedLatitude) ? parsedLatitude : undefined}
                  longitude={isValidLongitude(parsedLongitude) ? parsedLongitude : undefined}
                  interactive
                  showInteractiveHint={false}
                  onChange={({ latitude: nextLatitude, longitude: nextLongitude }) => {
                    setLatitude(String(nextLatitude));
                    setLongitude(String(nextLongitude));
                  }}
                />

                <FormSection title="Requer aprovação para participar? *" className="space-y-3">
                  <SegmentedToggle
                    value={requiresApproval}
                    onChange={setRequiresApproval}
                    options={[
                      { value: "sim", label: "Sim" },
                      { value: "nao", label: "Não" },
                    ]}
                  />
                </FormSection>

                <Button
                  type="button"
                  className="ml-auto mt-1 h-12 w-full rounded-[4px] px-6 text-[17px] font-semibold text-white shadow-none sm:w-[224px]"
                  onClick={handleSubmit}
                  disabled={submitting || loadingTypes || activityTypes.length === 0}
                >
                  {submitting ? "Criando..." : "Criar"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </AppShell>
  );
}

export { NewActivityPage };
