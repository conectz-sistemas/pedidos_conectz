"use client";

import { formatBRLFromCents } from "@/lib/money";
import { formatPaymentMethod, formatPaymentTiming } from "@/lib/orderLabels";
import Link from "next/link";
import { useEffect, useState } from "react";

type ApiOrder = {
  publicCode: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  customerName: string;
  deliveryType: string;
  paymentMethod: string;
  paymentTiming: string;
  cashChangeForCents: number | null;
  totalCents: number;
  merchant: { slug: string; name: string };
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

export function OrderTracker(props: { merchantSlug: string; publicCode: string }) {
  const [order, setOrder] = useState<ApiOrder | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    async function tick() {
      const res = await fetch(`/api/t/${props.merchantSlug}/orders/${props.publicCode}`, { cache: "no-store" });
      const json = await res.json().catch(() => null);
      if (!alive) return;
      if (!res.ok) {
        setError(json?.error ?? "Não foi possível carregar o pedido.");
        return;
      }
      setOrder(json.order);
      setError(null);
    }
    tick();
    const id = setInterval(tick, 2500);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [props.merchantSlug, props.publicCode]);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <h1 className="text-xl font-semibold">Acompanhar pedido</h1>

      {error ? (
        <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      {order ? (
        <div className="mt-4 grid gap-3">
          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <div className="text-sm text-white/70">Código</div>
            <div className="mt-1 text-2xl font-semibold tracking-wider">{order.publicCode}</div>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <div className="text-sm text-white/70">Status</div>
            <div className="mt-1 text-lg font-medium text-white">
              {statusLabel[order.status] ?? order.status}
            </div>
            <div className="mt-1 text-xs text-white/50">
              Atualizado em {new Date(order.updatedAt).toLocaleString("pt-BR")}
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-white/80">
            <div>
              Lanchonete: <span className="text-white">{order.merchant.name}</span>
            </div>
            <div className="mt-1">
              Total: <span className="text-white">{formatBRLFromCents(order.totalCents)}</span>
            </div>
            <div className="mt-1">
              Entrega:{" "}
              <span className="text-white">
                {order.deliveryType === "delivery" ? "Delivery" : "Retirada"}
              </span>
            </div>
            <div className="mt-1">
              Pagamento:{" "}
              <span className="text-white">
                {formatPaymentMethod(order.paymentMethod)} — {formatPaymentTiming(order.paymentTiming)}
              </span>
            </div>
            {order.paymentMethod === "CASH" && order.cashChangeForCents ? (
              <div className="mt-1">
                Troco para:{" "}
                <span className="text-white">
                  {formatBRLFromCents(order.cashChangeForCents)}
                </span>
              </div>
            ) : null}
          </div>

          <Link
            className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-center"
            href={`/t/${order.merchant.slug}`}
          >
            Voltar ao cardápio
          </Link>
        </div>
      ) : (
        <div className="mt-4 text-sm text-white/70">Carregando...</div>
      )}
    </div>
  );
}

