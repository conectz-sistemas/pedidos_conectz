import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ publicCode: string }> }
) {
  const { publicCode } = await params;
  // Compatibilidade: com multi-tenant, o publicCode é único por lanchonete.
  // Prefira /api/t/[slug]/orders/[publicCode]
  const orders = await prisma.order.findMany({
    where: { publicCode },
    take: 2,
    select: {
      publicCode: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      customerName: true,
      deliveryType: true,
      paymentMethod: true,
      paymentTiming: true,
      cashChangeForCents: true,
      totalCents: true,
      merchant: { select: { slug: true, name: true } },
    },
  });
  if (orders.length === 0) return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
  if (orders.length > 1) {
    return NextResponse.json(
      { error: "Código ambíguo. Use a URL da lanchonete (/t/{slug}/order/{codigo})." },
      { status: 400 }
    );
  }
  return NextResponse.json({ order: orders[0] });
}

