"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function VerifyEmailContent() {
  const search = useSearchParams();
  const success = search.get("success") === "1";
  const error = search.get("error");

  if (success) {
    return (
      <main className="min-h-screen p-6 flex items-center justify-center">
        <div className="mx-auto max-w-md rounded-2xl border border-green-500/30 bg-green-500/10 p-6">
          <h1 className="text-xl font-semibold text-green-100">Email confirmado!</h1>
          <p className="mt-2 text-green-200/90">
            Sua conta foi verificada. Aguarde a aprovação do administrador para acessar o painel.
          </p>
          <Link
            href="/admin/login"
            className="mt-4 inline-block rounded-xl bg-white text-black px-4 py-2 text-sm font-medium"
          >
            Ir para login
          </Link>
        </div>
      </main>
    );
  }

  const messages: Record<string, string> = {
    token_invalido: "Link inválido.",
    token_expirado: "Este link expirou. Solicite um novo em Criar conta.",
    erro: "Ocorreu um erro. Tente novamente.",
  };

  return (
    <main className="min-h-screen p-6 flex items-center justify-center">
      <div className="mx-auto max-w-md rounded-2xl border border-red-500/30 bg-red-500/10 p-6">
        <h1 className="text-xl font-semibold text-red-100">Verificação falhou</h1>
        <p className="mt-2 text-red-200/90">
          {messages[error ?? ""] ?? "Link inválido ou expirado."}
        </p>
        <div className="mt-4 flex gap-3">
          <Link
            href="/admin/login"
            className="rounded-xl border border-white/15 px-4 py-2 text-sm"
          >
            Ir para login
          </Link>
          <Link
            href="/start"
            className="rounded-xl bg-white text-black px-4 py-2 text-sm font-medium"
          >
            Criar conta
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<main className="min-h-screen p-6" />}>
      <VerifyEmailContent />
    </Suspense>
  );
}
