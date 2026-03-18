import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { ProductImageUploader } from "@/components/ProductImageUploader";

export const dynamic = "force-dynamic";

export default async function ProductEditPage({
  params,
}: {
  params: Promise<{ slug: string; productId: string }>;
}) {
  const { slug, productId } = await params;
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role as string | undefined;
  const merchantId = (session?.user as any)?.merchantId as string | null | undefined;

  const merchant = await prisma.merchant.findUnique({
    where: { slug },
    select: { id: true, name: true },
  });
  if (!merchant) {
    return (
      <main className="min-h-screen p-6">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          Lanchonete não encontrada.
        </div>
      </main>
    );
  }
  if (role !== "SUPERADMIN" && merchantId !== merchant.id) {
    return (
      <main className="min-h-screen p-6">
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-red-100">
          Sem permissão.
        </div>
      </main>
    );
  }

  const merchantIdSafe = merchant.id;
  const slugSafe = slug;

  const product = await prisma.product.findFirst({
    where: { id: productId, merchantId: merchantIdSafe },
    select: {
      id: true,
      name: true,
      basePriceCents: true,
      imageUrl: true,
      isActive: true,
      defaultIngredients: {
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          ingredientId: true,
          isLocked: true,
          isRemovable: true,
          sortOrder: true,
          groupId: true,
          ingredient: { select: { id: true, name: true } },
          group: { select: { id: true, name: true } },
          equivalences: {
            select: { equivalentIngredientId: true, equivalentIngredient: { select: { name: true } } },
          },
        },
      },
      extras: {
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          ingredientId: true,
          extraPriceCents: true,
          ingredient: { select: { name: true } },
          isActive: true,
        },
      },
    },
  });

  if (!product) {
    return (
      <main className="min-h-screen p-6">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">Produto não encontrado.</div>
      </main>
    );
  }

  const productIdSafe = product.id;

  const [groups, ingredients] = await Promise.all([
    prisma.ingredientGroup.findMany({
      where: { merchantId: merchantIdSafe },
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true },
    }),
    prisma.ingredient.findMany({
      where: { merchantId: merchantIdSafe, isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, groupId: true, priceCents: true },
    }),
  ]);

  async function addDefaultIngredient(formData: FormData) {
    "use server";
    const ingredientId = String(formData.get("ingredientId") ?? "").trim();
    const groupId = String(formData.get("groupId") ?? "").trim() || null;
    const isRemovable = String(formData.get("isRemovable") ?? "on") === "on";
    const isLocked = String(formData.get("isLocked") ?? "") === "on";
    if (!ingredientId) return;

    const max = await prisma.productIngredient.aggregate({
      where: { productId: productIdSafe },
      _max: { sortOrder: true },
    });

    await prisma.productIngredient.create({
      data: {
        productId: productIdSafe,
        ingredientId,
        groupId,
        isLocked,
        isRemovable: isLocked ? false : isRemovable,
        sortOrder: (max._max.sortOrder ?? 0) + 1,
      },
    });
    revalidatePath(`/admin/${slugSafe}/catalog/product/${productIdSafe}`);
  }

  async function removeDefaultIngredient(formData: FormData) {
    "use server";
    const productIngredientId = String(formData.get("productIngredientId") ?? "").trim();
    if (!productIngredientId) return;
    await prisma.productIngredient.delete({ where: { id: productIngredientId } });
    revalidatePath(`/admin/${slugSafe}/catalog/product/${productIdSafe}`);
  }

  async function saveEquivalences(formData: FormData) {
    "use server";
    const productIngredientId = String(formData.get("productIngredientId") ?? "").trim();
    const baseIngredientId = String(formData.get("baseIngredientId") ?? "").trim();
    const chosen = formData.getAll("eq").map(String).filter(Boolean);
    if (!productIngredientId || !baseIngredientId) return;

    const pi = await prisma.productIngredient.findUnique({
      where: { id: productIngredientId },
      select: { isLocked: true },
    });
    if (!pi || pi.isLocked) {
      // ingrediente travado não tem troca
      revalidatePath(`/admin/${slugSafe}/catalog/product/${productIdSafe}`);
      return;
    }

    await prisma.productIngredientEquivalence.deleteMany({ where: { productIngredientId } });
    if (chosen.length) {
      await prisma.productIngredientEquivalence.createMany({
        data: chosen.map((equivalentIngredientId) => ({
          productIngredientId,
          baseIngredientId,
          equivalentIngredientId,
        })),
        skipDuplicates: true,
      });
    }

    revalidatePath(`/admin/${slugSafe}/catalog/product/${productIdSafe}`);
  }

  async function addExtra(formData: FormData) {
    "use server";
    const ingredientId = String(formData.get("ingredientId") ?? "").trim();
    const price = Number(String(formData.get("price") ?? "0").replace(",", "."));
    if (!ingredientId || !Number.isFinite(price) || price < 0) return;

    const max = await prisma.productExtra.aggregate({
      where: { productId: productIdSafe },
      _max: { sortOrder: true },
    });

    await prisma.productExtra.upsert({
      where: { productId_ingredientId: { productId: productIdSafe, ingredientId } },
      update: { extraPriceCents: Math.round(price * 100), isActive: true },
      create: {
        productId: productIdSafe,
        ingredientId,
        extraPriceCents: Math.round(price * 100),
        isActive: true,
        sortOrder: (max._max.sortOrder ?? 0) + 1,
      },
    });
    revalidatePath(`/admin/${slugSafe}/catalog/product/${productIdSafe}`);
  }

  async function removeExtra(formData: FormData) {
    "use server";
    const extraId = String(formData.get("extraId") ?? "").trim();
    if (!extraId) return;
    await prisma.productExtra.delete({ where: { id: extraId } });
    revalidatePath(`/admin/${slugSafe}/catalog/product/${productIdSafe}`);
  }

  async function updateIngredientFlags(formData: FormData) {
    "use server";
    const productIngredientId = String(formData.get("productIngredientId") ?? "").trim();
    if (!productIngredientId) return;
    const isLocked = String(formData.get("isLocked") ?? "") === "on";
    const isRemovable = String(formData.get("isRemovable") ?? "") === "on";

    await prisma.productIngredient.update({
      where: { id: productIngredientId },
      data: {
        isLocked,
        isRemovable: isLocked ? false : isRemovable,
      },
    });
    if (isLocked) {
      await prisma.productIngredientEquivalence.deleteMany({ where: { productIngredientId } });
    }
    revalidatePath(`/admin/${slugSafe}/catalog/product/${productIdSafe}`);
  }

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-5xl grid gap-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="text-sm text-white/60">{merchant.name}</div>
              <h1 className="mt-1 text-xl font-semibold">{product.name}</h1>
              <div className="mt-1 text-sm text-white/70">
                Base: R$ {(product.basePriceCents / 100).toFixed(2)} • Ativo:{" "}
                <span className="text-white">{product.isActive ? "sim" : "não"}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link className="underline text-sm" href={`/admin/${slug}/catalog`}>
                Voltar ao cardápio
              </Link>
              <Link className="underline text-sm" href={`/t/${slug}/product/${product.id}`}>
                Ver no cliente
              </Link>
            </div>
          </div>
        </div>

        <ProductImageUploader merchantSlug={slug} productId={product.id} currentUrl={product.imageUrl} />

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="font-semibold">Ingredientes do produto</h2>
          <p className="mt-1 text-sm text-white/70">
            Aqui você define a composição do lanche. Ingredientes <span className="text-white">padrão</span> (travados)
            não podem ser removidos nem trocados. Para ingredientes não travados, você pode cadastrar equivalentes de
            troca (sem custo) para evitar trocas injustas.
          </p>

          <form className="mt-4 grid gap-2" action={addDefaultIngredient}>
            <div className="grid gap-2 md:grid-cols-3">
              <select
                name="ingredientId"
                className="md:col-span-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none focus:border-white/30"
                defaultValue=""
              >
                <option value="">(selecione um ingrediente)</option>
                {ingredients.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name}
                  </option>
                ))}
              </select>

              <select
                name="groupId"
                className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none focus:border-white/30"
                defaultValue=""
              >
                <option value="">(sem grupo)</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-sm text-white/80">
                <input name="isLocked" type="checkbox" />
                Padrão (travado no lanche)
              </label>
              <label className="flex items-center gap-2 text-sm text-white/80">
                <input name="isRemovable" type="checkbox" defaultChecked />
                Cliente pode remover (se não estiver travado)
              </label>
            </div>
            <div className="flex justify-end">
              <button className="rounded-xl bg-white text-black px-4 py-2 text-sm font-medium" type="submit">
                Adicionar ingrediente
              </button>
            </div>
          </form>

          <div className="mt-6 grid gap-3">
            {product.defaultIngredients.map((d) => {
              const selectedEq = new Set(d.equivalences.map((e) => e.equivalentIngredientId));
              const candidates = ingredients.filter((i) => i.id !== d.ingredientId);
              return (
                <div key={d.id} className="rounded-2xl border border-white/15 bg-white/5 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="font-medium text-white">{d.ingredient.name}</div>
                      <div className="mt-1 text-xs text-white/60">
                        Grupo: {d.group?.name ?? "—"} • Padrão: {d.isLocked ? "sim" : "não"} • Removível:{" "}
                        {d.isRemovable ? "sim" : "não"}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <form action={updateIngredientFlags} className="flex items-center gap-3">
                        <input type="hidden" name="productIngredientId" value={d.id} />
                        <label className="flex items-center gap-2 text-xs text-white/70">
                          <input name="isLocked" type="checkbox" defaultChecked={d.isLocked} />
                          Padrão
                        </label>
                        <label className="flex items-center gap-2 text-xs text-white/70">
                          <input name="isRemovable" type="checkbox" defaultChecked={d.isRemovable} disabled={d.isLocked} />
                          Removível
                        </label>
                        <button
                          className="rounded-xl border border-white/25 bg-white/10 px-3 py-1.5 text-xs text-white"
                          type="submit"
                        >
                          Salvar
                        </button>
                      </form>
                      <form action={removeDefaultIngredient}>
                        <input type="hidden" name="productIngredientId" value={d.id} />
                        <button
                          className="rounded-xl border border-white/25 bg-white/10 px-3 py-1.5 text-xs text-white"
                          type="submit"
                        >
                          Remover
                        </button>
                      </form>
                    </div>
                  </div>

                  {!d.isLocked ? (
                    <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3">
                      <div className="text-sm font-medium text-white">Equivalentes de troca (sem custo)</div>
                      <div className="mt-1 text-xs text-white/60">
                        Marque os ingredientes que o cliente poderá escolher para substituir{" "}
                        <span className="text-white">{d.ingredient.name}</span>.
                      </div>

                      <form className="mt-3 grid gap-2" action={saveEquivalences}>
                        <input type="hidden" name="productIngredientId" value={d.id} />
                        <input type="hidden" name="baseIngredientId" value={d.ingredientId} />

                        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                          {candidates.map((c) => (
                            <label key={c.id} className="flex items-center gap-2 text-sm text-white/80">
                              <input name="eq" type="checkbox" value={c.id} defaultChecked={selectedEq.has(c.id)} />
                              {c.name}
                            </label>
                          ))}
                        </div>
                        <div className="flex justify-end">
                          <button className="rounded-xl bg-white text-black px-4 py-2 text-sm font-medium" type="submit">
                            Salvar equivalentes
                          </button>
                        </div>
                      </form>
                    </div>
                  ) : (
                    <div className="mt-4 text-xs text-white/60">
                      Ingrediente padrão: não permite remoção nem troca.
                    </div>
                  )}
                </div>
              );
            })}
            {product.defaultIngredients.length === 0 ? (
              <div className="text-sm text-white/60">Nenhum ingrediente padrão cadastrado ainda.</div>
            ) : null}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="font-semibold">Adicionais (pagos)</h2>
          <p className="mt-1 text-sm text-white/70">
            Adicionais são extras com custo (ex: ovo). Eles aparecem separados para o cliente.
          </p>

          <form className="mt-4 grid gap-2" action={addExtra}>
            <div className="grid gap-2 md:grid-cols-3">
              <select
                name="ingredientId"
                className="md:col-span-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none focus:border-white/30"
                defaultValue=""
              >
                <option value="">(selecione um ingrediente)</option>
                {ingredients.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name} (sugestão R$ {(i.priceCents / 100).toFixed(2)})
                  </option>
                ))}
              </select>
              <input
                name="price"
                className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none focus:border-white/30"
                placeholder="Preço do extra (ex: 2,00)"
              />
            </div>
            <div className="flex justify-end">
              <button className="rounded-xl bg-white text-black px-4 py-2 text-sm font-medium" type="submit">
                Adicionar extra
              </button>
            </div>
          </form>

          <div className="mt-4 grid gap-2">
            {product.extras.map((e) => (
              <div key={e.id} className="rounded-xl border border-white/10 bg-black/20 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-white">
                    {e.ingredient.name}{" "}
                    <span className="text-white/60">
                      (+R$ {(e.extraPriceCents / 100).toFixed(2)})
                    </span>
                  </div>
                  <form action={removeExtra}>
                    <input type="hidden" name="extraId" value={e.id} />
                    <button
                      className="rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-xs"
                      type="submit"
                    >
                      Remover
                    </button>
                  </form>
                </div>
              </div>
            ))}
            {product.extras.length === 0 ? <div className="text-sm text-white/60">Sem extras.</div> : null}
          </div>
        </div>
      </div>
    </main>
  );
}

