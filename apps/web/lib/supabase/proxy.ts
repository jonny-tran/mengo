// Simulated proxy - not used in prototype
import { NextRequest, NextResponse } from 'next/server'

export async function proxy(request: NextRequest) {
  // In prototype, return a simple response
  return NextResponse.json({ message: 'Proxy not used in prototype' }, { status: 200 })
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
}