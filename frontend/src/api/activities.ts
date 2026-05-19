import type {
  Activity,
  ActivityPage,
  ActivityType,
  CreateActivityPayload,
  MessageResponse,
  Participant,
  UpdateActivityPayload,
} from "@/types";

import { request } from "./client";

type GetActivitiesParams = {
  page?: number;
  pageSize?: number;
  typeId?: string;
  orderBy?: string;
  orderDirection?: string;
};

const HIDDEN_MAP_ADDRESS = {
  street: "Local selecionado no mapa",
  number: "S/N",
  neighborhood: "Local selecionado no mapa",
  city: "Local selecionado no mapa",
  state: "NA",
};

function buildQuery(params: Record<string, string | number | undefined>) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
}

function getActivityTypes(token: string) {
  return request<ActivityType[]>("/activities/types", { token });
}

function getActivities(token: string, params: GetActivitiesParams = {}) {
  return request<ActivityPage>(
    `/activities${buildQuery({
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 10,
      typeId: params.typeId,
      orderBy: params.orderBy ?? "createdAt",
      orderDirection: params.orderDirection ?? "desc",
    })}`,
    { token },
  );
}

function getAllActivities(token: string, params: Omit<GetActivitiesParams, "page" | "pageSize"> = {}) {
  return request<Activity[]>(
    `/activities/all${buildQuery({
      typeId: params.typeId,
      orderBy: params.orderBy ?? "createdAt",
      orderDirection: params.orderDirection ?? "desc",
    })}`,
    { token },
  );
}

function getActivity(token: string, activityId: string) {
  return request<Activity>(`/activities/${activityId}`, { token });
}

function getCreatorActivities(token: string, params: GetActivitiesParams = {}) {
  return request<ActivityPage>(
    `/activities/user/creator${buildQuery({
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 10,
      orderBy: params.orderBy ?? "createdAt",
      orderDirection: params.orderDirection ?? "desc",
    })}`,
    { token },
  );
}

function getAllCreatorActivities(
  token: string,
  params: Omit<GetActivitiesParams, "page" | "pageSize"> = {},
) {
  return request<Activity[]>(
    `/activities/user/creator/all${buildQuery({
      orderBy: params.orderBy ?? "createdAt",
      orderDirection: params.orderDirection ?? "desc",
    })}`,
    { token },
  );
}

function getParticipantActivities(token: string, params: GetActivitiesParams = {}) {
  return request<ActivityPage>(
    `/activities/user/participant${buildQuery({
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 10,
      orderBy: params.orderBy ?? "createdAt",
      orderDirection: params.orderDirection ?? "desc",
    })}`,
    { token },
  );
}

function getAllParticipantActivities(
  token: string,
  params: Omit<GetActivitiesParams, "page" | "pageSize"> = {},
) {
  return request<Activity[]>(
    `/activities/user/participant/all${buildQuery({
      orderBy: params.orderBy ?? "createdAt",
      orderDirection: params.orderDirection ?? "desc",
    })}`,
    { token },
  );
}

function getParticipants(token: string, activityId: string) {
  return request<Participant[]>(`/activities/${activityId}/participants`, { token });
}

function createActivity(token: string, payload: CreateActivityPayload) {
  const formData = new FormData();
  formData.append("title", payload.title);
  formData.append("description", payload.description);
  formData.append("typeId", payload.typeId);
  formData.append("image", payload.image);
  formData.append("scheduledDate", payload.scheduledDate);
  formData.append("isPrivate", String(payload.isPrivate));
  formData.append("address.street", payload.address.street ?? HIDDEN_MAP_ADDRESS.street);
  formData.append("address.number", payload.address.number ?? HIDDEN_MAP_ADDRESS.number);
  formData.append(
    "address.neighborhood",
    payload.address.neighborhood ?? HIDDEN_MAP_ADDRESS.neighborhood,
  );
  formData.append("address.city", payload.address.city ?? HIDDEN_MAP_ADDRESS.city);
  formData.append("address.state", payload.address.state ?? HIDDEN_MAP_ADDRESS.state);
  formData.append("address.latitude", String(payload.address.latitude));
  formData.append("address.longitude", String(payload.address.longitude));

  return request<Activity>("/activities/new", {
    method: "POST",
    token,
    body: formData,
  });
}

function updateActivity(token: string, activityId: string, payload: UpdateActivityPayload) {
  const formData = new FormData();

  if (payload.title) formData.append("title", payload.title);
  if (payload.description) formData.append("description", payload.description);
  if (payload.typeId) formData.append("typeId", payload.typeId);
  if (payload.image) formData.append("image", payload.image);
  if (payload.scheduledDate) formData.append("scheduledDate", payload.scheduledDate);
  if (payload.isPrivate !== undefined) formData.append("isPrivate", String(payload.isPrivate));
  if (payload.address) {
    formData.append("address.street", payload.address.street ?? HIDDEN_MAP_ADDRESS.street);
    formData.append("address.number", payload.address.number ?? HIDDEN_MAP_ADDRESS.number);
    formData.append(
      "address.neighborhood",
      payload.address.neighborhood ?? HIDDEN_MAP_ADDRESS.neighborhood,
    );
    formData.append("address.city", payload.address.city ?? HIDDEN_MAP_ADDRESS.city);
    formData.append("address.state", payload.address.state ?? HIDDEN_MAP_ADDRESS.state);
    formData.append("address.latitude", String(payload.address.latitude));
    formData.append("address.longitude", String(payload.address.longitude));
  }

  return request<Activity>(`/activities/${activityId}/update`, {
    method: "PUT",
    token,
    body: formData,
  });
}

function subscribeToActivity(token: string, activityId: string) {
  return request<MessageResponse>(`/activities/${activityId}/subscribe`, {
    method: "POST",
    token,
  });
}

function unsubscribeFromActivity(token: string, activityId: string) {
  return request<MessageResponse>(`/activities/${activityId}/unsubscribe`, {
    method: "DELETE",
    token,
  });
}

function approveParticipant(
  token: string,
  activityId: string,
  participantId: string,
  approved: boolean,
) {
  return request(`/activities/${activityId}/approve`, {
    method: "PUT",
    token,
    body: { participantId, approved },
  });
}

function checkInActivity(token: string, activityId: string, confirmationCode: string) {
  return request<MessageResponse>(`/activities/${activityId}/check-in`, {
    method: "PUT",
    token,
    body: { confirmationCode },
  });
}

function concludeActivity(token: string, activityId: string) {
  return request<MessageResponse>(`/activities/${activityId}/conclude`, {
    method: "PUT",
    token,
  });
}

function deleteActivity(token: string, activityId: string) {
  return request<MessageResponse>(`/activities/${activityId}/delete`, {
    method: "DELETE",
    token,
  });
}

export {
  approveParticipant,
  checkInActivity,
  concludeActivity,
  createActivity,
  deleteActivity,
  getActivities,
  getActivity,
  getActivityTypes,
  getAllActivities,
  getAllCreatorActivities,
  getAllParticipantActivities,
  getCreatorActivities,
  getParticipantActivities,
  getParticipants,
  subscribeToActivity,
  unsubscribeFromActivity,
  updateActivity,
};
