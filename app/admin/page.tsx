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
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl font-semibold">Painel</h1>
              <p className="mt-1 truncate text-sm text-white/70 max-w-[200px] sm:max-w-none">
                Logado como <span className="text-white">{session.user.email}</span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
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

                <div className="mt-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                  <Link
                    className="btn btn-primary text-center"
                    href={`/admin/${merchant.slug}/orders`}
                  >
                    Pedidos
                  </Link>
                  <Link className="btn text-center" href={`/admin/${merchant.slug}/catalog`}>
                    Cardápio
                  </Link>
                  <Link className="btn text-center col-span-2 sm:col-span-1" href={`/admin/${merchant.slug}/billing`}>
                    Assinatura
                  </Link>
                  <Link className="btn text-center col-span-2" href={`/t/${merchant.slug}`}>
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

