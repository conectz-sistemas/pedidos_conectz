"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type Group = { id: string; name: string };
type Ingredient = { id: string; name: string; groupId: string | null; priceCents: number };
type DefaultIngredientInput = {
  ingredientId: string;
  ingredient: { id: string; name: string };
  group: { id: string; name: string } | null;
  isLocked: boolean;
  isRemovable: boolean;
  equivalences: { equivalentIngredient: { id: string; name: string } }[];
};
type ExtraInput = {
  ingredientId: string;
  ingredient: { name: string };
  extraPriceCents: number;
};

type DefaultItem = {
  ingredientId: string;
  ingredientName: string;
  groupId: string | null;
  groupName: string | null;
  isLocked: boolean;
  isRemovable: boolean;
  equivalenceIds: string[];
};

function SortableDefaultItem({
  idx,
  d,
  props: editorProps,
  candidates,
  updateDefault,
  removeDefault,
  toggleEquivalence,
}: {
  idx: number;
  d: DefaultItem;
  props: { ingredients: Ingredient[]; groups: Group[] };
  candidates: Ingredient[];
  updateDefault: (idx: number, patch: Partial<DefaultItem>) => void;
  removeDefault: (idx: number) => void;
  toggleEquivalence: (idx: number, ingredientId: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: idx });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-2xl border border-white/15 bg-white/5 p-4 ${isDragging ? "opacity-70" : ""}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="cursor-grab touch-none rounded p-1 text-white/50 hover:bg-white/10 hover:text-white/80 active:cursor-grabbing"
            {...attributes}
            {...listeners}
            aria-label="Arrastar para reordenar"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 12 12">
              <circle cx="4" cy="3" r="1" />
              <circle cx="4" cy="6" r="1" />
              <circle cx="4" cy="9" r="1" />
              <circle cx="8" cy="3" r="1" />
              <circle cx="8" cy="6" r="1" />
              <circle cx="8" cy="9" r="1" />
            </svg>
          </button>
          <select
            className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm"
            value={d.ingredientId}
            onChange={(e) => updateDefault(idx, { ingredientId: e.target.value })}
          >
            {editorProps.ingredients.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          className="rounded-xl border border-red-500/30 px-3 py-1.5 text-xs text-red-300"
          onClick={() => removeDefault(idx)}
        >
          Remover
        </button>
      </div>
      <div className="mt-3 flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm text-white/80">
          <input
            type="checkbox"
            checked={d.isLocked}
            onChange={(e) =>
              updateDefault(idx, {
                isLocked: e.target.checked,
                isRemovable: e.target.checked ? false : d.isRemovable,
                equivalenceIds: e.target.checked ? [] : d.equivalenceIds,
              })
            }
          />
          Padrão (travado)
        </label>
        <label className={`flex items-center gap-2 text-sm text-white/80 ${d.isLocked ? "opacity-50" : ""}`}>
          <input
            type="checkbox"
            checked={d.isRemovable}
            disabled={d.isLocked}
            onChange={(e) => updateDefault(idx, { isRemovable: e.target.checked })}
          />
          Cliente pode remover
        </label>
      </div>
      {!d.isLocked && candidates.length > 0 ? (
        <div className="mt-4">
          <div className="text-xs text-white/60">Equivalentes (troca sem custo)</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {candidates.map((c) => (
              <label key={c.id} className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-1.5 text-sm">
                <input
                  type="checkbox"
                  checked={d.equivalenceIds.includes(c.id)}
                  onChange={() => toggleEquivalence(idx, c.id)}
                />
                {c.name}
              </label>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function ProductPersonalizationEditor(props: {
  merchantSlug: string;
  productId: string;
  groups: Group[];
  ingredients: Ingredient[];
  initialDefaults: DefaultIngredientInput[];
  initialExtras: ExtraInput[];
}) {
  const [defaults, setDefaults] = useState(
    props.initialDefaults.map((d) => ({
      ingredientId: d.ingredientId,
      ingredientName: d.ingredient.name,
      groupId: d.group?.id ?? null,
      groupName: d.group?.name ?? null,
      isLocked: d.isLocked,
      isRemovable: d.isRemovable,
      equivalenceIds: d.equivalences.map((e) => e.equivalentIngredient.id),
    }))
  );
  const [extras, setExtras] = useState(
    props.initialExtras.map((e) => ({
      ingredientId: e.ingredientId,
      ingredientName: e.ingredient.name,
      extraPriceCents: e.extraPriceCents,
    }))
  );
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addDefault = () => {
    const first = props.ingredients[0];
    if (!first) return;
    setDefaults((d) => [
      ...d,
      {
        ingredientId: first.id,
        ingredientName: first.name,
        groupId: first.groupId,
        groupName: props.groups.find((g) => g.id === first.groupId)?.name ?? null,
        isLocked: false,
        isRemovable: true,
        equivalenceIds: [],
      },
    ]);
  };

  const updateDefault = (idx: number, patch: Partial<(typeof defaults)[0]>) => {
    setDefaults((d) => {
      const copy = [...d];
      const cur = copy[idx];
      if (patch.ingredientId) {
        const ing = props.ingredients.find((i) => i.id === patch.ingredientId);
        if (ing) {
          cur.ingredientId = ing.id;
          cur.ingredientName = ing.name;
          cur.groupId = ing.groupId;
          cur.groupName = props.groups.find((g) => g.id === ing.groupId)?.name ?? null;
        }
      }
      Object.assign(copy[idx], patch);
      return copy;
    });
  };

  const removeDefault = (idx: number) => {
    setDefaults((d) => d.filter((_, i) => i !== idx));
  };

  const moveDefault = (oldIndex: number, newIndex: number) => {
    setDefaults((d) => arrayMove(d, oldIndex, newIndex));
  };

  const toggleEquivalence = (idx: number, ingredientId: string) => {
    setDefaults((d) => {
      const copy = [...d];
      const eq = copy[idx].equivalenceIds;
      const set = new Set(eq);
      if (set.has(ingredientId)) set.delete(ingredientId);
      else set.add(ingredientId);
      copy[idx] = { ...copy[idx], equivalenceIds: [...set] };
      return copy;
    });
  };

  const addExtra = () => {
    const first = props.ingredients[0];
    if (!first) return;
    setExtras((e) => [
      ...e,
      { ingredientId: first.id, ingredientName: first.name, extraPriceCents: first.priceCents },
    ]);
  };

  const updateExtra = (idx: number, patch: Partial<(typeof extras)[0]>) => {
    setExtras((e) => {
      const copy = [...e];
      if (patch.ingredientId) {
        const ing = props.ingredients.find((i) => i.id === patch.ingredientId);
        if (ing) {
          copy[idx] = {
            ...copy[idx],
            ingredientId: ing.id,
            ingredientName: ing.name,
            extraPriceCents: patch.extraPriceCents ?? ing.priceCents,
          };
        }
      } else Object.assign(copy[idx], patch);
      return copy;
    });
  };

  const removeExtra = (idx: number) => {
    setExtras((e) => e.filter((_, i) => i !== idx));
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = defaults.findIndex((_, i) => i === Number(active.id));
    const newIdx = defaults.findIndex((_, i) => i === Number(over.id));
    if (oldIdx >= 0 && newIdx >= 0 && oldIdx !== newIdx) moveDefault(oldIdx, newIdx);
  }

  async function save() {
    setError(null);
    setSaved(false);
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/${props.merchantSlug}/products/${props.productId}/personalization`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            defaultIngredients: defaults.map((d) => ({
              ingredientId: d.ingredientId,
              groupId: d.groupId || null,
              isLocked: d.isLocked,
              isRemovable: d.isRemovable,
              equivalenceIds: d.equivalenceIds,
            })),
            extras: extras.map((e) => ({
              ingredientId: e.ingredientId,
              extraPriceCents: props.ingredients.find((i) => i.id === e.ingredientId)?.priceCents ?? 0,
            })),
          }),
        }
      );
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error ?? "Falha ao salvar.");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      window.location.reload();
    } catch (e: any) {
      setError(e?.message ?? "Erro");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="font-semibold">Ingredientes do produto</h2>
        <p className="mt-1 text-sm text-white/70">
          Defina a composição do lanche. Ingredientes <span className="text-white">padrão</span> (travados) não podem
          ser removidos nem trocados. Para ingredientes não travados, marque os equivalentes de troca (sem custo).
        </p>

        <p className="mt-2 text-xs text-white/60">
          Arraste os itens para cima ou para baixo para ordenar a apresentação.
        </p>

        <button
          type="button"
          className="mt-4 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm"
          onClick={addDefault}
        >
          + Adicionar ingrediente
        </button>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={defaults.map((_, i) => i)} strategy={verticalListSortingStrategy}>
            <div className="mt-6 grid gap-4">
              {defaults.map((d, idx) => (
                <SortableDefaultItem
                  key={idx}
                  idx={idx}
                  d={d}
                  props={props}
                  candidates={props.ingredients.filter((i) => i.id !== d.ingredientId)}
                  updateDefault={updateDefault}
                  removeDefault={removeDefault}
                  toggleEquivalence={toggleEquivalence}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="font-semibold">Adicionais (pagos)</h2>
        <p className="mt-1 text-sm text-white/70">
          Extras com custo. O preço é o mesmo definido no cadastro de ingredientes.
        </p>

        <button
          type="button"
          className="mt-4 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm"
          onClick={addExtra}
        >
          + Adicionar extra
        </button>

        <div className="mt-4 grid gap-3">
          {extras.map((e, idx) => (
            <div key={idx} className="flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-black/20 p-3">
              <select
                className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm"
                value={e.ingredientId}
                onChange={(ev) => {
                  const ing = props.ingredients.find((i) => i.id === ev.target.value);
                  if (ing) updateExtra(idx, { ingredientId: ing.id, ingredientName: ing.name, extraPriceCents: ing.priceCents });
                }}
              >
                {props.ingredients.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name} (R$ {(i.priceCents / 100).toFixed(2)})
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="rounded-xl border border-red-500/30 px-3 py-1.5 text-xs text-red-300"
                onClick={() => removeExtra(idx)}
              >
                Remover
              </button>
            </div>
          ))}
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</div>
      ) : null}

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <button
          type="button"
          className="w-full rounded-xl bg-white text-black px-4 py-3 text-sm font-medium disabled:opacity-60"
          disabled={loading}
          onClick={save}
        >
          {loading ? "Salvando..." : saved ? "Salvo!" : "Salvar personalização"}
        </button>
        <p className="mt-2 text-center text-xs text-white/60">
          Todas as alterações serão aplicadas ao clicar em Salvar.
        </p>
      </div>
    </div>
  );
}
