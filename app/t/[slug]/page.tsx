import { prisma } from "@/lib/prisma";
import { formatBRLFromCents } from "@/lib/money";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function TenantHome({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const merchant = await prisma.merchant.findUnique({
    where: { slug },
    select: { id: true, name: true, isOpen: true },
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

  const products = await prisma.product.findMany({
    where: { merchantId: merchant.id, isActive: true },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      description: true,
      basePriceCents: true,
      imageUrl: true,
    },
  });

  return (
    <main>
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold">{merchant.name}</h1>
            <div className="mt-1 text-sm text-white/70">
              Status:{" "}
              <span className="text-white">{merchant.isOpen ? "Aberto" : "Fechado"}</span>
            </div>
          </div>
          <div className="text-sm text-white/70">Pedidos pelo iUai</div>
        </div>

        {!merchant.isOpen ? (
          <div className="mt-4 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-sm text-yellow-100">
            A lanchonete está fechada no momento. Volte mais tarde.
          </div>
        ) : null}

        <div className="mt-6 grid gap-3">
          {products.map((p) => (
            <Link
              key={p.id}
              href={`/t/${slug}/product/${p.id}`}
              className="block rounded-2xl border border-white/10 bg-black/20 p-4 hover:border-white/20"
            >
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-medium text-white">{p.name}</div>
                    <div className="text-sm text-white/80">
                      {formatBRLFromCents(p.basePriceCents)}
                    </div>
                  </div>
                  {p.description ? (
                    <div className="mt-1 text-sm text-white/70">{p.description}</div>
                  ) : null}
                </div>
                {p.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    className="h-16 w-16 rounded-xl object-cover border border-white/10"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-xl border border-white/10 bg-white/5" />
                )}
              </div>
            </Link>
          ))}
          {products.length === 0 ? (
            <div className="text-sm text-white/70">Nenhum produto ativo.</div>
          ) : null}
        </div>
      </div>
    </main>
  );
}

