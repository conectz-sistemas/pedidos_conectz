import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import Link from "next/link";
import { LogoutButton } from "@/components/LogoutButton";
import { MerchantOpenCloseToggle } from "@/components/MerchantOpenCloseToggle";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role as string | undefined;
  const merchantId = (session?.user as any)?.merchantId as string | null | undefined;

  if (!session?.user?.email) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="text-white/80">Você precisa entrar.</div>
      </main>
    );
  }

  const merchant = merchantId
    ? await prisma.merchant.findUnique({
        where: { id: merchantId },
        select: { id: true, name: true, slug: true, isOpen: true, subscriptionStatus: true, isActive: true, isBlocked: true },
      })
    : null;

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold">Painel</h1>
              <p className="mt-1 text-sm text-white/70">
                Logado como <span className="text-white">{session.user.email}</span>
              </p>
            </div>

            <div className="flex items-center gap-3">
              {role === "SUPERADMIN" ? (
                <Link
                  className="rounded-xl border border-white/25 bg-white/10 px-3 py-1.5 text-xs text-white"
                  href="/saas"
                >
                  Dono do SaaS
                </Link>
              ) : null}

              <LogoutButton />

              {merchant && role !== "SUPERADMIN" ? (
                <MerchantOpenCloseToggle
                  merchantSlug={merchant.slug}
                  initialIsOpen={merchant.isOpen}
                />
              ) : null}
            </div>
          </div>

          <div className="mt-6 grid gap-3 text-sm text-white/80">
            {merchant && !merchant.isActive ? (
              <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-yellow-100">
                Seu estabelecimento está aguardando aprovação do administrador. Entre em contato com o suporte.
              </div>
            ) : merchant && merchant.isBlocked ? (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-100">
                O acesso ao seu estabelecimento está bloqueado. Entre em contato com o suporte.
              </div>
            ) : null}
            {merchant && merchant.isActive && !merchant.isBlocked ? (
              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <div className="font-medium text-white">{merchant.name}</div>
                <div className="mt-1 text-white/70">
                  Slug: <span className="text-white">{merchant.slug}</span>
                </div>
                <div className="mt-1 text-white/70">
                  Aberto: <span className="text-white">{merchant.isOpen ? "Sim" : "Não"}</span>
                </div>
                <div className="mt-1 text-white/70">
                  Assinatura:{" "}
                  <span className="text-white">{merchant.subscriptionStatus ?? "não vinculada"}</span>
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  <Link
                    className="btn btn-primary"
                    href={`/admin/${merchant.slug}/orders`}
                  >
                    Pedidos
                  </Link>
                  <Link className="btn" href={`/admin/${merchant.slug}/catalog`}>
                    Cardápio
                  </Link>
                  <Link className="btn" href={`/admin/${merchant.slug}/billing`}>
                    Assinatura
                  </Link>
                  <Link className="btn" href={`/t/${merchant.slug}`}>
                    Abrir cardápio do cliente
                  </Link>
                </div>
              </div>
            ) : !merchant ? (
              <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-yellow-100">
                Seu usuário não está vinculado a nenhuma lanchonete ainda.
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </main>
  );
}

