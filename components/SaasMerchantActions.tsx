"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function SaasMerchantActions({
  merchantId,
  merchantName,
  isActive,
  isBlocked,
}: {
  merchantId: string;
  merchantName: string;
  isActive: boolean;
  isBlocked: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function doAction(action: string) {
    setLoading(action);
    try {
      const res = await fetch(`/api/saas/merchants/${merchantId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error ?? "Falha");
      router.refresh();
    } catch (e: any) {
      alert(e?.message ?? "Erro");
    } finally {
      setLoading(null);
    }
  }

  async function doDelete() {
    setLoading("delete");
    try {
      const res = await fetch(`/api/saas/merchants/${merchantId}`, {
        method: "DELETE",
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error ?? "Falha ao excluir");
      router.refresh();
    } catch (e: any) {
      alert(e?.message ?? "Erro");
    } finally {
      setLoading(null);
      setConfirmDelete(false);
    }
  }

  const pending = !isActive && !isBlocked;
  const blocked = isBlocked;

  if (confirmDelete) {
    return (
      <div className="flex flex-col gap-2">
        <span className="text-xs text-white/70">
          Excluir &quot;{merchantName}&quot;? Esta ação é irreversível.
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            className="rounded-xl border border-red-500/50 bg-red-500/20 px-3 py-1.5 text-xs text-red-200 disabled:opacity-60"
            disabled={!!loading}
            onClick={doDelete}
          >
            {loading === "delete" ? "Excluindo..." : "Sim, excluir"}
          </button>
          <button
            type="button"
            className="rounded-xl border border-white/15 px-3 py-1.5 text-xs disabled:opacity-60"
            disabled={!!loading}
            onClick={() => setConfirmDelete(false)}
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {pending ? (
        <button
          type="button"
          className="rounded-xl border border-green-500/50 bg-green-500/20 px-3 py-1.5 text-xs text-green-200 disabled:opacity-60"
          disabled={!!loading}
          onClick={() => doAction("approve")}
        >
          {loading === "approve" ? "..." : "Aprovar"}
        </button>
      ) : null}
      {isActive && !isBlocked ? (
        <button
          type="button"
          className="rounded-xl border border-red-500/50 bg-red-500/20 px-3 py-1.5 text-xs text-red-200 disabled:opacity-60"
          disabled={!!loading}
          onClick={() => doAction("block")}
        >
          {loading === "block" ? "..." : "Bloquear"}
        </button>
      ) : null}
      {blocked ? (
        <button
          type="button"
          className="rounded-xl border border-green-500/50 bg-green-500/20 px-3 py-1.5 text-xs text-green-200 disabled:opacity-60"
          disabled={!!loading}
          onClick={() => doAction("unblock")}
        >
          {loading === "unblock" ? "..." : "Desbloquear"}
        </button>
      ) : null}
      <button
        type="button"
        className="rounded-xl border border-red-500/30 px-3 py-1.5 text-xs text-red-300 hover:bg-red-500/10 disabled:opacity-60"
        disabled={!!loading}
        onClick={() => setConfirmDelete(true)}
      >
        Excluir
      </button>
    </div>
  );
}
