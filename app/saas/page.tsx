import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

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
      subscriptionStatus: true,
      createdAt: true,
    },
  });

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-semibold">Pedidos ConectZ — Dono do SaaS</h1>
              <p className="mt-1 text-sm text-white/70">
                Visão rápida dos clientes (lanchonetes) cadastrados.
              </p>
            </div>
            <Link
              href="/admin"
              className="rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-xs"
            >
              Voltar ao painel
            </Link>
          </div>

          <div className="mt-6 overflow-auto rounded-xl border border-white/10">
            <table className="w-full text-sm">
              <thead className="bg-white/5 text-white/80">
                <tr>
                  <th className="p-3 text-left font-medium">Lanchonete</th>
                  <th className="p-3 text-left font-medium">Slug</th>
                  <th className="p-3 text-left font-medium">Aberto</th>
                  <th className="p-3 text-left font-medium">Assinatura</th>
                </tr>
              </thead>
              <tbody>
                {merchants.map((m) => (
                  <tr key={m.id} className="border-t border-white/10">
                    <td className="p-3 text-white">{m.name}</td>
                    <td className="p-3 text-white/80">{m.slug}</td>
                    <td className="p-3 text-white/80">{m.isOpen ? "Sim" : "Não"}</td>
                    <td className="p-3 text-white/80">
                      {m.subscriptionStatus ?? "—"}
                    </td>
                  </tr>
                ))}
                {merchants.length === 0 ? (
                  <tr>
                    <td className="p-3 text-white/70" colSpan={4}>
                      Nenhuma lanchonete cadastrada ainda.
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

