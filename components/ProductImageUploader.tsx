"use client";

import { useState } from "react";

export function ProductImageUploader(props: {
  merchantSlug: string;
  productId: string;
  currentUrl?: string | null;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [okUrl, setOkUrl] = useState<string | null>(props.currentUrl ?? null);

  async function onPick(file: File | null) {
    setError(null);
    if (!file) return;
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(
        `/api/admin/${props.merchantSlug}/products/${props.productId}/image`,
        { method: "POST", body: fd }
      );
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error ?? "Falha ao enviar imagem");
      setOkUrl(json.imageUrl);
    } catch (e: any) {
      setError(e?.message ?? "Erro");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <h2 className="font-semibold">Imagem do produto</h2>
      <p className="mt-1 text-sm text-white/70">
        Envie uma imagem PNG ou JPEG (até 5MB). Ela será salva e usada no catálogo do cliente.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <label className="rounded-xl border border-white/25 bg-white/10 px-4 py-2 text-xs font-medium text-white cursor-pointer">
          {loading ? "Enviando..." : "Escolher imagem"}
          <input
            type="file"
            accept="image/png,image/jpeg"
            className="hidden"
            disabled={loading}
            onChange={(e) => onPick(e.target.files?.[0] ?? null)}
          />
        </label>
        {okUrl ? (
          <a
            href={okUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl border border-white/25 bg-white/10 px-4 py-2 text-xs font-medium text-white"
          >
            Ver imagem
          </a>
        ) : (
          <div className="text-xs text-white/60">Sem imagem.</div>
        )}
      </div>

      {error ? (
        <div className="mt-3 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      {okUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={okUrl}
          alt="Imagem do produto"
          className="mt-4 h-40 w-full rounded-xl border border-white/10 object-cover"
        />
      ) : null}
    </div>
  );
}

