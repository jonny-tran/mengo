import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/login-form";
import { fetchCurrentUser } from "@/lib/auth/session";

export default async function LoginPage() {
  const currentUser = await fetchCurrentUser();
  if (currentUser?.role === "STUDENT") {
    redirect("/space");
  }

  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  );
}
