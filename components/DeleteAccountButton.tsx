"use client";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteAccountButton({ merchantSlug }: { merchantSlug: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);

  async function handleDelete() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/${merchantSlug}/account`, {
        method: "DELETE",
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error ?? "Falha ao excluir conta.");
      await signOut({ callbackUrl: "/admin/login" });
      router.push("/admin/login");
    } catch (e: any) {
      alert(e?.message ?? "Erro ao excluir conta.");
    } finally {
      setLoading(false);
      setConfirming(false);
    }
  }

  if (confirming) {
    return (
      <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
        <p className="text-sm text-red-100">
          Tem certeza? Esta ação é irreversível. Todos os dados do estabelecimento serão excluídos permanentemente.
        </p>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            className="rounded-xl border border-red-500/50 bg-red-500/20 px-4 py-2 text-sm text-red-200 disabled:opacity-60"
            disabled={loading}
            onClick={handleDelete}
          >
            {loading ? "Excluindo..." : "Sim, excluir minha conta"}
          </button>
          <button
            type="button"
            className="rounded-xl border border-white/15 px-4 py-2 text-sm disabled:opacity-60"
            disabled={loading}
            onClick={() => setConfirming(false)}
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      className="mt-4 rounded-xl border border-red-500/30 px-4 py-2 text-sm text-red-300 hover:bg-red-500/10"
      onClick={() => setConfirming(true)}
    >
      Excluir minha conta
    </button>
  );
}
