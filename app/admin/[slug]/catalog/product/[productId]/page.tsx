import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import Link from "next/link";
import { ProductImageUploader } from "@/components/ProductImageUploader";
import { ProductPersonalizationEditor } from "@/components/ProductPersonalizationEditor";
import { ProductDeleteButton } from "@/components/ProductDeleteButton";

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
            select: { equivalentIngredientId: true, equivalentIngredient: { select: { id: true, name: true } } },
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

  const ingredientsForEditor = ingredients.map((i) => ({
    id: i.id,
    name: i.name,
    groupId: i.groupId,
    priceCents: i.priceCents,
  }));

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
            <div className="flex flex-wrap items-center gap-3">
              <Link className="underline text-sm" href={`/admin/${slug}/catalog`}>
                Voltar ao cardápio
              </Link>
              <Link className="underline text-sm" href={`/t/${slug}/product/${product.id}`}>
                Ver no cliente
              </Link>
              <ProductDeleteButton
                merchantSlug={slug}
                productId={product.id}
                productName={product.name}
                redirectAfterDelete={`/admin/${slug}/catalog`}
              />
            </div>
          </div>
        </div>

        <ProductImageUploader merchantSlug={slug} productId={product.id} currentUrl={product.imageUrl} />

        <ProductPersonalizationEditor
          merchantSlug={slug}
          productId={product.id}
          groups={groups}
          ingredients={ingredientsForEditor}
          initialDefaults={product.defaultIngredients}
          initialExtras={product.extras}
        />
      </div>
    </main>
  );
}

