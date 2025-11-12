import type { AuthApiErrorPayload } from "../types";

export class ApiError extends Error {
  public readonly status?: number;
  public readonly payload?: AuthApiErrorPayload;

  constructor(message: string, status?: number, payload?: AuthApiErrorPayload) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

export function normalizeErrorMessage(
  payload: AuthApiErrorPayload | null,
  fallback: string,
): string {
  if (!payload) {
    return fallback;
  }

  const { message, error } = payload;

  if (Array.isArray(message)) {
    return message.join(". ");
  }

  if (typeof message === "string" && message.trim().length > 0) {
    return message;
  }

  if (typeof error === "string" && error.trim().length > 0) {
    return error;
  }

  return fallback;
}

