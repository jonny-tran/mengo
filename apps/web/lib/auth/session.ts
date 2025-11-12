"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getUserInfo, logout } from "@mengo/api-client/services";
import type { AuthInfoResponse, VerifyOtpResponse } from "@mengo/api-client/types";

const ACCESS_TOKEN_COOKIE = "mengo_access_token";
const REFRESH_TOKEN_COOKIE = "mengo_refresh_token";
const MAX_AGE_ACCESS = 60 * 60 * 24; // 1 day
const MAX_AGE_REFRESH = 60 * 60 * 24 * 7; // 7 days

async function getCookieStore() {
  try {
    return await cookies();
  } catch {
    // Fallback for environments where cookies() might throw
    return cookies();
  }
}

export async function getAccessTokenFromCookies(): Promise<string | null> {
  const cookieStore = await getCookieStore();
  return cookieStore.get(ACCESS_TOKEN_COOKIE)?.value ?? null;
}

export async function getRefreshTokenFromCookies(): Promise<string | null> {
  const cookieStore = await getCookieStore();
  return cookieStore.get(REFRESH_TOKEN_COOKIE)?.value ?? null;
}

export async function setAuthCookies(payload: VerifyOtpResponse) {
  const cookieStore = await getCookieStore();
  cookieStore.set({
    name: ACCESS_TOKEN_COOKIE,
    value: payload.accessToken,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_ACCESS,
  });
  cookieStore.set({
    name: REFRESH_TOKEN_COOKIE,
    value: payload.refreshToken,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_REFRESH,
  });
}

export async function clearAuthCookies() {
  const cookieStore = await getCookieStore();
  cookieStore.delete(ACCESS_TOKEN_COOKIE);
  cookieStore.delete(REFRESH_TOKEN_COOKIE);
}

export async function fetchCurrentUser(): Promise<AuthInfoResponse | null> {
  const accessToken = await getAccessTokenFromCookies();
  if (!accessToken) {
    return null;
  }

  try {
    const user = await getUserInfo(accessToken);
    return user;
  } catch {
    await clearAuthCookies();
    return null;
  }
}

export async function requireStudentUser(): Promise<AuthInfoResponse> {
  const user = await fetchCurrentUser();
  if (!user) {
    redirect("/auth/login");
  }

  if (user.role !== "STUDENT") {
    await performLogout();
    redirect("/auth/login?error=forbidden");
  }

  return user;
}

export async function performLogout() {
  const accessToken = await getAccessTokenFromCookies();
  if (accessToken) {
    try {
      await logout(accessToken);
    } catch {
      // ignore API errors but continue to clear cookies
    }
  }

  await clearAuthCookies();
}

