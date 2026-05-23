import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Ban, CalendarX, Check, Flag, Pencil, UserCheck } from "lucide-react";

import {
  approveParticipant,
  checkInActivity,
  concludeActivity,
  deleteActivity,
  getActivity,
  getParticipants,
  subscribeToActivity,
  unsubscribeFromActivity,
} from "@/api/activities";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { DashboardSkeleton } from "@/components/ui/dashboard-skeleton";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { MapPreview } from "@/components/ui/map-preview";
import { Modal } from "@/components/ui/modal";
import { ParticipantList } from "@/components/ui/participant-list";
import { DashboardSections } from "@/features/home/dashboard-sections";
import { useDashboardData } from "@/features/home/use-dashboard-data";
import { useSession } from "@/hooks/use-session";
import { AppShell } from "@/layouts/app-shell";
import type { Activity, Participant, ParticipationStatus } from "@/types";
import { formatDateTime } from "@/utils/formatters";

import { ActivityDetailsPanel } from "./activity-details-panel";

const CHECK_IN_WINDOW_MS = 30 * 60 * 1000;

function isCheckInWindowOpen(activity: Activity) {
  const scheduledTimestamp = new Date(activity.scheduledDate).getTime();

  if (Number.isNaN(scheduledTimestamp)) {
    return false;
  }

  return Date.now() >= scheduledTimestamp - CHECK_IN_WINDOW_MS;
}

