import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { CreateProductForm } from "@/components/CreateProductForm";
import { LogoutButton } from "@/components/LogoutButton";
import { ProductDeleteButton } from "@/components/ProductDeleteButton";

export const dynamic = "force-dynamic";

export default async function CatalogPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role as string | undefined;
  const merchantId = (session?.user as any)?.merchantId as string | null | undefined;

  const merchant = await prisma.merchant.findUnique({
    where: { slug },
    select: { id: true, name: true, isBlocked: true },
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

  if (role !== "SUPERADMIN" && merchantId === merchant.id && merchant.isBlocked) {
    return (
      <main className="min-h-screen p-6">
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-red-100">
          O acesso ao seu estabelecimento está bloqueado.
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

  async function createGroup(formData: FormData) {
    "use server";
    const name = String(formData.get("name") ?? "").trim();
    if (!name) return;
    await prisma.ingredientGroup.create({
      data: { merchantId: merchantIdSafe, name },
    });
    revalidatePath(`/admin/${slugSafe}/catalog`);
  }

  async function createIngredient(formData: FormData) {
    "use server";
    const name = String(formData.get("name") ?? "").trim();
    const price = Number(String(formData.get("price") ?? "0").replace(",", "."));
    const groupId = String(formData.get("groupId") ?? "").trim() || null;
    if (!name) return;
    await prisma.ingredient.create({
      data: {
        merchantId: merchantIdSafe,
        name,
        priceCents: Number.isFinite(price) ? Math.round(price * 100) : 0,
        groupId,
      },
    });
    revalidatePath(`/admin/${slugSafe}/catalog`);
  }

  const [groups, ingredients, products] = await Promise.all([
    prisma.ingredientGroup.findMany({
      where: { merchantId: merchant.id },
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true },
    }),
    prisma.ingredient.findMany({
      where: { merchantId: merchant.id },
      orderBy: { name: "asc" },
      select: { id: true, name: true, priceCents: true, isActive: true, group: { select: { name: true } } },
    }),
    prisma.product.findMany({
      where: { merchantId: merchant.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        isActive: true,
        basePriceCents: true,
        _count: { select: { defaultIngredients: true } },
      },
    }),
  ]);

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-5xl grid gap-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-semibold">Cardápio</h1>
              <p className="mt-1 text-sm text-white/70">{merchant.name}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                className="rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-xs"
                href="/admin"
              >
                Voltar ao painel
              </Link>
              <Link className="rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-xs" href={`/admin/${slug}/orders`}>
                Ver pedidos
              </Link>
              <LogoutButton />
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="font-semibold">Grupos de ingredientes</h2>
            <form className="mt-3 flex gap-2" action={createGroup}>
              <input
                name="name"
                className="flex-1 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none focus:border-white/30"
                placeholder='Ex: "Proteínas"'
              />
              <button className="rounded-xl bg-white text-black px-4 py-2 text-sm font-medium" type="submit">
                Criar
              </button>
            </form>
            <div className="mt-4 grid gap-2 text-sm text-white/80">
              {groups.map((g) => (
                <div key={g.id} className="rounded-xl border border-white/10 bg-black/20 p-3">
                  {g.name}
                </div>
              ))}
              {groups.length === 0 ? <div className="text-white/60">Sem grupos.</div> : null}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="font-semibold">Ingredientes</h2>
            <form className="mt-3 grid gap-2" action={createIngredient}>
              <div className="grid gap-2 md:grid-cols-3">
                <input
                  name="name"
                  className="md:col-span-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none focus:border-white/30"
                  placeholder='Ex: "Bacon"'
                />
                <input
                  name="price"
                  className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none focus:border-white/30"
                  placeholder="Preço extra (ex: 2,00)"
                />
              </div>
              <div className="flex gap-2">
                <select
                  name="groupId"
                  className="flex-1 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none focus:border-white/30"
                  defaultValue=""
                >
                  <option value="">(sem grupo)</option>
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
                <button className="rounded-xl bg-white text-black px-4 py-2 text-sm font-medium" type="submit">
                  Criar
                </button>
              </div>
            </form>

            <div className="mt-4 grid gap-2 text-sm text-white/80">
              {ingredients.map((i) => (
                <div key={i.id} className="rounded-xl border border-white/10 bg-black/20 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-white">{i.name}</div>
                    <div className="text-xs text-white/60">
                      {i.group?.name ? `${i.group.name} • ` : ""}
                      R$ {(i.priceCents / 100).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
              {ingredients.length === 0 ? <div className="text-white/60">Sem ingredientes.</div> : null}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="font-semibold">Produtos</h2>
          <CreateProductForm merchantSlug={slug} />

          <div className="mt-4 grid gap-2">
            {products.map((p) => (
              <div key={p.id} className="rounded-xl border border-white/10 bg-black/20 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-white font-medium">{p.name}</div>
                  <div className="flex items-center gap-2">
                    <Link
                      className="rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-xs"
                      href={`/admin/${slug}/catalog/product/${p.id}`}
                    >
                      Editar personalização
                    </Link>
                    <ProductDeleteButton merchantSlug={slug} productId={p.id} productName={p.name} />
                  </div>
                </div>
                <div className="mt-1 text-xs text-white/60">
                  Ativo: {p.isActive ? "sim" : "não"} • Base: R$ {(p.basePriceCents / 100).toFixed(2)}
                  {p._count.defaultIngredients === 0 ? (
                    <span className="ml-2 text-yellow-400">• Configure ingredientes e equivalentes</span>
                  ) : null}
                </div>
              </div>
            ))}
            {products.length === 0 ? <div className="text-sm text-white/60">Sem produtos.</div> : null}
          </div>
        </div>
      </div>
    </main>
  );
}

