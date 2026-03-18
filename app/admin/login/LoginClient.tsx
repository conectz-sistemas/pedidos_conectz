"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function LoginClient() {
  const search = useSearchParams();
  const next = search.get("next") ?? "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: true,
      callbackUrl: next,
    });

    if (res?.error) setError("Email ou senha inválidos.");
    setLoading(false);
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6">
      <h1 className="text-xl font-semibold">Entrar no iUai</h1>
      <p className="mt-1 text-sm text-white/70">Login do painel da lanchonete (admin).</p>

      <form className="mt-6 grid gap-3" onSubmit={onSubmit}>
        <label className="grid gap-1 text-sm">
          <span className="text-white/80">Email</span>
          <input
            className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 outline-none focus:border-white/30"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </label>

        <label className="grid gap-1 text-sm">
          <span className="text-white/80">Senha</span>
          <input
            className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 outline-none focus:border-white/30"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </label>

        {error ? (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        <button
          className="mt-2 rounded-xl bg-white text-black px-4 py-2 text-sm font-medium disabled:opacity-60"
          disabled={loading}
          type="submit"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}

