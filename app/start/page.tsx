"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 30);
}

function StartPageContent() {
  const router = useRouter();
  const search = useSearchParams();
  const success = search.get("success") === "1";
  const [merchantName, setMerchantName] = useState("");
  const [slug, setSlug] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setError(null);
    if (!merchantName.trim()) return setError("Informe o nome da lanchonete.");
    const finalSlug = (slug.trim() || slugify(merchantName)) || "";
    if (finalSlug.length < 3) return setError("Escolha um slug com pelo menos 3 caracteres.");
    if (!email.trim() || !password.trim()) return setError("Informe email e senha.");

    setLoading(true);
    try {
      const res = await fetch("/api/onboard", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          merchantName,
          slug: finalSlug,
          email,
          password,
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error ?? "Não foi possível criar sua conta.");

      // Conta criada. Comerciantes precisam de aprovação do dono para acessar.
      router.push("/start?success=1");
    } catch (e: any) {
      setError(e?.message ?? "Erro");
      setLoading(false);
    }
  }

  if (success) {
    return (
      <main className="min-h-screen p-6">
        <div className="mx-auto max-w-xl">
          <div className="rounded-2xl border border-green-500/30 bg-green-500/10 p-6">
            <h1 className="text-xl font-semibold text-green-100">Conta criada!</h1>
            <p className="mt-2 text-green-200/90">
              Seu estabelecimento foi cadastrado. Aguarde a aprovação do administrador para acessar o painel.
              Você receberá acesso em breve.
            </p>
            <button
              type="button"
              className="mt-4 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm"
              onClick={() => router.push("/")}
            >
              Voltar ao início
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
              <h1 className="text-xl font-semibold">Criar conta</h1>
              <p className="mt-1 text-sm text-white/70">
                Crie sua lanchonete. Após o cadastro, aguarde a aprovação do administrador.
              </p>
            </div>
            <button type="button" className="btn" onClick={() => router.push("/")}>
              Voltar
            </button>
          </div>

          <div className="mt-6 grid gap-3">
            <label className="grid gap-1 text-sm">
              <span className="text-white/80">Nome da lanchonete</span>
              <input
                className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 outline-none focus:border-white/40"
                value={merchantName}
                onChange={(e) => {
                  setMerchantName(e.target.value);
                  if (!slug.trim()) setSlug(slugify(e.target.value));
                }}
                placeholder='Ex: "Lanchonete do João"'
              />
            </label>

            <label className="grid gap-1 text-sm">
              <span className="text-white/80">Slug (link público)</span>
              <input
                className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 outline-none focus:border-white/40"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="ex: lanchonete-do-joao"
              />
              <div className="text-xs text-white/60">
                Sua loja ficará em <span className="text-white">/t/{slug || "seu-slug"}</span>
              </div>
            </label>

            <label className="grid gap-1 text-sm">
              <span className="text-white/80">Email (admin)</span>
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
                {loading ? "Criando..." : "Criar conta"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function StartPage() {
  return (
    <Suspense fallback={<main className="min-h-screen p-6" />}>
      <StartPageContent />
    </Suspense>
  );
}

