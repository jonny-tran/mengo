"use server";

import { redirect } from "next/navigation";
import { createServerComponentClient } from "@/lib/supabase/server";

export async function requestEmailOtp(email: string) {
  const supabase = await createServerComponentClient();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Email không hợp lệ." } as const;
  }

  // Kiểm tra user tồn tại trong bảng profiles
  const { data: existingProfile, error: profileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (profileError) {
    return { error: "Không thể xác thực email." } as const;
  }

  if (!existingProfile) {
    return { error: "Email chưa được đăng ký." } as const;
  }

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false,
    },
  });

  if (error) {
    return { error: "Gửi OTP thất bại." } as const;
  }

  return { success: true } as const;
}

export async function verifyEmailOtp(email: string, token: string) {
  const supabase = await createServerComponentClient();

  if (!email || !token) {
    return { error: "Thiếu email hoặc mã OTP." } as const;
  }

  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "email",
  });

  if (error || !data?.session) {
    return { error: "OTP không hợp lệ hoặc đã hết hạn." } as const;
  }

  redirect("/app");
}

export async function signOut() {
  const supabase = await createServerComponentClient();
  await supabase.auth.signOut();
  redirect("/");
}
