import { prisma } from "@/lib/prisma";
import { makePublicCode, makePublicCodeFromCustomer } from "@/lib/publicCode";
import { NextResponse } from "next/server";
import { z } from "zod";

const orderSchema = z.object({
  customerName: z.string().min(1),
  customerWhatsApp: z.string().min(8),
  deliveryType: z.enum(["pickup", "delivery"]),
  address: z.string().optional(),
  paymentMethod: z.enum(["PIX", "CREDIT_CARD", "DEBIT_CARD", "CASH"]),
  paymentTiming: z.enum(["ON_ORDER", "ON_PICKUP_OR_DELIVERY"]),
  cashChangeForCents: z.number().int().positive().optional().nullable(),
  notes: z.string().optional(),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().min(1).max(50),
        notes: z.string().optional(),
        removed: z.array(z.object({ ingredientId: z.string(), name: z.string() })).default([]),
        substitutions: z
          .array(
            z.object({
              baseIngredientId: z.string(),
              baseName: z.string(),
              chosenIngredientId: z.string(),
              chosenName: z.string(),
            })
          )
          .default([]),
        extras: z
          .array(
            z.object({
              ingredientId: z.string(),
              name: z.string(),
              priceCents: z.number().int(),
              quantity: z.number().int().min(1).max(20).optional(),
            })
          )
          .default([]),
      })
    )
    .min(1),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const merchant = await prisma.merchant.findUnique({
    where: { slug },
    select: { id: true, isOpen: true },
  });
  if (!merchant) return NextResponse.json({ error: "Lanchonete não encontrada" }, { status: 404 });
  if (!merchant.isOpen) {
    return NextResponse.json({ error: "Lanchonete fechada no momento" }, { status: 400 });
  }

  const json = await req.json().catch(() => null);
  const parsed = orderSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Pedido inválido", issues: parsed.error.issues }, { status: 400 });
  }

  const data = parsed.data;
  if (data.deliveryType === "delivery" && !data.address?.trim()) {
    return NextResponse.json({ error: "Endereço é obrigatório para delivery" }, { status: 400 });
  }
  if (data.paymentMethod !== "CASH" && data.cashChangeForCents) {
    return NextResponse.json({ error: "Troco só faz sentido para dinheiro" }, { status: 400 });
  }

  // Carrega preços reais do catálogo para evitar manipulação do cliente
  const productIds = [...new Set(data.items.map((i) => i.productId))];
  const products = await prisma.product.findMany({
    where: { merchantId: merchant.id, id: { in: productIds }, isActive: true },
    select: { id: true, name: true, basePriceCents: true },
  });
  const productById = new Map(products.map((p) => [p.id, p]));

  // composição (ingredientes) + equivalências por produto, para validar remoções/trocas
  const ingredientsByProduct = await prisma.productIngredient.findMany({
    where: { productId: { in: productIds } },
    select: {
      productId: true,
      ingredientId: true,
      isLocked: true,
      isRemovable: true,
      ingredient: { select: { name: true } },
      equivalences: {
        select: { equivalentIngredientId: true, equivalentIngredient: { select: { name: true } } },
      },
    },
  });
  const compositionMap = new Map<
    string,
    Map<
      string,
      {
        isLocked: boolean;
        isRemovable: boolean;
        name: string;
        equivalences: Map<string, string>; // ingredientId -> name
      }
    >
  >();
  for (const row of ingredientsByProduct) {
    if (!compositionMap.has(row.productId)) compositionMap.set(row.productId, new Map());
    compositionMap.get(row.productId)!.set(row.ingredientId, {
      isLocked: row.isLocked,
      isRemovable: row.isRemovable,
      name: row.ingredient.name,
      equivalences: new Map(row.equivalences.map((e) => [e.equivalentIngredientId, e.equivalentIngredient.name])),
    });
  }

  // extras válidos por produto
  const extrasByProduct = await prisma.productExtra.findMany({
    where: { productId: { in: productIds }, isActive: true },
    select: { productId: true, ingredientId: true, extraPriceCents: true, ingredient: { select: { name: true } } },
  });
  const extrasMap = new Map<string, Map<string, { priceCents: number; name: string }>>();
  for (const e of extrasByProduct) {
    if (!extrasMap.has(e.productId)) extrasMap.set(e.productId, new Map());
    extrasMap.get(e.productId)!.set(e.ingredientId, { priceCents: e.extraPriceCents, name: e.ingredient.name });
  }

  let subtotalCents = 0;
  const orderItemsCreate: any[] = [];

  for (const it of data.items) {
    const p = productById.get(it.productId);
    if (!p) return NextResponse.json({ error: "Produto inválido no carrinho" }, { status: 400 });

    const allowedExtras = extrasMap.get(it.productId) ?? new Map();
    const extrasClean = it.extras
      .map((e) => {
        const allowed = allowedExtras.get(e.ingredientId);
        if (!allowed) return null;
        const qty = Math.max(1, Math.min(20, e.quantity ?? 1));
        return { ingredientId: e.ingredientId, name: allowed.name, priceCents: allowed.priceCents, quantity: qty };
      })
      .filter(Boolean) as { ingredientId: string; name: string; priceCents: number; quantity: number }[];

    const extrasSum = extrasClean.reduce((s, e) => s + e.priceCents * e.quantity, 0);
    subtotalCents += (p.basePriceCents + extrasSum) * it.quantity;

    const mods: any[] = [];
    const composition = compositionMap.get(it.productId) ?? new Map();

    for (const r of it.removed ?? []) {
      const base = composition.get(r.ingredientId);
      if (!base) {
        return NextResponse.json({ error: "Remoção inválida (ingrediente fora do produto)" }, { status: 400 });
      }
      if (base.isLocked) {
        return NextResponse.json({ error: "Remoção inválida (ingrediente travado)" }, { status: 400 });
      }
      if (!base.isRemovable) {
        return NextResponse.json({ error: "Remoção inválida (ingrediente obrigatório)" }, { status: 400 });
      }
      mods.push({ type: "REMOVE", baseIngredientName: base.name, priceDeltaCents: 0 });
    }

    for (const s of it.substitutions ?? []) {
      const base = composition.get(s.baseIngredientId);
      if (!base) {
        return NextResponse.json({ error: "Troca inválida (ingrediente fora do produto)" }, { status: 400 });
      }
      if (base.isLocked) {
        return NextResponse.json({ error: "Troca inválida (ingrediente travado)" }, { status: 400 });
      }
      const chosenName = base.equivalences.get(s.chosenIngredientId);
      if (!chosenName) {
        return NextResponse.json({ error: "Troca inválida (equivalente não permitido)" }, { status: 400 });
      }
      mods.push({
        type: "SUBSTITUTE",
        baseIngredientName: base.name,
        chosenIngredientName: chosenName,
        priceDeltaCents: 0,
      });
    }

    for (const e of extrasClean) {
      for (let i = 0; i < e.quantity; i++) {
        mods.push({
          type: "EXTRA",
          chosenIngredientName: e.name,
          priceDeltaCents: e.priceCents,
        });
      }
    }

    orderItemsCreate.push({
      productId: p.id,
      quantity: it.quantity,
      basePriceCents: p.basePriceCents,
      productName: p.name,
      notes: it.notes?.trim() ? it.notes.trim() : null,
      modifications: { create: mods },
    });
  }

  // gera publicCode: 2 primeiras letras do nome + 4 últimos dígitos do WhatsApp
  const baseCode = makePublicCodeFromCustomer(data.customerName, data.customerWhatsApp);
  let publicCode = baseCode;
  for (let tries = 0; tries < 10; tries++) {
    const exists = await prisma.order.findFirst({ where: { merchantId: merchant.id, publicCode } });
    if (!exists) break;
    // Em caso raro de colisão, adiciona um sufixo curto.
    publicCode = `${baseCode}${String.fromCharCode("A".charCodeAt(0) + tries)}`;
  }
  // fallback: ainda colidiu (extremamente improvável), gera aleatório
  const stillExists = await prisma.order.findFirst({ where: { merchantId: merchant.id, publicCode } });
  if (stillExists) {
    publicCode = makePublicCode();
  }

  const created = await prisma.order.create({
    data: {
      merchantId: merchant.id,
      publicCode,
      customerName: data.customerName.trim(),
      customerWhatsApp: data.customerWhatsApp.trim(),
      deliveryType: data.deliveryType,
      address: data.deliveryType === "delivery" ? data.address!.trim() : null,
      paymentMethod: data.paymentMethod,
      paymentTiming: data.paymentTiming,
      cashChangeForCents: data.paymentMethod === "CASH" ? data.cashChangeForCents ?? null : null,
      subtotalCents,
      totalCents: subtotalCents,
      notes: data.notes?.trim() ? data.notes.trim() : null,
      items: { create: orderItemsCreate },
    },
    select: { publicCode: true },
  });

  return NextResponse.json({
    ok: true,
    publicCode: created.publicCode,
    merchantId: merchant.id,
  });
}

