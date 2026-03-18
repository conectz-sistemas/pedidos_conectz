"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

function parseBRL(input: string) {
  const v = Number(input.replace(/\./g, "").replace(",", "."));
  return Number.isFinite(v) ? v : NaN;
}

export function CreateProductForm({ merchantSlug }: { merchantSlug: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const basePriceNumber = useMemo(() => parseBRL(basePrice), [basePrice]);

  async function submit() {
    setError(null);
    if (!name.trim()) return setError("Informe o nome do produto.");
    if (!Number.isFinite(basePriceNumber) || basePriceNumber <= 0) return setError("Informe um preço base válido.");

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/${merchantSlug}/products`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name,
          basePrice: basePriceNumber,
          description: description.trim() ? description.trim() : null,
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error ?? "Falha ao criar produto.");

      const productId: string = json.productId;

      if (file) {
        const fd = new FormData();
        fd.append("file", file);
        const up = await fetch(`/api/admin/${merchantSlug}/products/${productId}/image`, {
          method: "POST",
          body: fd,
        });
        const upJson = await up.json().catch(() => null);
        if (!up.ok) throw new Error(upJson?.error ?? "Falha ao enviar imagem.");
      }

      setName("");
      setBasePrice("");
      setDescription("");
      setFile(null);
      router.refresh();
    } catch (e: any) {
      setError(e?.message ?? "Erro");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-3 grid gap-2">
      <div className="grid gap-2 md:grid-cols-3">
        <input
          className="md:col-span-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none focus:border-white/30"
          placeholder='Ex: "X-Bacon"'
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none focus:border-white/30"
          placeholder="Preço base (ex: 18,90)"
          value={basePrice}
          onChange={(e) => setBasePrice(e.target.value)}
        />
      </div>
      <input
        className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none focus:border-white/30"
        placeholder="Descrição (opcional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <div className="flex flex-wrap items-center gap-3">
        <label className="btn cursor-pointer">
          {file ? "Trocar imagem" : "Escolher imagem"}
          <input
            type="file"
            accept="image/png,image/jpeg"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </label>
        <div className="text-xs text-white/60">
          {file ? `${file.name} (${Math.round(file.size / 1024)} KB)` : "PNG/JPEG até 5MB (opcional)."}
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</div>
      ) : null}

      <div className="flex justify-end">
        <button className="btn btn-primary" type="button" disabled={loading} onClick={submit}>
          {loading ? "Criando..." : "Criar produto"}
        </button>
      </div>
    </div>
  );
}

