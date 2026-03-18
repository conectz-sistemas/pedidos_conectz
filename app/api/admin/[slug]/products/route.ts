import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1).max(80),
  basePrice: z.number().finite().positive(),
  description: z.string().optional().nullable(),
});

export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role as string | undefined;
  const sessionMerchantId = (session?.user as any)?.merchantId as string | null | undefined;
  if (!session?.user?.email) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { slug } = await params;
  const merchant = await prisma.merchant.findUnique({ where: { slug }, select: { id: true } });
  if (!merchant) return NextResponse.json({ error: "Lanchonete não encontrada" }, { status: 404 });
  if (role !== "SUPERADMIN" && sessionMerchantId !== merchant.id) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos", issues: parsed.error.issues }, { status: 400 });
  }

  const created = await prisma.product.create({
    data: {
      merchantId: merchant.id,
      name: parsed.data.name.trim(),
      description: parsed.data.description?.trim() ? parsed.data.description.trim() : null,
      basePriceCents: Math.round(parsed.data.basePrice * 100),
      imageUrl: null,
      isActive: true,
    },
    select: { id: true },
  });

  return NextResponse.json({ ok: true, productId: created.id });
}

