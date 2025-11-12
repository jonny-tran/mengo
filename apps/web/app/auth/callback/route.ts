import { NextRequest, NextResponse } from "next/server";

import { getUserInfo } from "@mengo/api-client/services";
import type { AuthInfoResponse, AuthUser, VerifyOtpResponse } from "@mengo/api-client/types";
import { setAuthCookies, clearAuthCookies } from "@/lib/auth/session";

/**
 * Callback handler for Google OAuth flow
 * Backend redirects here with accessToken and refreshToken in query params
 * This handler:
 * 1. Extracts tokens from URL query params
 * 2. Fetches user info from API
 * 3. Sets auth cookies
 * 4. Redirects to /space (for STUDENT role) or /auth/login (for other roles)
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const accessToken = searchParams.get("accessToken");
  const refreshToken = searchParams.get("refreshToken");
  const error = searchParams.get("error");

  // Handle OAuth errors
  if (error) {
    console.error("OAuth error:", error);
    return NextResponse.redirect(
      new URL("/auth/login?error=oauth_failed", request.url),
    );
  }

  // Validate tokens
  if (!accessToken || !refreshToken) {
    console.error("Missing tokens in callback URL");
    return NextResponse.redirect(
      new URL("/auth/login?error=missing_tokens", request.url),
    );
  }

  try {
    // Fetch user info from API
    const userInfo: AuthInfoResponse = await getUserInfo(accessToken);

    // Check if user role is STUDENT
    if (userInfo.role !== "STUDENT") {
      // Clear any existing cookies
      try {
        await clearAuthCookies();
      } catch (clearError) {
        console.error("Failed to clear cookies:", clearError);
      }
      return NextResponse.redirect(
        new URL("/auth/login?error=forbidden", request.url),
      );
    }

    // Create VerifyOtpResponse object (same format as OTP flow)
    // AuthInfoResponse and AuthUser have the same structure
    const user: AuthUser = {
      id: userInfo.id,
      email: userInfo.email,
      name: userInfo.name,
      avatar: userInfo.avatar,
      role: userInfo.role,
    };

    const payload: VerifyOtpResponse = {
      accessToken,
      refreshToken,
      user,
    };

    // Set auth cookies
    await setAuthCookies(payload);

    // Redirect to student space
    return NextResponse.redirect(new URL("/space", request.url));
  } catch (error) {
    // Handle API errors (e.g., invalid token, network error)
    console.error("Failed to process OAuth callback:", error);
    try {
      await clearAuthCookies();
    } catch (clearError) {
      console.error("Failed to clear cookies:", clearError);
    }
    return NextResponse.redirect(
      new URL("/auth/login?error=oauth_failed", request.url),
    );
  }
}

