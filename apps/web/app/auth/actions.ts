"use server";

import { redirect } from "next/navigation";

import { ApiError, requestOtp, verifyOtp } from "@mengo/api-client/services";
import { clearAuthCookies, performLogout, setAuthCookies } from "@/lib/auth/session";

export type RequestEmailOtpState = {
  success: boolean;
  error?: string;
  email?: string;
};

export type VerifyEmailOtpState = {
  success: boolean;
  error?: string;
};

export async function requestEmailOtp(
  _prevState: RequestEmailOtpState,
  formData: FormData,
): Promise<RequestEmailOtpState> {
  const email = String(formData.get("email") ?? "").toLowerCase().trim();

  if (!email) {
    return { success: false, error: "Please enter a valid email." };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, error: "Invalid email format." };
  }

  try {
    await requestOtp(email);
    return { success: true, email };
  } catch (error: unknown) {
    const message =
      error instanceof ApiError
        ? error.message
        : "Unable to send OTP code. Please try again.";
    return { success: false, error: message, email };
  }
}

export async function verifyEmailOtp(
  _prevState: VerifyEmailOtpState,
  formData: FormData,
): Promise<VerifyEmailOtpState> {
  const email = String(formData.get("email") ?? "").toLowerCase().trim();
  const otp = String(formData.get("otp") ?? "").trim();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, error: "Invalid email." };
  }

  if (!/^\d{6}$/.test(otp)) {
    return { success: false, error: "OTP code must be 6 digits." };
  }

  try {
    const payload = await verifyOtp(email, otp);

    if (payload.user.role !== "STUDENT") {
      await clearAuthCookies();
      return {
        success: false,
        error: "Your account has not been granted access to the student area.",
      };
    }

    await setAuthCookies(payload);
    return { success: true };
  } catch (error: unknown) {
    await clearAuthCookies();
    const message =
      error instanceof ApiError
        ? error.message
        : "Invalid OTP code or has expired.";
    return { success: false, error: message };
  }
}

export async function signOut() {
  await performLogout();
  redirect("/");
}
