import type {
  ImageAsset,
  MessageResponse,
  Preference,
  UpdateUserPayload,
  User,
  UserProfile,
} from '../types';
import {api} from './client';

function getCurrentUser() {
  return api.get<UserProfile>('/user').then(r => r.data);
}

function getPreferences() {
  return api.get<Preference[]>('/user/preferences').then(r => r.data);
}

function definePreferences(activityTypeIds: string[]) {
  return api
    .post<MessageResponse>('/user/preferences/define', activityTypeIds)
    .then(r => r.data);
}

function updateUser(payload: UpdateUserPayload) {
  return api.put<User>('/user/update', payload).then(r => r.data);
}

function deactivateUser() {
  return api.delete<MessageResponse>('/user/deactivate').then(r => r.data);
}

function updateAvatar(image: ImageAsset) {
  const formData = new FormData();
  formData.append('avatar', {
    uri: image.uri,
    type: image.type,
    name: image.fileName,
  } as any);

  return api
    .put<{avatar: string}>('/user/avatar', formData, {
      headers: {'Content-Type': 'multipart/form-data'},
    })
    .then(r => r.data);
}

export {
  deactivateUser,
  definePreferences,
  getCurrentUser,
  getPreferences,
  updateAvatar,
  updateUser,
};
