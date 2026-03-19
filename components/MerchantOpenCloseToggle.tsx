"use client";

import { useMemo, useState } from "react";

export function MerchantOpenCloseToggle({
  merchantSlug,
  initialIsOpen,
}: {
  merchantSlug: string;
  initialIsOpen: boolean;
}) {
  const [isOpen, setIsOpen] = useState(initialIsOpen);
  const [loading, setLoading] = useState(false);

  const classes = useMemo(() => {
    return isOpen
      ? "bg-emerald-500/15 text-emerald-100 border-emerald-500/30"
      : "bg-red-500/15 text-red-100 border-red-500/30";
  }, [isOpen]);

  async function toggle() {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/${merchantSlug}/merchant`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ isOpen: !isOpen }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        alert(json?.error ?? "Falha ao atualizar status do estabelecimento.");
        return;
      }
      if (typeof json?.merchant?.isOpen === "boolean") setIsOpen(json.merchant.isOpen);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      className={`rounded-xl px-3 py-1.5 text-sm border ${classes} ${loading ? "opacity-70" : ""}`}
    >
      {loading ? "Atualizando..." : isOpen ? "Aberto (clique para fechar)" : "Fechado (clique para abrir)"}
    </button>
  );
}

