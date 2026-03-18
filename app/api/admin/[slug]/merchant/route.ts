import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { z } from "zod";

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
    select: { id: true, name: true, isOpen: true },
  });
  if (!merchant) return NextResponse.json({ error: "Lanchonete não encontrada" }, { status: 404 });
  if (role !== "SUPERADMIN" && merchantId !== merchant.id) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }
  return NextResponse.json({ merchant });
}

const patchSchema = z.object({ isOpen: z.boolean() });

export async function PATCH(
  req: Request,
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

  const json = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Payload inválido" }, { status: 400 });

  const updated = await prisma.merchant.update({
    where: { id: merchant.id },
    data: { isOpen: parsed.data.isOpen },
    select: { id: true, isOpen: true },
  });
  return NextResponse.json({ ok: true, merchant: updated });
}

