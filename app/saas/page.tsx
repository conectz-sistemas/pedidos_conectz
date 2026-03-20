import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/LogoutButton";
import { SaasMerchantActions } from "@/components/SaasMerchantActions";

export const dynamic = "force-dynamic";

function formatDate(d: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

function statusLabel(isActive: boolean, isBlocked: boolean) {
  if (isBlocked) return { label: "Bloqueado", cls: "text-red-400" };
  if (!isActive) return { label: "Pendente", cls: "text-yellow-400" };
  return { label: "Ativo", cls: "text-green-400" };
}

export default async function SaasPage() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role as string | undefined;
  if (!session?.user?.email) redirect("/admin/login?next=/saas");
  if (role !== "SUPERADMIN") redirect("/admin");

  const merchants = await prisma.merchant.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      slug: true,
      isOpen: true,
      isActive: true,
      isBlocked: true,
      subscriptionStatus: true,
      createdAt: true,
      admins: {
        take: 1,
        select: { email: true, emailVerifiedAt: true },
      },
    },
  });

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-semibold">Pedidos ConectZ — Dono do SaaS</h1>
              <p className="mt-1 text-sm text-white/70">
                Gerencie os estabelecimentos: aprove pendentes, bloqueie ou desbloqueie o acesso.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/admin"
                className="rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-xs"
              >
                Voltar ao painel
              </Link>
              <LogoutButton />
            </div>
          </div>

          <div className="mt-6 overflow-auto rounded-xl border border-white/10">
            <table className="w-full text-sm">
              <thead className="bg-white/5 text-white/80">
                <tr>
                  <th className="p-3 text-left font-medium">Estabelecimento</th>
                  <th className="p-3 text-left font-medium">Slug</th>
                  <th className="p-3 text-left font-medium">Cadastro</th>
                  <th className="p-3 text-left font-medium">Email verificado</th>
                  <th className="p-3 text-left font-medium">Status</th>
                  <th className="p-3 text-left font-medium">Assinatura</th>
                  <th className="p-3 text-left font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {merchants.map((m) => {
                  const st = statusLabel(m.isActive, m.isBlocked);
                  return (
                    <tr key={m.id} className="border-t border-white/10">
                      <td className="p-3 text-white">{m.name}</td>
                      <td className="p-3 text-white/80">
                        <Link href={`/t/${m.slug}`} className="underline hover:text-white" target="_blank">
                          {m.slug}
                        </Link>
                      </td>
                      <td className="p-3 text-white/80">{formatDate(m.createdAt)}</td>
                      <td className="p-3 text-white/80">
                        {m.admins[0]?.emailVerifiedAt ? (
                          <span className="text-green-400">Sim</span>
                        ) : (
                          <span className="text-yellow-400">Não</span>
                        )}
                      </td>
                      <td className={`p-3 ${st.cls}`}>{st.label}</td>
                      <td className="p-3 text-white/80">
                        {m.subscriptionStatus ?? "—"}
                      </td>
                      <td className="p-3">
                        <SaasMerchantActions
                          merchantId={m.id}
                          merchantName={m.name}
                          isActive={m.isActive}
                          isBlocked={m.isBlocked}
                        />
                      </td>
                    </tr>
                  );
                })}
                {merchants.length === 0 ? (
                  <tr>
                    <td className="p-3 text-white/70" colSpan={7}>
                      Nenhum estabelecimento cadastrado ainda.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}

