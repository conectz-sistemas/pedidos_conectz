import Link from "next/link";

export default async function TenantLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-white/10 bg-black/40 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
          <Link className="font-semibold" href={`/t/${slug}`}>
            Pedidos ConectZ
          </Link>
          <div className="flex items-center gap-2">
            <Link
              className="btn"
              href={`/t/${slug}/history`}
            >
              Meus pedidos
            </Link>
            <Link
              className="btn"
              href={`/t/${slug}/cart`}
            >
              Carrinho
            </Link>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-3xl px-4 py-6">{children}</div>
    </div>
  );
}

