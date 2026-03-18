import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string; publicCode: string }> }
) {
  const { slug, publicCode } = await params;

  const merchant = await prisma.merchant.findUnique({
    where: { slug },
    select: { id: true },
  });
  if (!merchant) return NextResponse.json({ error: "Lanchonete não encontrada" }, { status: 404 });

  const order = await prisma.order.findFirst({
    where: { merchantId: merchant.id, publicCode },
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
  if (!order) return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
  return NextResponse.json({ order });
}

