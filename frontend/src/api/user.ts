import type {
  MessageResponse,
  Preference,
  UpdateUserPayload,
  UserProfile,
  User,
} from "@/types";

import { request } from "./client";

function getCurrentUser(token: string) {
  return request<UserProfile>("/user", { token });
}

function getPreferences(token: string) {
  return request<Preference[]>("/user/preferences", { token });
}

function definePreferences(token: string, activityTypeIds: string[]) {
  return request<MessageResponse>("/user/preferences/define", {
    method: "POST",
    token,
    body: activityTypeIds,
  });
}

function updateUser(token: string, payload: UpdateUserPayload) {
  return request<User>("/user/update", {
    method: "PUT",
    token,
    body: payload,
  });
}

function deactivateUser(token: string) {
  return request<MessageResponse>("/user/deactivate", {
    method: "DELETE",
    token,
  });
}

function updateAvatar(token: string, file: File) {
  const formData = new FormData();
  formData.append("avatar", file);

  return request<{ avatar: string }>("/user/avatar", {
    method: "PUT",
    token,
    body: formData,
  });
}

export {
  deactivateUser,
  definePreferences,
  getCurrentUser,
  getPreferences,
  updateAvatar,
  updateUser,
};
