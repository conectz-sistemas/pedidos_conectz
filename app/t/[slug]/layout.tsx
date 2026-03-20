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
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-2 px-3 py-2 sm:gap-3 sm:px-4 sm:py-3">
          <Link className="truncate font-semibold text-sm sm:text-base min-w-0" href={`/t/${slug}`}>
            Pedidos ConectZ
          </Link>
          <div className="flex items-center gap-2 flex-shrink-0">
            {isMerchantViewingOwnMenu ? (
              <Link className="btn btn-sm" href="/admin">
                Painel
              </Link>
            ) : null}
            <Link
              className="btn btn-sm btn-ghost"
              href={`/t/${slug}/history`}
            >
              Histórico
            </Link>
            <Link className="btn btn-sm btn-primary" href={`/t/${slug}/cart`}>
              Carrinho
            </Link>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-3xl px-3 py-4 sm:px-4 sm:py-6">{children}</div>
    </div>
  );
}

