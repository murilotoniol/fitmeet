import type {
  Activity,
  ActivityPage,
  ActivityType,
  CreateActivityPayload,
  MessageResponse,
  Participant,
  UpdateActivityPayload,
} from '../types';
import {api} from './client';

type GetActivitiesParams = {
  page?: number;
  pageSize?: number;
  typeId?: string;
  orderBy?: string;
  orderDirection?: string;
};

const HIDDEN_MAP_ADDRESS = {
  street: 'Local selecionado no mapa',
  number: 'S/N',
  neighborhood: 'Local selecionado no mapa',
  city: 'Local selecionado no mapa',
  state: 'NA',
};

function buildQuery(
  params: Record<string, string | number | undefined>,
): string {
  const entries = Object.entries(params).filter(
    ([, value]) => value !== undefined && value !== null && value !== '',
  );

  if (entries.length === 0) {
    return '';
  }

  const searchParams = entries.map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`).join('&');
  return `?${searchParams}`;
}

function getActivityTypes() {
  return api.get<ActivityType[]>('/activities/types').then(r => r.data);
}

function getActivities(params: GetActivitiesParams = {}) {
  return api
    .get<ActivityPage>(
      `/activities${buildQuery({
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 10,
        typeId: params.typeId,
        orderBy: params.orderBy ?? 'createdAt',
        orderDirection: params.orderDirection ?? 'desc',
      })}`,
    )
    .then(r => r.data);
}

function getAllActivities(
  params: Omit<GetActivitiesParams, 'page' | 'pageSize'> = {},
) {
  return api
    .get<Activity[]>(
      `/activities/all${buildQuery({
        typeId: params.typeId,
        orderBy: params.orderBy ?? 'createdAt',
        orderDirection: params.orderDirection ?? 'desc',
      })}`,
    )
    .then(r => r.data);
}

function getActivity(activityId: string) {
  return api.get<Activity>(`/activities/${activityId}`).then(r => r.data);
}

function getCreatorActivities(params: GetActivitiesParams = {}) {
  return api
    .get<ActivityPage>(
      `/activities/user/creator${buildQuery({
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 10,
        orderBy: params.orderBy ?? 'createdAt',
        orderDirection: params.orderDirection ?? 'desc',
      })}`,
    )
    .then(r => r.data);
}

function getAllCreatorActivities(
  params: Omit<GetActivitiesParams, 'page' | 'pageSize'> = {},
) {
  return api
    .get<Activity[]>(
      `/activities/user/creator/all${buildQuery({
        orderBy: params.orderBy ?? 'createdAt',
        orderDirection: params.orderDirection ?? 'desc',
      })}`,
    )
    .then(r => r.data);
}

function getParticipantActivities(params: GetActivitiesParams = {}) {
  return api
    .get<ActivityPage>(
      `/activities/user/participant${buildQuery({
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 10,
        orderBy: params.orderBy ?? 'createdAt',
        orderDirection: params.orderDirection ?? 'desc',
      })}`,
    )
    .then(r => r.data);
}

function getAllParticipantActivities(
  params: Omit<GetActivitiesParams, 'page' | 'pageSize'> = {},
) {
  return api
    .get<Activity[]>(
      `/activities/user/participant/all${buildQuery({
        orderBy: params.orderBy ?? 'createdAt',
        orderDirection: params.orderDirection ?? 'desc',
      })}`,
    )
    .then(r => r.data);
}

function getParticipants(activityId: string) {
  return api
    .get<Participant[]>(`/activities/${activityId}/participants`)
    .then(r => r.data);
}

function buildActivityFormData(
  payload: CreateActivityPayload,
): FormData {
  const formData = new FormData();
  formData.append('title', payload.title);
  formData.append('description', payload.description);
  formData.append('typeId', payload.typeId);
  formData.append('image', {
    uri: payload.image.uri,
    type: payload.image.type,
    name: payload.image.fileName,
  } as any);
  formData.append('scheduledDate', payload.scheduledDate);
  formData.append('isPrivate', String(payload.isPrivate));
  formData.append(
    'address.street',
    payload.address.street ?? HIDDEN_MAP_ADDRESS.street,
  );
  formData.append(
    'address.number',
    payload.address.number ?? HIDDEN_MAP_ADDRESS.number,
  );
  formData.append(
    'address.neighborhood',
    payload.address.neighborhood ?? HIDDEN_MAP_ADDRESS.neighborhood,
  );
  formData.append(
    'address.city',
    payload.address.city ?? HIDDEN_MAP_ADDRESS.city,
  );
  formData.append(
    'address.state',
    payload.address.state ?? HIDDEN_MAP_ADDRESS.state,
  );
  formData.append('address.latitude', String(payload.address.latitude));
  formData.append('address.longitude', String(payload.address.longitude));

  return formData;
}

function createActivity(payload: CreateActivityPayload) {
  const formData = buildActivityFormData(payload);

  return api
    .post<Activity>('/activities/new', formData, {
      headers: {'Content-Type': 'multipart/form-data'},
    })
    .then(r => r.data);
}

function updateActivity(
  activityId: string,
  payload: UpdateActivityPayload,
) {
  const formData = new FormData();

  if (payload.title) {
    formData.append('title', payload.title);
  }
  if (payload.description) {
    formData.append('description', payload.description);
  }
  if (payload.typeId) {
    formData.append('typeId', payload.typeId);
  }
  if (payload.image) {
    formData.append('image', {
      uri: payload.image.uri,
      type: payload.image.type,
      name: payload.image.fileName,
    } as any);
  }
  if (payload.scheduledDate) {
    formData.append('scheduledDate', payload.scheduledDate);
  }
  if (payload.isPrivate !== undefined) {
    formData.append('isPrivate', String(payload.isPrivate));
  }
  if (payload.address) {
    formData.append(
      'address.street',
      payload.address.street ?? HIDDEN_MAP_ADDRESS.street,
    );
    formData.append(
      'address.number',
      payload.address.number ?? HIDDEN_MAP_ADDRESS.number,
    );
    formData.append(
      'address.neighborhood',
      payload.address.neighborhood ?? HIDDEN_MAP_ADDRESS.neighborhood,
    );
    formData.append(
      'address.city',
      payload.address.city ?? HIDDEN_MAP_ADDRESS.city,
    );
    formData.append(
      'address.state',
      payload.address.state ?? HIDDEN_MAP_ADDRESS.state,
    );
    formData.append('address.latitude', String(payload.address.latitude));
    formData.append('address.longitude', String(payload.address.longitude));
  }

  return api
    .put<Activity>(`/activities/${activityId}/update`, formData, {
      headers: {'Content-Type': 'multipart/form-data'},
    })
    .then(r => r.data);
}

function subscribeToActivity(activityId: string) {
  return api
    .post<MessageResponse>(`/activities/${activityId}/subscribe`)
    .then(r => r.data);
}

function unsubscribeFromActivity(activityId: string) {
  return api
    .delete<MessageResponse>(`/activities/${activityId}/unsubscribe`)
    .then(r => r.data);
}

function approveParticipant(
  activityId: string,
  participantId: string,
  approved: boolean,
) {
  return api
    .put(`/activities/${activityId}/approve`, {participantId, approved})
    .then(r => r.data);
}

function checkInActivity(activityId: string, confirmationCode: string) {
  return api
    .put<MessageResponse>(`/activities/${activityId}/check-in`, {
      confirmationCode,
    })
    .then(r => r.data);
}

function concludeActivity(activityId: string) {
  return api
    .put<MessageResponse>(`/activities/${activityId}/conclude`)
    .then(r => r.data);
}

function deleteActivity(activityId: string) {
  return api
    .delete<MessageResponse>(`/activities/${activityId}/delete`)
    .then(r => r.data);
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
