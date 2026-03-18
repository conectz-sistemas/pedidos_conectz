import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ProductCustomizer } from "@/components/ProductCustomizer";

export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string; productId: string }>;
}) {
  const { slug, productId } = await params;
  const merchant = await prisma.merchant.findUnique({
    where: { slug },
    select: { id: true, slug: true, isOpen: true },
  });
  if (!merchant) {
    return (
      <main>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          Lanchonete não encontrada.
        </div>
      </main>
    );
  }

  const product = await prisma.product.findFirst({
    where: { id: productId, merchantId: merchant.id, isActive: true },
    select: {
      id: true,
      name: true,
      description: true,
      basePriceCents: true,
      imageUrl: true,
      defaultIngredients: {
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          ingredientId: true,
          isLocked: true,
          isRemovable: true,
          group: { select: { name: true } },
          ingredient: { select: { name: true } },
          equivalences: {
            select: {
              equivalentIngredient: { select: { id: true, name: true } },
            },
          },
        },
      },
      extras: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
        select: {
          ingredientId: true,
          extraPriceCents: true,
          ingredient: { select: { name: true } },
        },
      },
    },
  });

  if (!product) {
    return (
      <main>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          Produto não encontrado.
        </div>
      </main>
    );
  }

  return (
    <main>
      <div className="mb-4 flex items-center justify-between gap-3">
        <Link
          href={`/t/${slug}`}
          className="rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-xs"
        >
          Voltar ao cardápio
        </Link>
      </div>

      {!merchant.isOpen ? (
        <div className="mb-4 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-sm text-yellow-100">
          A lanchonete está fechada. Você pode montar o pedido, mas não conseguirá finalizar.
        </div>
      ) : null}

      <ProductCustomizer
        merchantSlug={slug}
        product={{
          id: product.id,
          name: product.name,
          description: product.description,
          basePriceCents: product.basePriceCents,
          imageUrl: product.imageUrl,
        }}
        defaults={product.defaultIngredients.map((d) => ({
          id: d.id,
          ingredientId: d.ingredientId,
          name: d.ingredient.name,
          groupName: d.group?.name,
          isLocked: d.isLocked,
          isRemovable: d.isRemovable,
          equivalences: d.equivalences.map((e) => ({
            ingredientId: e.equivalentIngredient.id,
            name: e.equivalentIngredient.name,
          })),
        }))}
        extras={product.extras.map((e) => ({
          ingredientId: e.ingredientId,
          name: e.ingredient.name,
          priceCents: e.extraPriceCents,
        }))}
      />
    </main>
  );
}

