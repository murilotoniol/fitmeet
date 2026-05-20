import { useMemo, useState } from "react";
import { useNavigate } from "react-router";

import { definePreferences } from "@/api/user";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CategoryCard } from "@/components/ui/category-card";
import { Modal } from "@/components/ui/modal";
import { useSession } from "@/hooks/use-session";
import { AppShell } from "@/layouts/app-shell";
import { clearPreferencesSkipped, markPreferencesSkipped } from "@/utils/preferences";

import { DashboardSections } from "@/features/home/dashboard-sections";
import { useDashboardData } from "@/features/home/use-dashboard-data";

function PreferencesPage() {
  const navigate = useNavigate();
  const { token } = useSession();
  const {
    loading,
    error,
    activityTypes,
    preferences,
    recommendedActivities,
    sections,
  } = useDashboardData(token);
  const [selectedTypeIds, setSelectedTypeIds] = useState<string[] | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const resolvedSelectedTypeIds = useMemo(
    () => selectedTypeIds ?? preferences.map((preference) => preference.typeId),
    [preferences, selectedTypeIds],
  );

  function toggleType(typeId: string) {
    setSelectedTypeIds((current) =>
      (current ?? preferences.map((preference) => preference.typeId)).includes(typeId)
        ? (current ?? preferences.map((preference) => preference.typeId)).filter(
            (currentTypeId) => currentTypeId !== typeId,
          )
        : [...(current ?? preferences.map((preference) => preference.typeId)), typeId],
    );
  }

  async function handleSubmit() {
    if (!token) {
      return;
    }

    if (resolvedSelectedTypeIds.length === 0) {
      setSubmitError("Selecione ao menos uma atividade ou clique em pular.");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      await definePreferences(token, resolvedSelectedTypeIds);
      clearPreferencesSkipped();
      navigate("/home", { replace: true });
    } catch (submitPreferenceError) {
      const message =
        submitPreferenceError instanceof Error
          ? submitPreferenceError.message
          : "Não foi possível salvar suas preferências.";
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
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

      <Modal
        open
        className="w-full min-w-0 max-w-[min(528px,calc(100vw-1.5rem))] rounded-[8px] p-6 shadow-[0_24px_64px_rgb(23_23_23_/_0.24)] sm:p-12"
      >
        <div className="min-w-0 space-y-12">
          <div className="space-y-3">
            <h1 className="break-words text-left text-2xl text-[var(--color-title)] sm:text-title">
              SELECIONE AS SUAS ATIVIDADES PREFERIDAS
            </h1>
            {submitError ? <Alert variant="error" description={submitError} /> : null}
          </div>

          <div className="grid min-w-0 grid-cols-2 justify-items-center gap-6 sm:grid-cols-4">
            {activityTypes.slice(0, 8).map((type) => (
              <CategoryCard
                key={type.id}
                title={type.name}
                image={type.image}
                selected={resolvedSelectedTypeIds.includes(type.id)}
                onClick={() => toggleType(type.id)}
              />
            ))}
          </div>

          <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2">
            <Button className="h-12 rounded-[4px] px-3" onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Salvando..." : "Confirmar"}
            </Button>
            <Button
              variant="outline"
              className="h-12 rounded-[4px] border-[var(--color-primary-600)] px-3 text-[var(--color-primary-600)]"
              onClick={() => {
                markPreferencesSkipped();
                navigate("/home", { replace: true });
              }}
            >
              Pular
            </Button>
          </div>
        </div>
      </Modal>
    </AppShell>
  );
}

export { PreferencesPage };
