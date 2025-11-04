import { NextRequest, NextResponse } from "next/server";
import { createServerComponentClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createServerComponentClient();
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/auth/login?error=missing_code", request.url));
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(new URL(`/auth/login?error=${encodeURIComponent(error.message)}`, request.url));
  }

  return NextResponse.redirect(new URL("/app", request.url));
}


