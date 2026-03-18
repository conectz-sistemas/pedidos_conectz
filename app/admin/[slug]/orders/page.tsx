import { AdminOrdersBoard } from "@/components/AdminOrdersBoard";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const merchant = await prisma.merchant.findUnique({
    where: { slug },
    select: { name: true },
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

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-4 flex items-center justify-between gap-3 text-sm text-white/70">
          <div>
            {merchant.name} • <span className="text-white">Pedidos em tempo real</span>
          </div>
          <Link className="rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-xs" href="/admin">
            Voltar ao painel
          </Link>
        </div>
        <AdminOrdersBoard merchantSlug={slug} />
      </div>
    </main>
  );
}

