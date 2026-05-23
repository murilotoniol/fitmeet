import { describe, expect, it } from "vitest";

import type { Activity } from "@/types";

import { filterVisibleActivities, isVisibleActivity } from "./activity-filters";

function makeActivity(overrides: Partial<Activity> = {}): Activity {
  return {
    id: "activity-1",
    title: "Treino",
    description: "Treino ao ar livre",
    type: "Esporte",
    image: "image.jpg",
    confirmationCode: null,
    participantCount: 0,
    address: {
      latitude: -23.5,
      longitude: -46.6,
    },
    scheduledDate: "2026-06-01T12:00:00Z",
    createdAt: "2026-05-01T12:00:00Z",
    completedAt: null,
    deletedAt: null,
    isPrivate: false,
    creator: {
      id: "user-1",
      name: "Joao",
      avatar: null,
    },
    userSubscriptionStatus: null,
    ...overrides,
  };
}

describe("activity filters", () => {
  it("mantem atividades abertas", () => {
    expect(isVisibleActivity(makeActivity())).toBe(true);
  });

  it("remove atividades encerradas e canceladas", () => {
    const visible = makeActivity({ id: "visible" });
    const completed = makeActivity({ id: "completed", completedAt: "2026-05-02T12:00:00Z" });
    const deleted = makeActivity({ id: "deleted", deletedAt: "2026-05-02T12:00:00Z" });

    expect(filterVisibleActivities([visible, completed, deleted])).toEqual([visible]);
  });
});
