import { CustomerHistory } from "@/components/CustomerHistory";

export default async function HistoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <main>
      <CustomerHistory merchantSlug={slug} />
    </main>
  );
}

