"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function StartDonoPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [canCreate, setCanCreate] = useState(false);

  useEffect(() => {
    fetch("/api/onboard-dono/check")
      .then((r) => r.json())
      .then((j) => {
        setCanCreate(j.canCreate === true);
        setChecking(false);
      })
      .catch(() => {
        setCanCreate(false);
        setChecking(false);
      });
  }, []);

  async function submit() {
    setError(null);
    if (!email.trim() || !password.trim()) return setError("Informe email e senha.");

    setLoading(true);
    try {
      const res = await fetch("/api/onboard-dono", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error ?? "Não foi possível criar sua conta.");

      await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: true,
        callbackUrl: "/saas",
      });
    } catch (e: any) {
      setError(e?.message ?? "Erro");
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <main className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-white/70">Verificando...</div>
      </main>
    );
  }

  if (!canCreate) {
    return (
      <main className="min-h-screen p-6">
        <div className="mx-auto max-w-xl">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h1 className="text-xl font-semibold">Criar acesso de dono</h1>
            <p className="mt-4 text-sm text-white/70">
              Já existe um dono cadastrado no sistema. Use a tela de login para acessar.
            </p>
            <button
              type="button"
              className="mt-6 btn"
              onClick={() => router.push("/admin/login")}
            >
              Ir para login
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-xl">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-semibold">Criar acesso de dono</h1>
              <p className="mt-1 text-sm text-white/70">
                Primeiro acesso ao sistema. Você será o administrador do SaaS (área /saas).
              </p>
            </div>
            <button type="button" className="btn" onClick={() => router.push("/")}>
              Voltar
            </button>
          </div>

          <div className="mt-6 grid gap-3">
            <label className="grid gap-1 text-sm">
              <span className="text-white/80">Email</span>
              <input
                className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 outline-none focus:border-white/40"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="seu@email.com"
              />
            </label>

            <label className="grid gap-1 text-sm">
              <span className="text-white/80">Senha</span>
              <input
                className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 outline-none focus:border-white/40"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                placeholder="min. 6 caracteres"
              />
            </label>

            {error ? (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
                {error}
              </div>
            ) : null}

            <div className="mt-2 flex justify-end">
              <button type="button" className="btn btn-primary" disabled={loading} onClick={submit}>
                {loading ? "Criando..." : "Criar acesso"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
