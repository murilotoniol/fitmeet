import { useEffect, useMemo, useRef, useState } from "react";
import { Pencil } from "lucide-react";
import { useNavigate } from "react-router";

import { getCreatorActivities, getParticipantActivities } from "@/api/activities";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { PageSection } from "@/components/ui/page-section";
import { useSession } from "@/hooks/use-session";
import { AppShell } from "@/layouts/app-shell";
import type { Activity, ActivityPage } from "@/types";
import { formatDateTime } from "@/utils/formatters";
import { AVATAR_PLACEHOLDER } from "@/utils/image-placeholders";

import { ActivityListItem } from "../activities/activity-list-item";

const INITIAL_PROFILE_ITEMS = 12;
const PROFILE_LOAD_MORE_STEP = 8;
const PROFILE_PAGE_SIZE = 4;
const INITIAL_PROFILE_PAGES = INITIAL_PROFILE_ITEMS / PROFILE_PAGE_SIZE;
const PROFILE_LOAD_MORE_PAGES = PROFILE_LOAD_MORE_STEP / PROFILE_PAGE_SIZE;
const BASE_XP_TO_LEVEL_UP = 100;
const LEVEL_XP_MULTIPLIER = 1.08;
const ACHIEVEMENTS_PER_PAGE = 3;
const XP_IMAGE_URL =
  "https://d11unjture0ske.cloudfront.net/transparent_background_image.67d718f3-658b-4815-a112-053541fad6ae.b4ca3e11-33d1-461e-8ca2-91049d836a02.png";
const ACHIEVEMENT_IMAGE_URL =
  "https://img.magnific.com/free-vector/award-ribbon_24908-54794.jpg?semt=ais_hybrid&w=740&q=80";

type ActivityPageFetcher = (page: number) => Promise<ActivityPage>;

async function loadProfilePages(
  fetchPage: ActivityPageFetcher,
  firstPage: number,
  pageCount: number,
) {
  let currentPage: number | null = firstPage;
  const loadedActivities: Activity[] = [];

  for (let index = 0; index < pageCount && currentPage !== null; index += 1) {
    const pageData = await fetchPage(currentPage);
    loadedActivities.push(...pageData.activities);
    currentPage = pageData.next;
  }

  return {
    activities: loadedActivities,
    nextPage: currentPage,
  };
}

function getXpRequiredForNextLevel(currentLevel: number) {
  return Math.ceil(BASE_XP_TO_LEVEL_UP * LEVEL_XP_MULTIPLIER ** Math.max(currentLevel - 1, 0));
}

function getLevelProgress(totalXp: number) {
  let level = 1;
  let xpInCurrentLevel = Math.max(totalXp, 0);
  let xpForNextLevel = getXpRequiredForNextLevel(level);

  while (xpInCurrentLevel >= xpForNextLevel) {
    xpInCurrentLevel -= xpForNextLevel;
    level += 1;
    xpForNextLevel = getXpRequiredForNextLevel(level);
  }

  return {
    xpInCurrentLevel,
    xpForNextLevel,
    percentage: Math.min((xpInCurrentLevel / xpForNextLevel) * 100, 100),
  };
}

