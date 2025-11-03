// Vị trí: apps/web/proxy.ts

import { NextRequest } from 'next/server'
// ĐÃ SỬA: Import từ file utility 'proxy' mới
import { createProxyClient } from '@/proxy'

export async function proxy(request: NextRequest) {
  // ĐÃ SỬA: Gọi hàm 'createProxyClient'
  const { supabase, response } = createProxyClient(request)
  
  await supabase.auth.getSession()
  
  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
}