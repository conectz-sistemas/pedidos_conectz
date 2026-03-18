import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { z } from "zod";

const bodySchema = z.object({
  merchantSlug: z.string().min(1),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const role = (session.user as any).role as string | undefined;
  const merchantId = (session.user as any).merchantId as string | null | undefined;

  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Payload inválido" }, { status: 400 });

  const merchant = await prisma.merchant.findUnique({
    where: { slug: parsed.data.merchantSlug },
    select: { id: true, name: true, slug: true, stripeCustomerId: true },
  });
  if (!merchant) return NextResponse.json({ error: "Lanchonete não encontrada" }, { status: 404 });
  if (role !== "SUPERADMIN" && merchantId !== merchant.id) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const priceId = process.env.STRIPE_PRICE_ID_BRL_4990;
  if (!priceId) {
    return NextResponse.json(
      { error: "Stripe não configurado (STRIPE_SECRET_KEY/STRIPE_PRICE_ID_BRL_4990)" },
      { status: 500 }
    );
  }

  const stripe = getStripe();

  const customerId =
    merchant.stripeCustomerId ??
    (await stripe.customers.create({
      name: merchant.name,
      metadata: { merchantId: merchant.id, merchantSlug: merchant.slug },
    })).id;

  if (!merchant.stripeCustomerId) {
    await prisma.merchant.update({
      where: { id: merchant.id },
      data: { stripeCustomerId: customerId },
    });
  }

  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  const checkout = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${baseUrl}/admin?sub=success`,
    cancel_url: `${baseUrl}/admin?sub=cancel`,
    metadata: { merchantId: merchant.id, merchantSlug: merchant.slug },
    subscription_data: {
      metadata: { merchantId: merchant.id, merchantSlug: merchant.slug },
    },
  });

  return NextResponse.json({ ok: true, url: checkout.url });
}

