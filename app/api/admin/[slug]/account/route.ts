import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role as string | undefined;
    const merchantId = (session?.user as any)?.merchantId as string | null | undefined;
    const userId = (session?.user as any)?.id as string | undefined;

    if (!session?.user?.email || !userId) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    if (role === "SUPERADMIN") {
      return NextResponse.json({ error: "O dono não pode excluir a conta pela aplicação." }, { status: 403 });
    }

    const { slug } = await params;
    const merchant = await prisma.merchant.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!merchant) {
      return NextResponse.json({ error: "Estabelecimento não encontrado" }, { status: 404 });
    }

    if (merchantId !== merchant.id) {
      return NextResponse.json({ error: "Sem permissão para excluir esta conta" }, { status: 403 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.order.deleteMany({ where: { merchantId: merchant.id } });
      await tx.product.deleteMany({ where: { merchantId: merchant.id } });
      await tx.ingredient.deleteMany({ where: { merchantId: merchant.id } });
      await tx.ingredientGroup.deleteMany({ where: { merchantId: merchant.id } });
      await tx.user.deleteMany({ where: { merchantId: merchant.id } });
      await tx.merchant.delete({ where: { id: merchant.id } });
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    const msg = e?.message ?? String(e);
    console.error("[delete-account] Erro:", msg);
    return NextResponse.json({ error: msg || "Erro ao excluir conta" }, { status: 500 });
  }
}