function ProfilePage() {
  const navigate = useNavigate();
  const { token, user, loading: sessionLoading } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createdActivities, setCreatedActivities] = useState<Activity[]>([]);
  const [participantActivities, setParticipantActivities] = useState<Activity[]>([]);
  const [createdNextPage, setCreatedNextPage] = useState<number | null>(null);
  const [historyNextPage, setHistoryNextPage] = useState<number | null>(null);
  const [loadingMoreCreated, setLoadingMoreCreated] = useState(false);
  const [loadingMoreHistory, setLoadingMoreHistory] = useState(false);
  const [activeAchievementPage, setActiveAchievementPage] = useState(0);
  const achievementsViewportRef = useRef<HTMLDivElement>(null);

  const achievementPages = useMemo(() => {
    const achievements = user?.achievements ?? [];

    if (achievements.length === 0) {
      return [];
    }

    return Array.from(
      { length: Math.ceil(achievements.length / ACHIEVEMENTS_PER_PAGE) },
      (_, pageIndex) =>
        achievements.slice(
          pageIndex * ACHIEVEMENTS_PER_PAGE,
          pageIndex * ACHIEVEMENTS_PER_PAGE + ACHIEVEMENTS_PER_PAGE,
        ),
    );
  }, [user?.achievements]);

  const xpProgress = useMemo(() => getLevelProgress(user?.xp ?? 0), [user?.xp]);

  const selectedAchievementPage = Math.min(
    activeAchievementPage,
    Math.max(achievementPages.length - 1, 0),
  );

  useEffect(() => {
    if (!token) {
      return;
    }

    let active = true;

    const loadProfile = async () => {
      setLoading(true);
      setError(null);

      try {
        const [createdData, participantData] = await Promise.all([
          loadProfilePages(
            (page) => getCreatorActivities(token, { page, pageSize: PROFILE_PAGE_SIZE }),
            1,
            INITIAL_PROFILE_PAGES,
          ),
          loadProfilePages(
            (page) => getParticipantActivities(token, { page, pageSize: PROFILE_PAGE_SIZE }),
            1,
            INITIAL_PROFILE_PAGES,
          ),
        ]);

        if (!active) {
          return;
        }

        setCreatedActivities(createdData.activities);
        setCreatedNextPage(createdData.nextPage);
        setParticipantActivities(participantData.activities);
        setHistoryNextPage(participantData.nextPage);
      } catch (fetchError) {
        if (active) {
          const message =
            fetchError instanceof Error ? fetchError.message : "Não foi possível carregar o perfil.";
          setError(message);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadProfile();

    return () => {
      active = false;
    };
  }, [token]);

  async function handleLoadMoreCreated() {
    if (!token || !createdNextPage) {
      return;
    }

    setLoadingMoreCreated(true);
    setError(null);

    try {
      const loadedData = await loadProfilePages(
        (page) => getCreatorActivities(token, { page, pageSize: PROFILE_PAGE_SIZE }),
        createdNextPage,
        PROFILE_LOAD_MORE_PAGES,
      );

      setCreatedActivities((current) => [...current, ...loadedData.activities]);
      setCreatedNextPage(loadedData.nextPage);
    } catch (fetchError) {
      const message =
        fetchError instanceof Error
          ? fetchError.message
          : "Não foi possível carregar mais atividades criadas.";
      setError(message);
    } finally {
      setLoadingMoreCreated(false);
    }
  }

  async function handleLoadMoreHistory() {
    if (!token || !historyNextPage) {
      return;
    }

    setLoadingMoreHistory(true);
    setError(null);

    try {
      const loadedData = await loadProfilePages(
        (page) => getParticipantActivities(token, { page, pageSize: PROFILE_PAGE_SIZE }),
        historyNextPage,
        PROFILE_LOAD_MORE_PAGES,
      );

      setParticipantActivities((current) => [...current, ...loadedData.activities]);
      setHistoryNextPage(loadedData.nextPage);
    } catch (fetchError) {
      const message =
        fetchError instanceof Error
          ? fetchError.message
          : "Não foi possível carregar mais atividades do histórico.";
      setError(message);
    } finally {
      setLoadingMoreHistory(false);
    }
  }

  function handleAchievementScroll() {
    const viewport = achievementsViewportRef.current;

    if (!viewport) {
      return;
    }

    setActiveAchievementPage(Math.round(viewport.scrollLeft / viewport.clientWidth));
  }

  function handleAchievementPageClick(pageIndex: number) {
    const viewport = achievementsViewportRef.current;
    setActiveAchievementPage(pageIndex);
    viewport?.scrollTo({
      left: viewport.clientWidth * pageIndex,
      behavior: "smooth",
    });
  }

  if (sessionLoading || !user) {
    return (
      <AppShell>
        <div className="py-12 text-body text-[var(--color-text)]">Carregando perfil...</div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      {error ? <Alert variant="error" description={error} className="mb-6" /> : null}

      <div className="mx-auto max-w-[1160px] space-y-14">
        <section className="relative rounded-[12px] bg-[#fafafa] px-4 py-12 sm:px-8 lg:px-12">
          <button
            type="button"
            onClick={() => navigate("/perfil/editar")}
            className="absolute right-4 top-4 inline-flex h-10 w-[111px] items-center justify-center gap-1.5 rounded-[4px] border border-[#A1A1A1] bg-white px-3 text-sm font-semibold text-[#A1A1A1] transition-colors hover:border-[var(--color-text)] hover:text-[var(--color-text)] sm:right-8 sm:top-8"
          >
            <Pencil size={16} strokeWidth={2} aria-hidden />
            Editar
          </button>

          <div className="flex flex-col items-center gap-5 text-center">
            <ImageWithFallback
              src={user.avatar ?? undefined}
              fallbackSrc={AVATAR_PLACEHOLDER}
              alt={user.name ?? "Perfil"}
              className="h-40 w-40 rounded-full border-4 border-[var(--color-primary-500)] object-cover"
            />

            <div className="space-y-2">
              <h1 className="text-title text-[var(--color-title)]">{user.name.toUpperCase()}</h1>
            </div>

          </div>

          <div className="mx-auto mt-12 grid max-w-[798px] gap-[10px] lg:grid-cols-[414.84px_373px]">
            <div className="flex h-auto min-h-[208px] w-full flex-col justify-between gap-[10px] rounded-[8px] bg-white p-8 lg:h-[208px] lg:w-[414.84px]">
              <div className="flex items-start justify-between gap-5">
                <div>
                  <p className="text-label font-semibold text-[var(--color-title)]">Seu nível é</p>
                  <strong className="mt-3 block text-[44px] leading-none text-[var(--color-title)]">
                    {user.level ?? 1}
                  </strong>
                </div>

                <img
                  src={XP_IMAGE_URL}
                  alt=""
                  className="h-24 w-36 object-contain sm:h-28 sm:w-44"
                  loading="lazy"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-4 text-body text-[var(--color-text)]">
                  <span>Pontos para o próximo nível</span>
                  <strong className="shrink-0 text-title text-[var(--color-title)]">
                    {xpProgress.xpInCurrentLevel}/{xpProgress.xpForNextLevel} pts
                  </strong>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-[#d9d9d9]">
                  <div
                    className="h-full rounded-full bg-[var(--color-primary-500)]"
                    style={{ width: `${xpProgress.percentage}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex h-auto min-h-[208px] w-full flex-col justify-between gap-4 overflow-hidden rounded-[8px] bg-white p-8 lg:h-[208px] lg:w-[373px]">
              {achievementPages.length > 0 ? (
                <>
                  <div
                    ref={achievementsViewportRef}
                    onScroll={handleAchievementScroll}
                    className="flex h-[120px] w-full snap-x snap-mandatory overflow-x-auto scroll-smooth [scrollbar-width:none] lg:w-[309px] [&::-webkit-scrollbar]:hidden"
                  >
                    {achievementPages.map((achievementPage, pageIndex) => (
                      <div
                        key={pageIndex}
                        className="grid min-w-full snap-start grid-cols-3 gap-3"
                      >
                        {achievementPage.map((achievement) => (
                          <div
                            key={achievement.id}
                            className="flex h-[120px] w-[95px] min-w-0 flex-col items-center gap-2 text-center"
                          >
                            <div className="h-20 w-20 overflow-hidden rounded-[55px] bg-[#f3f3f3] px-5 py-2">
                              <img
                                src={ACHIEVEMENT_IMAGE_URL}
                                alt=""
                                className="h-full w-full scale-110 object-cover"
                                loading="lazy"
                              />
                            </div>
                            <p className="h-8 max-w-[95px] overflow-hidden break-words text-center text-xs leading-4 text-[var(--color-title)]">
                              {achievement.name}
                            </p>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>

                  {achievementPages.length > 1 ? (
                    <div className="mt-5 flex justify-center gap-2">
                      {achievementPages.map((_, pageIndex) => (
                        <button
                          key={pageIndex}
                          type="button"
                          aria-label={`Ver página ${pageIndex + 1} de conquistas`}
                          aria-current={selectedAchievementPage === pageIndex}
                          onClick={() => handleAchievementPageClick(pageIndex)}
                          className={`h-3 w-3 rounded-full transition-colors ${
                            selectedAchievementPage === pageIndex
                              ? "bg-[var(--color-title)]"
                              : "bg-[#d9d9d9]"
                          }`}
                        />
                      ))}
                    </div>
                  ) : null}
                </>
              ) : (
                <div className="flex h-[120px] w-full flex-col items-center justify-center text-center lg:w-[309px]">
                  <div className="h-20 w-20 overflow-hidden rounded-[55px] bg-[#f3f3f3] px-5 py-2">
                    <img
                      src={ACHIEVEMENT_IMAGE_URL}
                      alt=""
                      className="h-full w-full scale-110 object-cover"
                      loading="lazy"
                    />
                  </div>
                  <p className="mt-2 text-xs leading-4 text-[var(--color-title)]">Nenhuma conquista ainda</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {loading ? (
          <div className="py-12 text-body text-[var(--color-text)]">Carregando perfil...</div>
        ) : (
          <>
            <PageSection title="MINHAS ATIVIDADES">
              {createdActivities.length === 0 ? (
                <EmptyState
                  title="Você ainda não criou atividades"
                  description="Quando criar sua primeira atividade, ela vai aparecer aqui."
                />
              ) : (
                <>
                  <div className="grid gap-4 md:grid-cols-2">
                    {createdActivities.map((activity) => (
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

                  {createdNextPage ? (
                    <div className="flex justify-center pt-6">
                      <Button size="sm" onClick={handleLoadMoreCreated} disabled={loadingMoreCreated}>
                        {loadingMoreCreated ? "Carregando..." : "Ver mais"}
                      </Button>
                    </div>
                  ) : null}
                </>
              )}
            </PageSection>

            <PageSection title="HISTÓRICO DE ATIVIDADES">
              {participantActivities.length === 0 ? (
                <EmptyState
                  title="Nenhuma atividade no histórico"
                  description="Quando você participar de atividades, elas vão aparecer aqui."
                />
              ) : (
                <>
                  <div className="grid gap-4 md:grid-cols-2">
                    {participantActivities.map((activity) => (
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

                  {historyNextPage ? (
                    <div className="flex justify-center pt-6">
                      <Button size="sm" onClick={handleLoadMoreHistory} disabled={loadingMoreHistory}>
                        {loadingMoreHistory ? "Carregando..." : "Ver mais"}
                      </Button>
                    </div>
                  ) : null}
                </>
              )}
            </PageSection>
          </>
        )}
      </div>
    </AppShell>
  );
}

export { ProfilePage };
