// Simulated auth form - not used in prototype
"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type AuthFormProps = {
  session: any | null;
};

export default function AuthForm({ session }: AuthFormProps) {
  const router = useRouter();

  // In prototype, redirect to guest page
  if (!session) {
    return (
      <div className="space-y-4 max-w-sm">
        <p className="text-sm text-muted-foreground">
          Authentication is simulated in prototype mode.
        </p>
        <Button onClick={() => router.push("/space/guest")}>
          Continue as Guest
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p>
        Logged in as: <strong>Guest User</strong>
      </p>
      <Button onClick={() => router.push("/space/guest")}>Sign Out</Button>
    </div>
  );
}
