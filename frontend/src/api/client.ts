import type { ErrorResponse } from "@/types";

const API_URL = import.meta.env.VITE_API_URL?.trim() ?? "";
const API_BASE_URL = API_URL.replace(/\/$/, "");

if (import.meta.env.PROD && !API_BASE_URL) {
  throw new Error("Defina VITE_API_URL para conectar o frontend ao backend em producao.");
}

function buildApiUrl(path: string) {
  return API_BASE_URL ? `${API_BASE_URL}${path}` : `/api${path}`;
}

class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

type RequestOptions = Omit<RequestInit, "body"> & {
  token?: string | null;
  body?: BodyInit | object | null;
};

async function request<T>(path: string, options: RequestOptions = {}) {
  const headers = new Headers(options.headers);

  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }

  let body: BodyInit | null | undefined = options.body as BodyInit | null | undefined;

  if (
    options.body &&
    !(options.body instanceof FormData) &&
    typeof options.body === "object"
  ) {
    headers.set("Content-Type", "application/json");
    body = JSON.stringify(options.body);
  }

  const response = await fetch(buildApiUrl(path), {
    ...options,
    headers,
    body,
  });

  if (!response.ok) {
    let errorMessage = "Erro inesperado.";

    try {
      const error = (await response.json()) as ErrorResponse;
      errorMessage = error.error || errorMessage;
    } catch {
      errorMessage = "Erro inesperado.";
    }

    throw new ApiError(errorMessage, response.status);
  }

  if (response.status === 204) {
    return null as T;
  }

  return (await response.json()) as T;
}

export { ApiError, request };
