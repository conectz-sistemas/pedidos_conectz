"use client";

import { formatBRLFromCents } from "@/lib/money";
import Link from "next/link";
import { useEffect, useState } from "react";

export type HistoryEntry = {
  code: string;
  createdAt: string;
  totalCents: number;
  merchantId?: string;
};

function storageKey(merchantSlug: string) {
  return `pedidos_conectz_history_${merchantSlug}`;
}

export function addToHistory(
  merchantSlug: string,
  entry: HistoryEntry,
  merchantId?: string
) {
  if (typeof window === "undefined") return;
  try {
    const enriched = { ...entry, merchantId };
    const raw = window.localStorage.getItem(storageKey(merchantSlug));
    const list: HistoryEntry[] = raw ? JSON.parse(raw) ?? [] : [];
    list.unshift(enriched);
    const unique = new Map<string, HistoryEntry>();
    for (const e of list) {
      if (!unique.has(e.code)) unique.set(e.code, e);
    }
    window.localStorage.setItem(storageKey(merchantSlug), JSON.stringify(Array.from(unique.values()).slice(0, 50)));
  } catch {
    // ignore
  }
}

export function CustomerHistory({
  merchantSlug,
  merchantId,
}: {
  merchantSlug: string;
  merchantId: string | null;
}) {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(storageKey(merchantSlug));
      const list: HistoryEntry[] = raw ? JSON.parse(raw) ?? [] : [];
      const filtered =
        merchantId != null ? list.filter((e) => e.merchantId === merchantId) : [];
      setEntries(filtered);
    } catch {
      setEntries([]);
    }
  }, [merchantSlug, merchantId]);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <h1 className="text-xl font-semibold">Histórico de pedidos</h1>
      <p className="mt-1 text-sm text-white/70">
        Pedidos feitos neste dispositivo para este estabelecimento.
      </p>

      <div className="mt-4 grid gap-3">
        {entries.map((e) => (
          <div key={e.code} className="rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-white/80">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-xs text-white/60">Código</div>
                <div className="text-lg font-semibold tracking-wider">{e.code}</div>
              </div>
              <div className="text-right text-xs text-white/60">
                <div>{new Date(e.createdAt).toLocaleString("pt-BR")}</div>
                <div className="mt-1 text-sm text-white">
                  {formatBRLFromCents(e.totalCents)}
                </div>
              </div>
            </div>
            <div className="mt-3">
              <Link
                className="btn"
                href={`/t/${merchantSlug}/order/${e.code}`}
              >
                Acompanhar pedido
              </Link>
            </div>
          </div>
        ))}

        {entries.length === 0 ? (
          <div className="text-sm text-white/70">
            Nenhum pedido registrado ainda neste dispositivo.
          </div>
        ) : null}
      </div>
    </div>
  );
}

