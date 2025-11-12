import { redirect } from "next/navigation";

import { SignupForm } from "@/components/auth/signup-form";
import { fetchCurrentUser } from "@/lib/auth/session";

export default async function SignupPage() {
  const currentUser = await fetchCurrentUser();
  if (currentUser?.role === "STUDENT") {
    redirect("/space");
  }

  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <SignupForm />
      </div>
    </div>
  );
}
