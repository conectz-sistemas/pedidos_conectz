import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { BillingButton } from "@/components/BillingButton";

export const dynamic = "force-dynamic";

export default async function BillingPage({
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
    select: { id: true, name: true, subscriptionStatus: true },
  });
  if (!merchant) {
    return (
      <main className="min-h-screen p-6">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">Lanchonete não encontrada.</div>
      </main>
    );
  }
  if (role !== "SUPERADMIN" && merchantId !== merchant.id) {
    return (
      <main className="min-h-screen p-6">
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-red-100">Sem permissão.</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-2xl rounded-2xl border border-white/10 bg-white/5 p-6">
        <h1 className="text-xl font-semibold">Assinatura</h1>
        <p className="mt-1 text-sm text-white/70">{merchant.name}</p>

        <div className="mt-6 rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-white/80">
          Status atual: <span className="text-white">{merchant.subscriptionStatus ?? "—"}</span>
        </div>

        <div className="mt-4">
          <BillingButton merchantSlug={slug} />
        </div>

        <div className="mt-4 text-xs text-white/60">
          MVP: o Stripe atualiza o status via webhook. Para rodar local, use Stripe CLI (ver README).
        </div>
      </div>
    </main>
  );
}

