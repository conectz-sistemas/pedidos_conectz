import { OrderTracker } from "@/components/OrderTracker";

export default async function OrderPage({
  params,
}: {
  params: Promise<{ slug: string; publicCode: string }>;
}) {
  const { slug, publicCode } = await params;
  return (
    <main>
      <OrderTracker merchantSlug={slug} publicCode={publicCode} />
    </main>
  );
}

