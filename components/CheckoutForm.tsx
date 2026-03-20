"use client";

import { cartTotals, readCart } from "@/components/cart";
import { addToHistory } from "@/components/CustomerHistory";
import { formatBRLFromCents } from "@/lib/money";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type PaymentMethod = "PIX" | "CREDIT_CARD" | "DEBIT_CARD" | "CASH";
type PaymentTiming = "ON_ORDER" | "ON_PICKUP_OR_DELIVERY";

export function CheckoutForm({
  merchantSlug,
  merchantName,
  isOpen,
}: {
  merchantSlug: string;
  merchantName: string;
  isOpen: boolean;
}) {
  const router = useRouter();
  const cart = useMemo(() => readCart(merchantSlug), [merchantSlug]);
  const totals = useMemo(() => cartTotals(cart), [cart]);

  const [customerName, setCustomerName] = useState("");
  const [customerWhatsApp, setCustomerWhatsApp] = useState("");
  const [deliveryType, setDeliveryType] = useState<"pickup" | "delivery">("pickup");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("PIX");
  const [paymentTiming, setPaymentTiming] = useState<PaymentTiming>("ON_PICKUP_OR_DELIVERY");
  const [cashChangeFor, setCashChangeFor] = useState<string>("");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setError(null);
    if (!cart.items.length) {
      setError("Seu carrinho está vazio.");
      return;
    }
    if (!isOpen) {
      setError("A lanchonete está fechada no momento.");
      return;
    }
    if (!customerName.trim() || !customerWhatsApp.trim()) {
      setError("Informe seu nome e WhatsApp.");
      return;
    }
    if (deliveryType === "delivery" && !address.trim()) {
      setError("Informe o endereço para delivery.");
      return;
    }

    let cashChangeForCents: number | null = null;
    if (paymentMethod === "CASH" && cashChangeFor.trim()) {
      const v = Number(cashChangeFor.replace(",", "."));
      if (Number.isFinite(v) && v > 0) cashChangeForCents = Math.round(v * 100);
    }

    setLoading(true);
    const res = await fetch(`/api/t/${merchantSlug}/orders`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        customerName,
        customerWhatsApp,
        deliveryType,
        address: deliveryType === "delivery" ? address : undefined,
        paymentMethod,
        paymentTiming,
        cashChangeForCents,
        notes,
        items: cart.items,
      }),
    });

    const json = await res.json().catch(() => null);
    if (!res.ok) {
      setError(json?.error ?? "Não foi possível enviar o pedido.");
      setLoading(false);
      return;
    }

    addToHistory(merchantSlug, {
      code: json.publicCode,
      createdAt: new Date().toISOString(),
      totalCents: totals.totalCents,
    });
    router.push(`/t/${merchantSlug}/order/${json.publicCode}`);
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <h1 className="text-xl font-semibold">Finalizar pedido</h1>
      <p className="mt-1 text-sm text-white/70">
        Você está pedindo em <span className="text-white">{merchantName}</span>.
      </p>

      <div className="mt-3">
        <button
          type="button"
          onClick={() => router.push(`/t/${merchantSlug}/cart`)}
          className="btn"
        >
          Voltar ao carrinho
        </button>
      </div>

      <div className="mt-6 grid gap-3">
        <label className="grid gap-1 text-sm">
          <span className="text-white/80">Seu nome</span>
          <input
            className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 outline-none focus:border-white/30"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />
        </label>

        <label className="grid gap-1 text-sm">
          <span className="text-white/80">WhatsApp</span>
          <input
            className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 outline-none focus:border-white/30"
            placeholder="(DDD) 9xxxx-xxxx"
            value={customerWhatsApp}
            onChange={(e) => setCustomerWhatsApp(e.target.value)}
          />
        </label>

        <div className="grid gap-2 rounded-xl border border-white/10 bg-black/20 p-3">
          <div className="text-sm font-medium text-white">Entrega</div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={`rounded-xl px-3 py-1.5 text-xs border ${
                deliveryType === "pickup"
                  ? "bg-white text-black border-white"
                  : "bg-white/5 text-white border-white/15"
              }`}
              onClick={() => setDeliveryType("pickup")}
            >
              Retirar no local
            </button>
            <button
              type="button"
              className={`rounded-xl px-3 py-1.5 text-xs border ${
                deliveryType === "delivery"
                  ? "bg-white text-black border-white"
                  : "bg-white/5 text-white border-white/15"
              }`}
              onClick={() => setDeliveryType("delivery")}
            >
              Receber em casa
            </button>
          </div>

          {deliveryType === "delivery" ? (
            <label className="grid gap-1 text-sm">
              <span className="text-white/80">Endereço</span>
              <input
                className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 outline-none focus:border-white/30"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </label>
          ) : null}
        </div>

        <div className="grid gap-2 rounded-xl border border-white/10 bg-black/20 p-3">
          <div className="text-sm font-medium text-white">Pagamento</div>
          <div className="grid gap-2">
            <label className="flex items-center gap-2 text-sm text-white/80">
              <input
                type="radio"
                checked={paymentMethod === "PIX"}
                onChange={() => setPaymentMethod("PIX")}
              />
              PIX
            </label>
            <label className="flex items-center gap-2 text-sm text-white/80">
              <input
                type="radio"
                checked={paymentMethod === "CREDIT_CARD"}
                onChange={() => setPaymentMethod("CREDIT_CARD")}
              />
              Cartão de crédito
            </label>
            <label className="flex items-center gap-2 text-sm text-white/80">
              <input
                type="radio"
                checked={paymentMethod === "DEBIT_CARD"}
                onChange={() => setPaymentMethod("DEBIT_CARD")}
              />
              Cartão de débito
            </label>
            <label className="flex items-center gap-2 text-sm text-white/80">
              <input
                type="radio"
                checked={paymentMethod === "CASH"}
                onChange={() => setPaymentMethod("CASH")}
              />
              Dinheiro
            </label>
          </div>

          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              className={`rounded-xl px-3 py-1.5 text-xs border ${
                paymentTiming === "ON_ORDER"
                  ? "bg-white text-black border-white"
                  : "bg-white/5 text-white border-white/15"
              }`}
              onClick={() => setPaymentTiming("ON_ORDER")}
            >
              Pagar na compra
            </button>
            <button
              type="button"
              className={`rounded-xl px-3 py-1.5 text-xs border ${
                paymentTiming === "ON_PICKUP_OR_DELIVERY"
                  ? "bg-white text-black border-white"
                  : "bg-white/5 text-white border-white/15"
              }`}
              onClick={() => setPaymentTiming("ON_PICKUP_OR_DELIVERY")}
            >
              Pagar na entrega/retirada
            </button>
          </div>

          {paymentMethod === "CASH" ? (
            <label className="mt-2 grid gap-1 text-sm">
              <span className="text-white/80">Precisa de troco para quanto? (opcional)</span>
              <input
                className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 outline-none focus:border-white/30"
                placeholder="Ex: 50,00"
                value={cashChangeFor}
                onChange={(e) => setCashChangeFor(e.target.value)}
              />
            </label>
          ) : null}
        </div>

        <label className="grid gap-1 text-sm">
          <span className="text-white/80">Observação geral (opcional)</span>
          <textarea
            className="rounded-xl border border-white/10 bg-black/20 p-3 outline-none focus:border-white/30"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </label>

        {error ? (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/20 p-4">
          <div className="text-sm text-white/80">
            Total: <span className="text-white">{formatBRLFromCents(totals.totalCents)}</span>
          </div>
          <button
            type="button"
            disabled={loading}
            onClick={submit}
            className="btn btn-primary"
          >
            {loading ? "Enviando..." : "Enviar pedido"}
          </button>
        </div>
      </div>
    </div>
  );
}

