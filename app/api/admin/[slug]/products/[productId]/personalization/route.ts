import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  defaultIngredients: z.array(
    z.object({
      ingredientId: z.string(),
      groupId: z.string().nullable(),
      isLocked: z.boolean(),
      isRemovable: z.boolean(),
      equivalenceIds: z.array(z.string()),
    })
  ),
  extras: z.array(
    z.object({
      ingredientId: z.string(),
      extraPriceCents: z.number().int().min(0),
    })
  ),
});

export async function POST(
  req: Request,
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
      select: { id: true },
    });
    if (!product) return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });

    const json = await req.json().catch(() => null);
    const parsed = schema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos", issues: parsed.error.issues }, { status: 400 });
    }

    let { defaultIngredients, extras } = parsed.data;
    // Dedupe extras por ingredientId (mantém o último)
    const seenExtra = new Set<string>();
    extras = extras.filter((e) => {
      if (seenExtra.has(e.ingredientId)) return false;
      seenExtra.add(e.ingredientId);
      return true;
    });

    await prisma.$transaction(async (tx) => {
      await tx.productIngredient.deleteMany({ where: { productId } });
      await tx.productExtra.deleteMany({ where: { productId } });

      for (let i = 0; i < defaultIngredients.length; i++) {
        const d = defaultIngredients[i];
        const pi = await tx.productIngredient.create({
          data: {
            productId,
            ingredientId: d.ingredientId,
            groupId: d.groupId,
            isLocked: d.isLocked,
            isRemovable: d.isLocked ? false : d.isRemovable,
            sortOrder: i,
          },
        });
        if (!d.isLocked && d.equivalenceIds.length > 0) {
          await tx.productIngredientEquivalence.createMany({
            data: d.equivalenceIds.map((equivalentIngredientId) => ({
              productIngredientId: pi.id,
              baseIngredientId: d.ingredientId,
              equivalentIngredientId,
            })),
            skipDuplicates: true,
          });
        }
      }

      for (let i = 0; i < extras.length; i++) {
        await tx.productExtra.create({
          data: {
            productId,
            ingredientId: extras[i].ingredientId,
            extraPriceCents: extras[i].extraPriceCents,
            isActive: true,
            sortOrder: i,
          },
        });
      }
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    const msg = e?.message ?? String(e);
    console.error("[personalization] Erro:", msg);
    return NextResponse.json({ error: msg || "Erro ao salvar" }, { status: 500 });
  }
}