function ActivityDetailsPage() {
  const navigate = useNavigate();
  const { activityId } = useParams();
  const { token, user } = useSession();
  const dashboardData = useDashboardData(token);
  const [loading, setLoading] = useState(true);
  const [activity, setActivity] = useState<Activity | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [checkInCode, setCheckInCode] = useState("");
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [activityCanceled, setActivityCanceled] = useState(false);

  useEffect(() => {
    if (!token || !activityId || !user) {
      return;
    }

    let active = true;

    const loadActivityData = async () => {
      setLoading(true);
      setError(null);

      try {
        const currentActivity = await getActivity(token, activityId);

        if (!active) {
          return;
        }

        let loadedParticipants: Participant[] = [];

        try {
          loadedParticipants = await getParticipants(token, activityId);
        } catch (participantsError) {
          if (currentActivity.creator.id === user.id) {
            throw participantsError;
          }
        }

        setActivity(currentActivity);
        setParticipants(loadedParticipants);
      } catch (loadError) {
        if (!active) {
          return;
        }

        const message =
          loadError instanceof Error
            ? loadError.message
            : "Não foi possível carregar os detalhes da atividade.";
        setError(message);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadActivityData();

    return () => {
      active = false;
    };
  }, [activityId, token, user]);

  const isCreator = Boolean(activity && user && activity.creator.id === user.id);
  const status: ParticipationStatus | null = activity?.userSubscriptionStatus ?? null;
  const displayedCheckInCode =
    status === "CHECKED_IN" ? activity?.confirmationCode ?? checkInCode : checkInCode;

  async function reloadActivityData() {
    if (!token || !activityId || !user) {
      return;
    }

    const currentActivity = await getActivity(token, activityId);

    let loadedParticipants: Participant[] = [];

    try {
      loadedParticipants = await getParticipants(token, activityId);
    } catch (participantsError) {
      if (currentActivity.creator.id === user.id) {
        throw participantsError;
      }
    }

    setActivity(currentActivity);
    setParticipants(loadedParticipants);
  }

  async function runAction(callback: () => Promise<unknown>) {
    setActionLoading(true);
    setError(null);

    try {
      await callback();
      await reloadActivityData();
    } catch (actionError) {
      const message =
        actionError instanceof Error ? actionError.message : "Não foi possível concluir a ação.";
      setError(message);
    } finally {
      setActionLoading(false);
    }
  }

  const actionConfig = !activity
    ? {
        label: "Carregando...",
        disabled: true,
        variant: "primary" as const,
        onClick: undefined,
      }
    : activity.deletedAt
      ? {
          label: "Atividade cancelada",
          disabled: true,
          variant: "danger" as const,
          icon: <CalendarX size={28} strokeWidth={1.75} aria-hidden />,
          className:
            "h-12 w-[224px] max-w-full gap-1.5 rounded-[4px] bg-[#E7000B] px-3 text-white hover:bg-[#E7000B]",
          onClick: undefined,
        }
    : activity.completedAt
      ? {
          label: "Atividade encerrada",
          disabled: true,
          variant: "outline" as const,
          className:
            "mt-4 h-12 w-[224px] max-w-full border-[#404040] bg-white px-3 text-[#404040] hover:border-[#404040] hover:bg-white hover:text-[#404040]",
          onClick: undefined,
        }
      : isCreator
        ? {
            label: undefined,
            disabled: true,
            variant: "primary" as const,
            onClick: undefined,
          }
        : !status
          ? isCheckInWindowOpen(activity)
            ? {
                label: "Atividade em andamento",
                disabled: true,
                variant: "outline" as const,
                className:
                  "mt-4 border-[#404040] text-[#404040] hover:border-[#404040] hover:text-[#404040]",
                onClick: undefined,
              }
            : {
                label: actionLoading ? "Participando..." : "Participar",
                disabled: actionLoading,
                variant: "primary" as const,
                onClick: () => runAction(() => subscribeToActivity(token!, activity.id)),
              }
          : status === "PENDING"
            ? {
                label: "Aguardando aprovação",
                disabled: true,
                variant: "primary" as const,
                onClick: undefined,
              }
            : status === "REJECTED"
              ? {
                  label: "Inscrição negada",
                  disabled: true,
                  variant: "danger" as const,
                  icon: <Ban size={28} strokeWidth={2} aria-hidden />,
                  onClick: undefined,
                }
              : status === "CHECKED_IN"
                ? {
                    label: undefined,
                    disabled: true,
                    variant: "outline" as const,
                    onClick: undefined,
                  }
                : isCheckInWindowOpen(activity)
                  ? {
                      label: undefined,
                      disabled: true,
                      variant: "outline" as const,
                      onClick: undefined,
                    }
                  : {
                      label: actionLoading ? "Desinscrevendo..." : "Desinscrever-se",
                      disabled: actionLoading,
                      variant: "outline" as const,
                      className:
                        "h-12 w-[224px] border-[#E7000B] bg-white px-3 text-[#E7000B] hover:border-[#E7000B] hover:bg-white hover:text-[#E7000B]",
                      onClick: () => runAction(() => unsubscribeFromActivity(token!, activity.id)),
                    };

  const participantItems = activity
    ? isCreator || participants.length > 0
      ? participants.map((participant) => ({
          id: participant.id,
          name: participant.user.name,
          role: participant.user.id === activity.creator.id ? "Organizador" : undefined,
          image: participant.user.avatar ?? "",
          showApproveActions:
            isCreator &&
            !actionLoading &&
            activity.isPrivate &&
            !activity.completedAt &&
            !activity.deletedAt &&
            !isCheckInWindowOpen(activity) &&
            participant.user.id !== activity.creator.id &&
            participant.approved !== true,
          onApprove: () =>
            runAction(() => approveParticipant(token!, activity.id, String(participant.id), true)),
          onReject: () =>
            runAction(() => approveParticipant(token!, activity.id, String(participant.id), false)),
        }))
      : [
          {
            id: activity.creator.id,
            name: activity.creator.name,
            role: "Organizador",
            image: activity.creator.avatar ?? "",
          },
        ]
    : [];

  async function handleCheckIn() {
    if (!activity || !checkInCode.trim()) {
      setError("Informe o código de confirmação para fazer check-in.");
      return;
    }

    await runAction(() => checkInActivity(token!, activity.id, checkInCode.trim()));
  }

  async function handleCancelActivity() {
    if (!activity || !token) {
      return;
    }

    setActionLoading(true);
    setError(null);

    try {
      await deleteActivity(token, activity.id);
      setActivityCanceled(true);
      setCancelDialogOpen(false);
    } catch (cancelError) {
      const message =
        cancelError instanceof Error ? cancelError.message : "Não foi possível cancelar a atividade.";
      setError(message);
    } finally {
      setActionLoading(false);
    }
  }

  function handleClose() {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate("/home");
  }

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

      <Modal
        open
        onClose={handleClose}
        className="max-h-[min(92dvh,960px)] w-full min-w-0 max-w-[min(834px,calc(100vw-1.5rem))] overflow-x-hidden overflow-y-auto rounded-[8px] px-4 py-6 shadow-[0_24px_80px_rgb(23_23_23_/_0.24)] sm:px-8 sm:py-10 lg:px-12 lg:py-12"
        overlayClassName="backdrop-blur-[8px] supports-[backdrop-filter]:bg-[rgb(23_23_23_/_0.28)]"
      >
        {error ? <Alert variant="error" description={error} className="mb-6" /> : null}

        {loading ? (
          <div className="py-12 text-body text-[var(--color-text)]">Carregando atividade...</div>
        ) : activityCanceled ? (
          <EmptyState
            title="Atividade cancelada"
            description="A atividade foi removida e não aparecerá mais nas listagens."
            className="min-h-[260px]"
          />
        ) : activity ? (
          <div className="grid min-w-0 gap-8 lg:grid-cols-[384px_320px] lg:gap-6">
            <div className="min-w-0 lg:flex">
            <ActivityDetailsPanel
              title={activity.title.toUpperCase()}
              image={activity.image}
              description={activity.description}
              date={formatDateTime(activity.scheduledDate)}
              participants={activity.participantCount}
              approvalRequired={activity.isPrivate}
              actionIcon={"icon" in actionConfig ? actionConfig.icon : undefined}
              actionLabel={actionConfig.label}
              actionDisabled={actionConfig.disabled}
              actionVariant={actionConfig.variant}
              actionClassName={"className" in actionConfig ? actionConfig.className : undefined}
              onActionClick={actionConfig.onClick}
            >
              {isCreator && !activity.completedAt && !activity.deletedAt ? (
                <div className="pt-2 lg:mt-auto">
                  <div className="min-w-0">
                    {!isCheckInWindowOpen(activity) ? (
                      <Button
                        variant="outline"
                        onClick={() => navigate(`/atividades/editar/${activity.id}`)}
                        disabled={actionLoading}
                        className="h-12 w-full rounded-[4px] border-[#171717] text-[#171717] hover:border-[#171717] hover:text-[#171717] sm:w-[224px]"
                      >
                        <Pencil size={20} strokeWidth={1.75} aria-hidden />
                        Editar
                      </Button>
                    ) : (
                    <Button
                      onClick={() => runAction(() => concludeActivity(token!, activity.id))}
                      disabled={actionLoading}
                      className="h-12 w-full gap-1.5 rounded-[4px] bg-[var(--color-primary-500)] px-3 text-white hover:bg-[var(--color-primary-600)] sm:w-[224px]"
                    >
                      <Flag size={28} strokeWidth={1.75} aria-hidden />
                      {actionLoading ? "Encerrando..." : "Encerrar atividade"}
                    </Button>
                    )}
                  </div>
                </div>
              ) : null}

              {!isCreator &&
              (status === "APPROVED" || status === "CHECKED_IN") &&
              !activity.completedAt &&
              !activity.deletedAt &&
              isCheckInWindowOpen(activity) ? (
                <div className="space-y-5">
                  <h3 className="break-words text-2xl text-[var(--color-title)] sm:text-title">FACA SEU CHECK-IN</h3>
                  <div className="flex min-w-0 flex-col gap-3 sm:flex-row">
                    <div className="min-w-0 flex-1">
                    <Input
                      placeholder="Código de confirmação"
                      value={displayedCheckInCode}
                      onChange={(event) => setCheckInCode(event.target.value)}
                      readOnly={status === "CHECKED_IN" || actionLoading}
                      disabled={status !== "CHECKED_IN" && actionLoading}
                    />
                    </div>
                    {status === "CHECKED_IN" ? (
                      <button
                        type="button"
                        aria-label="Check-in realizado"
                        className="inline-flex h-12 w-[88px] items-center justify-center gap-1.5 rounded-[8px] bg-[var(--color-primary-500)] px-8 text-white"
                      >
                        <Check size={28} strokeWidth={1.75} aria-hidden />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleCheckIn}
                        disabled={actionLoading}
                        className="inline-flex h-12 w-full items-center justify-center rounded-[var(--radius-xs)] bg-[var(--color-primary-500)] px-5 text-label font-semibold text-white transition-colors hover:bg-[var(--color-primary-600)] disabled:cursor-not-allowed disabled:opacity-55 sm:max-w-[188px]"
                      >
                        Confirmar
                      </button>
                    )}
                  </div>
                </div>
              ) : null}
            </ActivityDetailsPanel>
            </div>

            <div className="min-w-0 space-y-8 lg:w-[320px]">
              <MapPreview
                label="PONTO DE ENCONTRO"
                heightClassName="h-[200px] sm:h-[248px]"
                latitude={activity.address.latitude}
                longitude={activity.address.longitude}
              />

              <ParticipantList items={participantItems} />

              {isCreator && isCheckInWindowOpen(activity) && activity.confirmationCode ? (
                <div className="flex h-[120px] w-full max-w-[320px] flex-col gap-3 rounded-[8px] bg-[#F9F9F9] p-6">
                  <div className="flex items-center gap-3 text-body font-semibold text-[var(--color-text)]">
                    <UserCheck size={28} strokeWidth={1.75} className="text-[var(--color-primary-500)]" />
                    Código de check-in
                  </div>
                  <strong className="font-[family-name:var(--font-heading)] text-[40px] leading-none text-[var(--color-title)]">
                    {activity.confirmationCode}
                  </strong>
                </div>
              ) : null}
            </div>
          </div>
        ) : (
          <EmptyState
            title="Atividade não encontrada"
            description="Ela pode ter sido removida, encerrada ou você não tem mais acesso a esse detalhe."
            className="min-h-[240px]"
          />
        )}
      </Modal>

      <ConfirmationDialog
        open={cancelDialogOpen}
        title="TEM CERTEZA QUE DESEJA CANCELAR ESTA ATIVIDADE?"
        description="Ao cancelar, a atividade será removida das listagens e os participantes não poderão mais interagir com ela."
        confirmLabel="Cancelar atividade"
        destructive
        loading={actionLoading}
        onCancel={() => setCancelDialogOpen(false)}
        onConfirm={handleCancelActivity}
      />
    </AppShell>
  );
}

export { ActivityDetailsPage };
