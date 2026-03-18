import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { z } from "zod";

const bodySchema = z.object({
  status: z.enum([
    "NEW",
    "CONFIRMED",
    "PREPARING",
    "READY",
    "OUT_FOR_DELIVERY",
    "COMPLETED",
    "CANCELED",
  ]),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string; orderId: string }> }
) {
  const { slug, orderId } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const role = (session.user as any).role as string | undefined;
  const merchantId = (session.user as any).merchantId as string | null | undefined;

  const merchant = await prisma.merchant.findUnique({
    where: { slug },
    select: { id: true, cancellationFeeCents: true },
  });
  if (!merchant) return NextResponse.json({ error: "Lanchonete não encontrada" }, { status: 404 });

  if (role !== "SUPERADMIN" && merchantId !== merchant.id) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Payload inválido" }, { status: 400 });

  const current = await prisma.order.findFirst({
    where: { id: orderId, merchantId: merchant.id },
    select: { id: true, status: true, subtotalCents: true, cancellationFeeCents: true },
  });
  if (!current) return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });

  const nextStatus = parsed.data.status;

  const dataUpdate: any = { status: nextStatus };

  // Se cancelou depois de confirmado, registra taxa (MVP: só registro; cobrança real depende de regras/legislação)
  const wasConfirmed = ["CONFIRMED", "PREPARING", "READY", "OUT_FOR_DELIVERY", "COMPLETED"].includes(
    current.status
  );
  if (nextStatus === "CANCELED" && wasConfirmed && current.cancellationFeeCents === 0) {
    dataUpdate.cancellationFeeCents = merchant.cancellationFeeCents;
    dataUpdate.totalCents = current.subtotalCents + merchant.cancellationFeeCents;
  }

  const updated = await prisma.order.update({
    where: { id: current.id },
    data: dataUpdate,
    select: { id: true, status: true, cancellationFeeCents: true, totalCents: true },
  });

  return NextResponse.json({ ok: true, order: updated });
}

