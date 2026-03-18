import { CheckoutForm } from "@/components/CheckoutForm";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const merchant = await prisma.merchant.findUnique({
    where: { slug },
    select: { name: true, isOpen: true },
  });

  if (!merchant) {
    return (
      <main>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          Lanchonete não encontrada.
        </div>
      </main>
    );
  }

  return (
    <main>
      <CheckoutForm
        merchantSlug={slug}
        merchantName={merchant.name}
        isOpen={merchant.isOpen}
      />
    </main>
  );
}

