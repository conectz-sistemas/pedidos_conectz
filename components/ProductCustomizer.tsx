"use client";

import { addItem, type CartExtra, type CartSubstitution } from "@/components/cart";
import { formatBRLFromCents } from "@/lib/money";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type DefaultIngredient = {
  id: string; // ProductIngredient id
  ingredientId: string;
  name: string;
  groupName?: string | null;
  isLocked: boolean;
  isRemovable: boolean;
  equivalences: { ingredientId: string; name: string }[];
};

type Extra = { ingredientId: string; name: string; priceCents: number };

export function ProductCustomizer(props: {
  merchantSlug: string;
  product: {
    id: string;
    name: string;
    description?: string | null;
    basePriceCents: number;
    imageUrl?: string | null;
  };
  defaults: DefaultIngredient[];
  extras: Extra[];
}) {
  const router = useRouter();
  const [notes, setNotes] = useState("");
  const [removed, setRemoved] = useState<Record<string, boolean>>({});
  const [substitute, setSubstitute] = useState<Record<string, string>>({}); // baseIngredientId -> chosenIngredientId
  const [extras, setExtras] = useState<Record<string, boolean>>({});

  const extrasById = useMemo(() => {
    const m = new Map<string, Extra>();
    for (const e of props.extras) m.set(e.ingredientId, e);
    return m;
  }, [props.extras]);

  const selectedExtras: CartExtra[] = useMemo(() => {
    return Object.entries(extras)
      .filter(([, v]) => v)
      .map(([ingredientId]) => {
        const e = extrasById.get(ingredientId)!;
        return { ingredientId, name: e.name, priceCents: e.priceCents };
      });
  }, [extras, extrasById]);

  const substitutions: CartSubstitution[] = useMemo(() => {
    const out: CartSubstitution[] = [];
    for (const d of props.defaults) {
      const chosenId = substitute[d.ingredientId];
      if (!chosenId) continue;
      if (chosenId === d.ingredientId) continue;
      const chosenName =
        d.equivalences.find((x) => x.ingredientId === chosenId)?.name ?? "Equivalente";
      out.push({
        baseIngredientId: d.ingredientId,
        baseName: d.name,
        chosenIngredientId: chosenId,
        chosenName,
      });
    }
    return out;
  }, [props.defaults, substitute]);

  const removedList = useMemo(() => {
    return props.defaults
      .filter((d) => removed[d.ingredientId])
      .map((d) => ({ ingredientId: d.ingredientId, name: d.name }));
  }, [props.defaults, removed]);

  const totalCents = useMemo(() => {
    const extrasSum = selectedExtras.reduce((s, e) => s + e.priceCents, 0);
    return props.product.basePriceCents + extrasSum;
  }, [props.product.basePriceCents, selectedExtras]);

  function toggleRemove(ingredientId: string) {
    setRemoved((r) => ({ ...r, [ingredientId]: !r[ingredientId] }));
    // se removeu, também limpa substituição (fica sem ingrediente)
    setSubstitute((s) => {
      const copy = { ...s };
      delete copy[ingredientId];
      return copy;
    });
  }

  function setSubstitution(baseIngredientId: string, chosenIngredientId: string) {
    setRemoved((r) => ({ ...r, [baseIngredientId]: false }));
    setSubstitute((s) => ({ ...s, [baseIngredientId]: chosenIngredientId }));
  }

  function toggleExtra(ingredientId: string) {
    setExtras((e) => ({ ...e, [ingredientId]: !e[ingredientId] }));
  }

  function addToCart() {
    addItem(props.merchantSlug, {
      productId: props.product.id,
      productName: props.product.name,
      basePriceCents: props.product.basePriceCents,
      quantity: 1,
      notes: notes.trim() ? notes.trim() : undefined,
      removed: removedList,
      substitutions,
      extras: selectedExtras,
    });
    router.push(`/t/${props.merchantSlug}/cart`);
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <div className="flex gap-4">
        <div className="flex-1">
          <h1 className="text-xl font-semibold">{props.product.name}</h1>
          {props.product.description ? (
            <p className="mt-1 text-sm text-white/70">{props.product.description}</p>
          ) : null}
          <div className="mt-3 text-sm text-white/80">
            Base: {formatBRLFromCents(props.product.basePriceCents)}
          </div>
        </div>
        {props.product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={props.product.imageUrl}
            alt={props.product.name}
            className="h-20 w-20 rounded-xl object-cover border border-white/10"
          />
        ) : (
          <div className="h-20 w-20 rounded-xl border border-white/10 bg-white/5" />
        )}
      </div>

      <div className="mt-6">
        <div className="text-sm font-medium text-white">Ingredientes</div>
        <div className="mt-2 grid gap-2">
          {props.defaults.map((d) => {
            const removedNow = !!removed[d.ingredientId];
            const chosen = substitute[d.ingredientId] ?? d.ingredientId;
            const hasEquivalences = !d.isLocked && d.equivalences.length > 0;

            return (
              <div
                key={d.id}
                className="rounded-xl border border-white/15 bg-white/5 p-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm text-white">
                      {d.name}
                      {d.groupName ? (
                        <span className="text-white/50"> • {d.groupName}</span>
                      ) : null}
                    </div>
                    {removedNow ? (
                      <div className="text-xs text-white/60">Removido</div>
                    ) : hasEquivalences && chosen !== d.ingredientId ? (
                      <div className="text-xs text-white/60">
                        Trocado por{" "}
                        <span className="text-white">
                          {d.equivalences.find((x) => x.ingredientId === chosen)?.name}
                        </span>{" "}
                        (sem custo)
                      </div>
                    ) : d.isLocked ? (
                      <div className="text-xs text-white/60">Padrão (do lanche)</div>
                    ) : hasEquivalences ? (
                      <div className="text-xs text-white/60">Troca sem custo disponível</div>
                    ) : null}
                  </div>

                  {!d.isLocked && d.isRemovable ? (
                    <button
                      type="button"
                      onClick={() => toggleRemove(d.ingredientId)}
                      className="rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-xs"
                    >
                      {removedNow ? "Desfazer" : "Remover"}
                    </button>
                  ) : (
                    <div className="text-xs text-white/50">{d.isLocked ? "Padrão" : "Obrigatório"}</div>
                  )}
                </div>

                {hasEquivalences && !removedNow ? (
                  <div className="mt-3 grid gap-2">
                    <div className="text-xs text-white/60">Trocar por equivalente (sem custo)</div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        className={`rounded-xl px-3 py-1.5 text-xs border ${
                          chosen === d.ingredientId
                            ? "bg-white text-black border-white"
                            : "bg-white/5 text-white border-white/15"
                        }`}
                        onClick={() => setSubstitution(d.ingredientId, d.ingredientId)}
                      >
                        Manter {d.name}
                      </button>
                      {d.equivalences.map((eq) => (
                        <button
                          key={eq.ingredientId}
                          type="button"
                          className={`rounded-xl px-3 py-1.5 text-xs border ${
                            chosen === eq.ingredientId
                              ? "bg-white text-black border-white"
                              : "bg-white/5 text-white border-white/15"
                          }`}
                          onClick={() => setSubstitution(d.ingredientId, eq.ingredientId)}
                        >
                          {eq.name}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6">
        <div className="text-sm font-medium text-white">Adicionais (pagos)</div>
        <div className="mt-2 grid gap-2">
          {props.extras.map((e) => (
            <label
              key={e.ingredientId}
              className="flex items-center justify-between gap-3 rounded-xl border border-white/15 bg-white/5 p-3 text-sm"
            >
              <span className="text-white">
                {e.name}{" "}
                <span className="text-white/60">({formatBRLFromCents(e.priceCents)})</span>
              </span>
              <input
                type="checkbox"
                checked={!!extras[e.ingredientId]}
                onChange={() => toggleExtra(e.ingredientId)}
              />
            </label>
          ))}
          {props.extras.length === 0 ? (
            <div className="text-sm text-white/60">Sem adicionais.</div>
          ) : null}
        </div>
      </div>

      <div className="mt-6">
        <div className="text-sm font-medium text-white">Observação</div>
        <textarea
          className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 p-3 text-sm outline-none focus:border-white/40"
          rows={3}
          placeholder='Ex: "caprichar na maionese"'
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
        <div className="text-sm text-white/80">
          Total deste item: <span className="text-white">{formatBRLFromCents(totalCents)}</span>
        </div>
        <button
          type="button"
          onClick={addToCart}
          className="rounded-xl bg-white text-black px-4 py-2 text-sm font-medium"
        >
          Adicionar ao carrinho
        </button>
      </div>
    </div>
  );
}

