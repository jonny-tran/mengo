// Vị trí: apps/web/app/page.tsx

// ĐÃ SỬA: Import từ file utility 'server' mới
import AuthForm from "@/components/auth-form";
import { createServerComponentClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createServerComponentClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-2xl font-bold mb-6">Mengo Auth Test</h1>
      <AuthForm session={session} />
    </main>
  );
}
