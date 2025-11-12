import { redirect } from "next/navigation";

import { OTPForm } from "@/components/auth/otp-form";
import { fetchCurrentUser } from "@/lib/auth/session";

interface OTPPageProps {
  searchParams: Promise<{
    email?: string;
  }>;
}

export default async function OTPPage({ searchParams }: OTPPageProps) {
  // Await searchParams (Next.js 15+)
  const params = await searchParams;
  const emailParam = params.email;

  // OTP page requires email param to proceed
  if (!emailParam || typeof emailParam !== "string") {
    redirect("/auth/login");
  }

  // If user is already authenticated, redirect to space (skip OTP)
  // This check is optional - OTP page is accessible without auth
  try {
    const currentUser = await fetchCurrentUser();
    if (currentUser?.role === "STUDENT") {
      redirect("/space");
    }
  } catch {
    // If fetchCurrentUser fails (e.g., invalid token), continue to OTP page
    // User can still verify OTP to authenticate
  }

  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <OTPForm email={emailParam} />
      </div>
    </div>
  );
}
