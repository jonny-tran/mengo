import type { Role as PrismaRole } from "@mengo/database";

export type AuthRole = PrismaRole;

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  avatar?: string | null;
  role: AuthRole;
}

export interface AuthInfoResponse {
  id: string;
  email: string;
  name: string | null;
  avatar?: string | null;
  role: AuthRole;
}

export interface RequestOtpResponse {
  message: string;
}

export interface VerifyOtpResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export interface LogoutResponse {
  message: string;
}

export interface AuthApiErrorPayload {
  statusCode?: number;
  message?: string | string[];
  error?: string;
}

