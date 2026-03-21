"use client";

import { cartTotals, clearCart, readCart, writeCart, type Cart } from "@/components/cart";
import { formatBRLFromCents } from "@/lib/money";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

export function CartView({ merchantSlug }: { merchantSlug: string }) {
  const [cart, setCart] = useState<Cart>({ items: [] });

  useEffect(() => {
    setCart(readCart(merchantSlug));
  }, [merchantSlug]);

  const totals = useMemo(() => cartTotals(cart), [cart]);

  function removeIndex(idx: number) {
    const next = { ...cart, items: cart.items.filter((_, i) => i !== idx) };
    setCart(next);
    writeCart(merchantSlug, next);
  }

  function updateQuantity(idx: number, delta: number) {
    const it = cart.items[idx];
    if (!it) return;
    const qty = Math.max(1, Math.min(20, it.quantity + delta));
    const next = {
      ...cart,
      items: cart.items.map((item, i) =>
        i === idx ? { ...item, quantity: qty } : item
      ),
    };
    setCart(next);
    writeCart(merchantSlug, next);
  }

  function wipe() {
    clearCart(merchantSlug);
    setCart({ items: [] });
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Carrinho</h1>
          <p className="mt-1 text-sm text-white/70">Revise seu pedido antes de finalizar.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/t/${merchantSlug}`}
            className="btn"
          >
            Voltar ao cardápio
          </Link>
          {cart.items.length ? (
            <button
              className="btn"
              onClick={wipe}
              type="button"
            >
              Limpar
            </button>
          ) : null}
        </div>
      </div>

      <div className="mt-6 grid gap-3">
        {cart.items.map((it, idx) => {
          const extrasSum = it.extras.reduce(
            (s, e) => s + e.priceCents * (e.quantity ?? 1),
            0
          );
          const itemTotal = (it.basePriceCents + extrasSum) * it.quantity;
          return (
            <div
              key={idx}
              className="rounded-2xl border border-white/10 bg-black/20 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-medium text-white">{it.productName}</div>
                  <div className="mt-1 text-sm text-white/70">
                    {formatBRLFromCents(itemTotal)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center rounded-xl border border-white/15 bg-black/20">
                    <button
                      type="button"
                      onClick={() => updateQuantity(idx, -1)}
                      className="rounded-l-xl px-2 py-1.5 text-sm text-white hover:bg-white/10 disabled:opacity-50"
                      disabled={it.quantity <= 1}
                    >
                      −
                    </button>
                    <span className="min-w-[1.5rem] px-1 text-center text-sm tabular-nums">
                      {it.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(idx, 1)}
                      className="rounded-r-xl px-2 py-1.5 text-sm text-white hover:bg-white/10 disabled:opacity-50"
                      disabled={it.quantity >= 20}
                    >
                      +
                    </button>
                  </div>
                  <button
                    className="rounded-xl border border-red-500/30 px-3 py-1.5 text-xs text-red-300 hover:bg-red-500/10"
                    onClick={() => removeIndex(idx)}
                    type="button"
                  >
                    Remover
                  </button>
                </div>
              </div>

              {it.substitutions.length ? (
                <div className="mt-3 text-sm text-white/80">
                  <div className="text-xs text-white/60">Trocas (sem custo)</div>
                  <ul className="mt-1 list-disc pl-5">
                    {it.substitutions.map((s) => (
                      <li key={`${s.baseIngredientId}-${s.chosenIngredientId}`}>
                        {s.baseName} → <span className="text-white">{s.chosenName}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {it.removed.length ? (
                <div className="mt-3 text-sm text-white/80">
                  <div className="text-xs text-white/60">Removidos</div>
                  <ul className="mt-1 list-disc pl-5">
                    {it.removed.map((r) => (
                      <li key={r.ingredientId}>{r.name}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {it.extras.length ? (
                <div className="mt-3 text-sm text-white/80">
                  <div className="text-xs text-white/60">Adicionais (pagos)</div>
                  <ul className="mt-1 list-disc pl-5">
                    {it.extras.map((e) => {
                      const qty = e.quantity ?? 1;
                      const extraTotal = e.priceCents * qty;
                      return (
                        <li key={e.ingredientId}>
                          {qty > 1 ? `${qty}× ` : ""}
                          {e.name} (+{formatBRLFromCents(extraTotal)})
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ) : null}

              {it.notes ? (
                <div className="mt-3 text-sm text-white/80">
                  <div className="text-xs text-white/60">Obs.</div>
                  <div className="mt-1">{it.notes}</div>
                </div>
              ) : null}
            </div>
          );
        })}

        {cart.items.length === 0 ? (
          <div className="text-sm text-white/70">
            Seu carrinho está vazio.{" "}
            <Link className="underline" href={`/t/${merchantSlug}`}>
              Ver cardápio
            </Link>
          </div>
        ) : null}
      </div>

      <div className="mt-6 flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/20 p-4">
        <div className="text-sm text-white/80">
          Subtotal: <span className="text-white">{formatBRLFromCents(totals.subtotalCents)}</span>
        </div>
        {cart.items.length ? (
          <Link
            className="btn btn-primary"
            href={`/t/${merchantSlug}/checkout`}
          >
            Finalizar
          </Link>
        ) : null}
      </div>
    </div>
  );
}

