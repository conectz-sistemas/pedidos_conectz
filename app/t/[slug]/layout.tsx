import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import Link from "next/link";

export default async function TenantLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await getServerSession(authOptions);
  const merchantId = (session?.user as any)?.merchantId as string | null | undefined;

  const merchant = await prisma.merchant.findUnique({
    where: { slug },
    select: { id: true },
  });
  const isMerchantViewingOwnMenu = !!merchant && merchantId === merchant.id;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-white/10 bg-black/40 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
          <Link className="font-semibold" href={`/t/${slug}`}>
            Pedidos ConectZ
          </Link>
          <div className="flex items-center gap-2">
            {isMerchantViewingOwnMenu ? (
              <Link className="btn" href="/admin">
                Voltar ao painel
              </Link>
            ) : null}
            <Link className="btn" href={`/t/${slug}/history`}>
              Meus pedidos
            </Link>
            <Link className="btn" href={`/t/${slug}/cart`}>
              Carrinho
            </Link>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-3xl px-4 py-6">{children}</div>
    </div>
  );
}

