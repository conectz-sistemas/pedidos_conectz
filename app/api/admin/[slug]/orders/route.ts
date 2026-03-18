import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const role = (session.user as any).role as string | undefined;
  const merchantId = (session.user as any).merchantId as string | null | undefined;

  const merchant = await prisma.merchant.findUnique({
    where: { slug },
    select: { id: true },
  });
  if (!merchant) return NextResponse.json({ error: "Lanchonete não encontrada" }, { status: 404 });

  if (role !== "SUPERADMIN" && merchantId !== merchant.id) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const orders = await prisma.order.findMany({
    where: { merchantId: merchant.id },
    orderBy: { createdAt: "desc" },
    take: 30,
    select: {
      id: true,
      publicCode: true,
      status: true,
      customerName: true,
      customerWhatsApp: true,
      deliveryType: true,
      paymentMethod: true,
      paymentTiming: true,
      cashChangeForCents: true,
      totalCents: true,
      notes: true,
      createdAt: true,
      items: {
        select: {
          id: true,
          quantity: true,
          productName: true,
          notes: true,
          modifications: { select: { id: true, type: true, baseIngredientName: true, chosenIngredientName: true, priceDeltaCents: true } },
        },
      },
    },
  });

  return NextResponse.json({ orders });
}

