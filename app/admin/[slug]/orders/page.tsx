import { AdminOrdersBoard } from "@/components/AdminOrdersBoard";
import { authOptions } from "@/lib/auth";
import { LogoutButton } from "@/components/LogoutButton";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage({
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

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-4 flex items-center justify-between gap-3 text-sm text-white/70">
          <div>
            {merchant.name} • <span className="text-white">Pedidos em tempo real</span>
          </div>
          <div className="flex items-center gap-2">
            <Link className="rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-xs" href="/admin">
              Voltar ao painel
            </Link>
            <LogoutButton />
          </div>
        </div>
        <AdminOrdersBoard merchantSlug={slug} />
      </div>
    </main>
  );
}

