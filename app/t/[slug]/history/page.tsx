import { CustomerHistory } from "@/components/CustomerHistory";
import { prisma } from "@/lib/prisma";

export default async function HistoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const merchant = await prisma.merchant.findUnique({
    where: { slug },
    select: { id: true },
  });
  return (
    <main>
      <CustomerHistory merchantSlug={slug} merchantId={merchant?.id ?? null} />
    </main>
  );
}

