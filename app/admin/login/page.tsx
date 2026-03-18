import LoginClient from "@/app/admin/login/LoginClient";
import { Suspense } from "react";

export default function AdminLoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <Suspense
        fallback={
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/70">
            Carregando...
          </div>
        }
      >
        <LoginClient />
      </Suspense>
    </main>
  );
}

