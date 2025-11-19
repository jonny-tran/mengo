import { NextRequest, NextResponse } from "next/server";

import { clearAuthCookies } from "@/lib/auth/session";

/**
 * Route handler to clear authentication cookies and redirect
 * This is needed because cookies can only be modified in Route Handlers or Server Actions,
 * not in Server Components
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const redirectTo = searchParams.get("redirect") || "/auth/login";

  // Clear auth cookies
  await clearAuthCookies();

  // Redirect to the specified URL
  return NextResponse.redirect(new URL(redirectTo, request.url));
}

