// Simulated auth callback - not used in prototype
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // In prototype, auth is simulated - redirect to guest page
  return NextResponse.redirect(new URL("/app/guest", request.url));
}


