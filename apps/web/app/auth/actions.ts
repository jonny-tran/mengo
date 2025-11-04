"use server";

// Simulated auth actions - not used in prototype
// All auth is simulated via localStorage in prototype mode
import { redirect } from "next/navigation";

export async function requestEmailOtp(email: string) {
  // Simulated - not used in prototype
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Email không hợp lệ." } as const;
  }

  // In prototype, always return success
  return { success: true } as const;
}

export async function verifyEmailOtp(email: string, token: string) {
  // Simulated - not used in prototype
  if (!email || !token) {
    return { error: "Thiếu email hoặc mã OTP." } as const;
  }

  // In prototype, redirect to guest page
  redirect("/app/guest");
}

export async function signOut() {
  // Simulated - not used in prototype
  redirect("/app/guest");
}
