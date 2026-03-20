"use client";

import { formatBRLFromCents } from "@/lib/money";
import { formatPaymentMethod, formatPaymentTiming } from "@/lib/orderLabels";
import { useEffect, useMemo, useRef, useState } from "react";

type Modification = {
  id: string;
  type: string;
  baseIngredientName: string | null;
  chosenIngredientName: string | null;
  priceDeltaCents: number;
};

type OrderItem = {
  id: string;
  quantity: number;
  productName: string;
  notes: string | null;
  modifications: Modification[];
};

type Order = {
  id: string;
  publicCode: string;
  status: string;
  customerName: string;
  customerWhatsApp: string;
  deliveryType: string;
  paymentMethod: string;
  paymentTiming: string;
  cashChangeForCents: number | null;
  totalCents: number;
  notes: string | null;
  createdAt: string;
  items: OrderItem[];
};

const statusLabel: Record<string, string> = {
  NEW: "Recebido",
  CONFIRMED: "Confirmado",
  PREPARING: "Preparando",
  READY: "Pronto",
  OUT_FOR_DELIVERY: "Saiu para entrega",
  COMPLETED: "Finalizado",
  CANCELED: "Cancelado",
};

const statusFlow: { id: string; label: string }[] = [
  { id: "NEW", label: "Recebido" },
  // pulamos o status CONFIRMED no fluxo da cozinha para ir direto para "Preparando"
  { id: "PREPARING", label: "Preparar" },
  { id: "READY", label: "Pronto" },
  { id: "OUT_FOR_DELIVERY", label: "Saiu para entrega" },
  { id: "COMPLETED", label: "Finalizar" },
  { id: "CANCELED", label: "Cancelar" },
];

async function makeBeep() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (ctx.state === "suspended") {
      await ctx.resume();
    }
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.value = 880;
    g.gain.value = 0.2;
    o.connect(g);
    g.connect(ctx.destination);
    o.start(0);
    o.stop(ctx.currentTime + 0.25);
    setTimeout(() => ctx.close(), 400);
  } catch {
    // ignore
  }
}

export function AdminOrdersBoard({ merchantSlug }: { merchantSlug: string }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);
  const seen = useRef<Set<string>>(new Set());
  const hasLoadedOnce = useRef(false);
  const audioUnlocked = useRef(false);

  useEffect(() => {
    if (audioUnlocked.current) return;
    const unlock = () => {
      audioUnlocked.current = true;
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (ctx.state === "suspended") ctx.resume();
    };
    document.addEventListener("click", unlock, { once: true });
    document.addEventListener("keydown", unlock, { once: true });
    return () => {
      document.removeEventListener("click", unlock);
      document.removeEventListener("keydown", unlock);
    };
  }, []);

  async function refresh() {
    const res = await fetch(`/api/admin/${merchantSlug}/orders`, { cache: "no-store" });
    const json = await res.json().catch(() => null);
    if (!res.ok) {
      setError(json?.error ?? "Erro ao carregar pedidos.");
      return;
    }
    setError(null);
    const next: Order[] = json.orders ?? [];

    const newOnes = next.filter((o) => !seen.current.has(o.id));
    if (hasLoadedOnce.current && newOnes.length > 0) makeBeep();
    next.forEach((o) => seen.current.add(o.id));
    hasLoadedOnce.current = true;

    setOrders(next);
  }

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 2000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [merchantSlug]);

  const grouped = useMemo(() => {
    return orders;
  }, [orders]);

  async function setStatus(orderId: string, status: string) {
    await fetch(`/api/admin/${merchantSlug}/orders/${orderId}/status`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status }),
    });
    refresh();
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Pedidos</h1>
          <p className="mt-1 text-sm text-white/70">
            Atualiza automaticamente. Quando chegar pedido novo, toca um alerta simples.
          </p>
        </div>
        <div />
      </div>

      {error ? (
        <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      <div className="mt-6 grid gap-3">
        {grouped.map((o) => (
          <div key={o.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="text-sm text-white/60">#{o.publicCode}</div>
                <div className="mt-1 font-medium text-white">{o.customerName}</div>
                <div className="mt-1 text-sm text-white/70">
                  {o.deliveryType === "delivery" ? "Receber em casa" : "Retirar no local"} •{" "}
                  {formatPaymentMethod(o.paymentMethod)} — {formatPaymentTiming(o.paymentTiming)} •{" "}
                  {formatBRLFromCents(o.totalCents)}
                </div>
                <div className="mt-1 text-xs text-white/50">
                  {new Date(o.createdAt).toLocaleString("pt-BR")}
                </div>
              </div>

              <div className="text-sm">
                <div className="text-white/60">Status</div>
                <div className="mt-1 font-medium text-white">
                  {statusLabel[o.status] ?? o.status}
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-2">
              {o.items.map((it) => (
                <div key={it.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <div className="text-sm text-white">
                    {it.quantity}× {it.productName}
                  </div>
                  {it.modifications.length ? (
                    <ul className="mt-2 list-disc pl-5 text-xs text-white/70">
                      {it.modifications.map((m) => (
                        <li key={m.id}>
                          {m.type === "REMOVE"
                            ? `Sem ${m.baseIngredientName}`
                            : m.type === "SUBSTITUTE"
                              ? `${m.baseIngredientName} → ${m.chosenIngredientName} (sem custo)`
                              : `Extra: ${m.chosenIngredientName} (+${formatBRLFromCents(
                                  m.priceDeltaCents
                                )})`}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  {it.notes ? (
                    <div className="mt-2 text-xs text-white/70">Obs: {it.notes}</div>
                  ) : null}
                </div>
              ))}
            </div>

            {o.notes ? (
              <div className="mt-3 text-sm text-white/80">
                <span className="text-white/60">Obs geral:</span> {o.notes}
              </div>
            ) : null}

            <div className="mt-4 flex flex-wrap gap-2">
              {statusFlow.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setStatus(o.id, s.id)}
                  className={`rounded-xl px-3 py-1.5 text-xs border ${
                    o.status === s.id
                      ? "bg-white text-black border-white"
                      : "bg-white/5 text-white border-white/15"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        ))}

        {orders.length === 0 ? (
          <div className="text-sm text-white/70">Nenhum pedido ainda.</div>
        ) : null}
      </div>
    </div>
  );
}

