import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role as string | undefined;
    const sessionMerchantId = (session?.user as any)?.merchantId as string | null | undefined;
    if (!session?.user?.email) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const { slug, id } = await params;
    const merchant = await prisma.merchant.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!merchant) return NextResponse.json({ error: "Lanchonete não encontrada" }, { status: 404 });
    if (role !== "SUPERADMIN" && sessionMerchantId !== merchant.id) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    const group = await prisma.ingredientGroup.findFirst({
      where: { id, merchantId: merchant.id },
      select: { id: true },
    });
    if (!group) return NextResponse.json({ error: "Grupo não encontrado" }, { status: 404 });

    await prisma.$transaction([
      prisma.ingredient.updateMany({ where: { groupId: id }, data: { groupId: null } }),
      prisma.productIngredient.updateMany({ where: { groupId: id }, data: { groupId: null } }),
      prisma.ingredientGroup.delete({ where: { id } }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    const msg = e?.message ?? String(e);
    console.error("[delete-ingredient-group] Erro:", msg);
    return NextResponse.json({ error: msg || "Erro ao excluir" }, { status: 500 });
  }
}
