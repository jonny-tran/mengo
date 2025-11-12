import { request } from "../http";
import {
  requestOtpSchema,
  requestOtpResponseSchema,
  verifyOtpSchema,
  verifyOtpResponseSchema,
  authInfoResponseSchema,
  logoutResponseSchema,
} from "../schemas/auth";
import type {
  RequestOtpResponse,
  VerifyOtpResponse,
  AuthInfoResponse,
  LogoutResponse,
} from "../types";

export async function requestOtp(
  email: string,
): Promise<RequestOtpResponse> {
  return request({
    url: "/auth/request-otp",
    method: "POST",
    body: { email },
    bodySchema: requestOtpSchema,
    responseSchema: requestOtpResponseSchema,
    fallbackErrorMessage: "Unable to send OTP code. Please try again.",
  });
}

export async function verifyOtp(
  email: string,
  otp: string,
): Promise<VerifyOtpResponse> {
  return request({
    url: "/auth/verify-otp",
    method: "POST",
    body: { email, otp },
    bodySchema: verifyOtpSchema,
    responseSchema: verifyOtpResponseSchema,
    fallbackErrorMessage: "Invalid OTP code or has expired.",
  });
}

export async function getUserInfo(
  accessToken: string,
): Promise<AuthInfoResponse> {
  return request({
    url: "/auth/info",
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    responseSchema: authInfoResponseSchema,
    fallbackErrorMessage: "Unable to get user information.",
  });
}

export async function logout(accessToken: string): Promise<LogoutResponse> {
  return request({
    url: "/auth/logout",
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    responseSchema: logoutResponseSchema,
    fallbackErrorMessage: "Unable to logout. Please try again.",
  });
}

