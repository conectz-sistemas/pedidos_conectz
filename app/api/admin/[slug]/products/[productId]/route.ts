import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ slug: string; productId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role as string | undefined;
    const merchantId = (session?.user as any)?.merchantId as string | null | undefined;
    if (!session?.user?.email) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const { slug, productId } = await params;
    const merchant = await prisma.merchant.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!merchant) return NextResponse.json({ error: "Lanchonete não encontrada" }, { status: 404 });
    if (role !== "SUPERADMIN" && merchantId !== merchant.id) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    const product = await prisma.product.findFirst({
      where: { id: productId, merchantId: merchant.id },
      select: { id: true, _count: { select: { orderItems: true } } },
    });
    if (!product) return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });

    if (product._count.orderItems > 0) {
      return NextResponse.json(
        { error: "Não é possível excluir: há pedidos vinculados a este produto." },
        { status: 400 }
      );
    }

    await prisma.product.delete({ where: { id: productId } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    const msg = e?.message ?? String(e);
    console.error("[delete-product] Erro:", msg);
    return NextResponse.json({ error: msg || "Erro ao excluir" }, { status: 500 });
  }
}
