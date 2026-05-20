import { useEffect, useMemo, useState } from "react";

import { getActivityTypes, getAllActivities } from "@/api/activities";
import { getPreferences } from "@/api/user";
import type { Activity, ActivityType, Preference } from "@/types";

type DashboardSection = {
  typeId: string;
  title: string;
  activities: Activity[];
};

type UseDashboardDataResult = {
  loading: boolean;
  error: string | null;
  activityTypes: ActivityType[];
  preferences: Preference[];
  recommendedActivities: Activity[];
  sections: DashboardSection[];
};

function shuffleActivities(activities: Activity[]) {
  const clonedActivities = [...activities];

  for (let index = clonedActivities.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [clonedActivities[index], clonedActivities[randomIndex]] = [
      clonedActivities[randomIndex],
      clonedActivities[index],
    ];
  }

  return clonedActivities;
}

function useDashboardData(token: string | null): UseDashboardDataResult {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activityTypes, setActivityTypes] = useState<ActivityType[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [preferences, setPreferences] = useState<Preference[]>([]);

  useEffect(() => {
    if (!token) {
      return;
    }

    let active = true;

    const loadDashboard = async () => {
      setLoading(true);
      setError(null);

      try {
        const [loadedTypes, loadedActivities, loadedPreferences] = await Promise.all([
          getActivityTypes(token),
          getAllActivities(token),
          getPreferences(token),
        ]);

        if (!active) {
          return;
        }

        setActivityTypes(loadedTypes);
        setActivities(loadedActivities.filter((activity) => !activity.completedAt));
        setPreferences(loadedPreferences);
      } catch (fetchError) {
        if (!active) {
          return;
        }

        const message =
          fetchError instanceof Error ? fetchError.message : "Não foi possível carregar a home.";
        setError(message);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadDashboard();

    return () => {
      active = false;
    };
  }, [token]);

  const recommendedActivities = useMemo(() => {
    const preferredTypeIds = new Set(preferences.map((preference) => preference.typeId));
    const typeIdByName = new Map(activityTypes.map((type) => [type.name, type.id]));

    const filteredActivities =
      preferredTypeIds.size > 0
        ? activities.filter((activity) => preferredTypeIds.has(typeIdByName.get(activity.type) ?? ""))
        : shuffleActivities(activities);

    return filteredActivities.slice(0, 8);
  }, [activities, activityTypes, preferences]);

  const sections = useMemo<DashboardSection[]>(() => {
    return activityTypes
      .map((type) => ({
        typeId: type.id,
        title: type.name.toUpperCase(),
        activities: activities.filter((activity) => activity.type === type.name),
      }))
      .filter((section) => section.activities.length > 0)
      .slice(0, 4);
  }, [activities, activityTypes]);

  return {
    loading,
    error,
    activityTypes,
    preferences,
    recommendedActivities,
    sections,
  };
}

export { useDashboardData };
