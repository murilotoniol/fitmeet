import type { AuthResponse, RegisterPayload, SignInPayload } from "@/types";

import { request } from "./client";

function signIn(payload: SignInPayload) {
  return request<AuthResponse>("/auth/sign-in", {
    method: "POST",
    body: payload,
  });
}

function register(payload: RegisterPayload) {
  return request<AuthResponse>("/auth/register", {
    method: "POST",
    body: payload,
  });
}

export { register, signIn };
