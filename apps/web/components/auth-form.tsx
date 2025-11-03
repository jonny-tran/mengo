// Vị trí: apps/web/components/auth-form.tsx
"use client";

import { Session } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useState } from "react";
// ĐÃ SỬA: Import từ file utility 'client' mới
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClientComponentClient } from "@/lib/supabase/client";

type AuthFormProps = {
  session: Session | null;
};

export default function AuthForm({ session }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  // Đã sửa: Khởi tạo client phía trình duyệt
  const supabase = createClientComponentClient();

  const handleSignUp = async () => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    });
    if (error) {
      alert(error.message);
    } else {
      alert("Check your email for the confirmation link!");
    }
    router.refresh();
  };

  const handleSignIn = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      alert(error.message);
    }
    router.refresh();
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  if (session) {
    return (
      <div className="space-y-4">
        <p>
          Logged in as: <strong>{session.user.email}</strong>
        </p>
        <Button onClick={handleSignOut}>Sign Out</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-sm">
      <Input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <div className="flex space-x-2">
        <Button onClick={handleSignIn}>Sign In</Button>
        <Button onClick={handleSignUp} variant="outline">
          Sign Up
        </Button>
      </div>
    </div>
  );
}
