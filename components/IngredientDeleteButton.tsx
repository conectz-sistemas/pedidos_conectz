"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function IngredientDeleteButton({
  merchantSlug,
  ingredientId,
  ingredientName,
}: {
  merchantSlug: string;
  ingredientId: string;
  ingredientName: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);

  async function handleDelete() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/${merchantSlug}/ingredients/${ingredientId}`, {
        method: "DELETE",
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error ?? "Falha ao excluir.");
      router.refresh();
    } catch (e: any) {
      alert(e?.message ?? "Erro ao excluir.");
    } finally {
      setLoading(false);
      setConfirming(false);
    }
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-white/70">Excluir &quot;{ingredientName}&quot;?</span>
        <button
          type="button"
          className="rounded-xl border border-red-500/50 bg-red-500/20 px-3 py-1.5 text-xs text-red-200"
          disabled={loading}
          onClick={handleDelete}
        >
          {loading ? "Excluindo..." : "Sim, excluir"}
        </button>
        <button
          type="button"
          className="rounded-xl border border-white/15 px-3 py-1.5 text-xs"
          disabled={loading}
          onClick={() => setConfirming(false)}
        >
          Cancelar
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      className="rounded-xl border border-red-500/30 px-3 py-1.5 text-xs text-red-300 hover:bg-red-500/10"
      onClick={() => setConfirming(true)}
    >
      Excluir
    </button>
  );
}
